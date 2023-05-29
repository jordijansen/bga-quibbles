<?php

trait StateTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    //////////////////////////////////////////////////////////////////////////////
    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stPlayerTurn() {
        $playerId = intval($this->getActivePlayerId());

        if ($this->getGlobalVariable(UNDO) == null) {
            $this->saveForUndo($playerId);
        }
    }

    function stNextPlayer() {
        $cardsInDisplay = $this->cardManager->getCardsInLocation(ZONE_DISPLAY);
        $cardIdsInDisplay = array_map(fn($card) => $card->id, $cardsInDisplay);
        if (sizeof($cardIdsInDisplay) >= 10) {
            $this->cardManager->moveCards($cardIdsInDisplay, ZONE_DISCARD);
            self::notifyAllPlayers('displayDiscarded', clienttranslate("Cards in display discarded because there can't be more than 9 cards in the display"), [
                'cardsDiscarded' => $this->cardManager->getCards($cardIdsInDisplay)
            ]);
        }

        if (sizeof($this->cardManager->getCardsInLocation(ZONE_DISPLAY)) < DISPLAY_CARD_SIZE) {
            $cardsInDisplay = $this->cardManager->fillDisplay();
            self::notifyAllPlayers('displayRefilled', clienttranslate("Card display refilled"), [
                'deckCount' => $this->cardManager->countCardsInLocation(ZONE_DECK),
                'displayCards' => $cardsInDisplay
            ]);
        }
        
        // If the active player has emptied their hand, all players have to discard their hands and get 3 new cards.
        if ($this->cardManager->countCardsInLocation(ZONE_PLAYER_HAND, $this->getActivePlayerId()) == 0) {
            self::notifyAllPlayers('handEmptied', clienttranslate('${player_name} has emptied their hand, all other players discard their hand'), [
                'playerId' => $this->getActivePlayerId(),
                'player_name' => $this->getPlayerName($this->getActivePlayerId())
            ]);

            $players = $this->loadPlayersBasicInfos();
            foreach( $players as $playerId => $player )
            {
                $cardsInHand = $this->cardManager->getCardsInLocation(ZONE_PLAYER_HAND, $playerId);
                $cardIdsInHand = array_map(fn($card) => $card->id, $cardsInHand);
                $cardsDrawn = $this->cardManager->dealCardsToPlayer($playerId, INITIAL_HAND_SIZE);

                $logMessage = clienttranslate('${player_name} draws ${handCount} new cards');
                if (sizeof($cardsInHand) > 0) {
                    $this->cardManager->moveCards($cardIdsInHand, ZONE_DISCARD);
                    $logMessage = clienttranslate('${player_name} discards ${cardSet} and draws ${handCount} new cards');
                }

                self::notifyAllPlayers('handDiscarded', $logMessage, [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'cardsDiscarded' => $this->cardManager->getCards($cardIdsInHand),
                    'handCount' => $this->cardManager->countCardsInLocation(ZONE_PLAYER_HAND, $playerId),
                    'cardSet' => array_map(fn($card) => (int) $card->type, $cardsInHand)
                ]);

                self::notifyPlayer($playerId, 'cardsDrawn', '', [
                    'playerId' => $playerId,
                    'cardsDrawn' => $cardsDrawn
                ]);
            }
        }

        $this->deleteGlobalVariables([UNDO, TAKE]);
        $this->setGameStateValue(CANCELLABLE_MOVES, 0);

        $this->activeNextPlayer();
        $playerId = $this->getActivePlayerId();

        $this->giveExtraTime($playerId);

        $endGame = sizeof($this->getCollectionFromDB("SELECT player_id FROM player WHERE player_score >= " . WINNING_SCORE)) > 0;

        $this->gamestate->nextState($endGame ? ST_GAME_END : ST_PLAYER_TURN);

    }

}