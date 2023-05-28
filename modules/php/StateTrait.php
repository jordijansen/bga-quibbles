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

        $cardsInDisplay = $this->cardManager->fillDisplay();
        self::notifyAllPlayers('displayRefilled', clienttranslate("Card display refilled"), [
            'deckCount' => $this->cardManager->countCardsInLocation(ZONE_DECK),
            'displayCards' => $cardsInDisplay
        ]);

        // TODO If your hand is empty, all players have to discard the cards they hold in their hands. Deal every player a hand of 3 new cards.
        // TODO Note: if the draw pile is empty, shuffle the discard pile and form a new pile.

        $this->deleteGlobalVariables([UNDO, TAKE]);
        $this->setGameStateValue(CANCELLABLE_MOVES, 0);

        $this->activeNextPlayer();
        $playerId = $this->getActivePlayerId();

        $this->giveExtraTime($playerId);

        $endGame = sizeof($this->getCollectionFromDB("SELECT player_id FROM player WHERE player_score >= 21")) > 0;

        $this->gamestate->nextState($endGame ? ST_GAME_END : ST_PLAYER_TURN);

    }

}