<?php

use objects\Take;

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

   public function chooseAction(string $action) {
       self::checkAction(ACT_CHOOSE_ACTION);

       $this->incGameStateValue(CANCELLABLE_MOVES, 1);

       switch ($action) {
           case "take":
           case "pass":
               $this->gamestate->nextState($action);
               break;
           default:
               throw new BgaUserException("Unknown action provided for chooseAction");
       }
   }

   public function undoLastMoves() {
       self::checkAction(ACT_CANCEL);

       $playerId = intval($this->getActivePlayerId());
       $undo = $this->getGlobalVariable(UNDO);

       $this->notifyPlayer($playerId, 'cancelLastMoves', '', [
           'displayCards' => $this->cardManager->getCards($undo->displayCardIds),
       ]);

       $this->setGameStateValue(CANCELLABLE_MOVES, 0);
       $this->deleteGlobalVariable(UNDO);

       $this->gamestate->jumpToState(ST_PLAYER_TURN_ID);
   }

   public function takeConfirmDiscard(array $cardIds) {
       self::checkAction(ACT_TAKE_CONFIRM_DISCARD);

       $playerId = intval($this->getActivePlayerId());

       if (sizeof($cardIds) == 0) {
           throw new BgaUserException(clienttranslate("You need to select between 1 to 6 cards"));
       }

       $cards = $this->cardManager->getCards($cardIds);
       $totalDiscardedValue = array_sum(array_map(fn($card) => (int) $card->type, array_values($cards)));
       if ($totalDiscardedValue > 6) {
           throw new BgaUserException("Total selected value is higher than 6");
       }

       $this->setGlobalVariable(TAKE, new Take($totalDiscardedValue, $cards));

       $this->notifyPlayer($playerId, 'takeDiscardConfirmed', '', [
           'cards' => $cards
       ]);

       $this->gamestate->nextState(ACT_TAKE_CONFIRM_DISCARD);
   }

   public function takeConfirm(array $selectedCards) {
       self::checkAction(ACT_CONFIRM);

       $playerId = intval($this->getActivePlayerId());

       if (sizeof($selectedCards) == 0) {
           throw new BgaUserException(clienttranslate("You need to TAKE card(s) from the display. Or PASS"));
       }

       $take = $this->getGlobalVariable(TAKE);
       // If multiple cards will be discarded, each set should consist of 1 card. That matches the totalDiscardValue
       $isSingleCardDiscard = sizeof($take->cardsToDiscard) == 1;

       $cardsTaken = [];
       foreach($selectedCards as $set) {
           if (sizeof($set) == 0) {
               throw new BgaUserException(clienttranslate("You need to TAKE card(s) from the display. Or PASS"));
           }

           // Some of these errors are not translated as this should be prevented in the UI
           if ($isSingleCardDiscard && sizeof($set) <= 1) {
               throw new BgaUserException("You need to select sets of card(s) to take");
           } else if (!$isSingleCardDiscard && sizeof($set) != 1) {
               throw new BgaUserException("You need to select single card(s) to take");
           }

           $cardsInSet = $this->cardManager->getCards($set);
           $setValue = array_sum(array_map(fn($card) => (int) $card->type, $cardsInSet));
           if ($setValue != $take->totalDiscardValue) {
               throw new BgaUserException("Set value does not match total discarded value");
           }

           $this->cardManager->moveCards($set, ZONE_PLAYER_HAND, $playerId);
           $cardsTaken[] = $this->cardManager->getCards($set);
       }

       $cardsToDiscardIds = array_map(fn($card) => $card->id, $take->cardsToDiscard);
       $this->cardManager->moveCards($cardsToDiscardIds, ZONE_DISCARD);
       $cardsDiscarded = $this->cardManager->getCards($cardsToDiscardIds);

       self::notifyAllPlayers('takeConfirmed', clienttranslate('${player_name} discards ${cardSet} and takes ${cardSets}'), [
           'playerId' => $playerId,
           'player_name' => $this->getPlayerName($playerId),
           'handCount' => $this->cardManager->countCardsInLocation('hand', $playerId),
           'cardsDiscarded' => $cardsDiscarded,
           'cardsTaken' => array_merge(...$cardsTaken),
           'cardSet' => array_map(fn($card) => (int) $card->type, $cardsDiscarded),
           'cardSets' => array_map(fn($set) => array_map(fn($card) => (int) $card->type, $set), $cardsTaken)
       ]);

       $this->setGameStateValue(CANCELLABLE_MOVES, 0);
       $this->deleteGlobalVariable(UNDO);
       $this->deleteGlobalVariable(TAKE);

       $this->gamestate->nextState(ACT_CONFIRM);
   }

   public function endTurn() {
       self::checkAction(ACT_END_TURN);

       $this->gamestate->nextState(ST_NEXT_PLAYER);
   }

    public function addCardToCollection($type, $cardIdToDiscard) {
        self::checkAction(ACT_ADD_COLLECTION);

        $playerId = intval($this->getActivePlayerId());
        $cardIdsToDiscard = [];
        $cardsInCollection = $this->cardManager->getCardsInLocation(ZONE_PLAYER_AREA, $playerId);
        if (sizeof($cardsInCollection) == 6) {
            if (isset($cardIdToDiscard)) {
                $cardToDiscard = $this->cardManager->getCard($cardIdToDiscard);
                if ($cardToDiscard->location != ZONE_PLAYER_AREA || $cardToDiscard->location_arg != $playerId) {
                    throw new BgaUserException("Provided card to discard is not in your collection");
                }
                $cardIdsToDiscard = [$cardToDiscard->id];
            } else {
                throw new BgaUserException("You already have 6 cards in your collection, you need to discard a card to add a new one");
            }
        }

        $cardsOfTypeInHand = $this->cardManager->getCardsOfTypeInLocation($type, ZONE_PLAYER_HAND, $playerId);
        if (sizeof($cardsOfTypeInHand) == 0 || sizeof($cardsOfTypeInHand) < $type) {
            throw new BgaUserException("You don't have enough cards to add a ${$type} to your collection");
        }

        $cardToAdd = reset($cardsOfTypeInHand);
        $cardsToDiscard = array_slice(array_values($cardsOfTypeInHand), 1, $type - 1);
        $cardIdsToDiscard = [...$cardIdsToDiscard, ...array_map(fn($card) => $card->id, $cardsToDiscard)];

        $this->cardManager->moveCards($cardIdsToDiscard, ZONE_DISCARD);
        $this->cardManager->moveCard($cardToAdd->id, ZONE_PLAYER_AREA, $playerId);

        $playerScore = array_sum(array_map(fn($card) => (int) $card->type, array_values($this->cardManager->getCardsInLocation(ZONE_PLAYER_AREA, $playerId))));
        $this->DbQuery("UPDATE player SET player_score = $playerScore WHERE player_id = $playerId");

        self::notifyAllPlayers('cardAddedToCollection', clienttranslate('${player_name} adds ${cardSet} to their collection'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'handCount' => $this->cardManager->countCardsInLocation('hand', $playerId),
            'playerScore' => $playerScore,
            'cardsDiscarded' => $this->cardManager->getCards($cardIdsToDiscard),
            'cardCollected' => $this->cardManager->getCard($cardToAdd->id),
            'cardSet' => $cardToAdd->type
        ]);

        $this->gamestate->nextState(ST_NEXT_PLAYER);
    }

    public function pass($cardId) {
        self::checkAction(ACT_PASS);

        $playerId = intval($this->getActivePlayerId());

        if (!isset($cardId)) {
            throw new BgaUserException(clienttranslate("You need to select a card from your hand to add to the display"));
        }

        $card = $this->cardManager->getCard($cardId);
        if ($card->location != ZONE_PLAYER_HAND || $card->location_arg != $playerId) {
            throw new BgaUserException("Provided card is not in your hand");
        }

        $this->cardManager->moveCard($card->id, ZONE_DISPLAY);
        $cardsDrawn = $this->cardManager->dealCardsToPlayer($playerId, PASS_ACTION_NR_OF_CARDS_TO_DRAW);

        self::notifyAllPlayers('passConfirmed', clienttranslate('${player_name} passes and adds ${cardSet} to the display and draws ${nrOfCardsDrawn} cards'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'handCount' => $this->cardManager->countCardsInLocation('hand', $playerId),
            'deckCount' => $this->cardManager->countCardsInLocation('deck'),
            'cardToDisplay' => $this->cardManager->getCard($card->id),
            'cardsDrawn' => array_map(fn($card) => Card::onlyPublicInfo($card), $cardsDrawn), // Only return the public info for all players
            'nrOfCardsDrawn' => sizeof($cardsDrawn),
            'cardSet' => $card->type
        ]);

        // Also notify the player of the real cards drawn.
        self::notifyPlayer($playerId, 'cardsDrawn', '', [
            'playerId' => $playerId,
            'cardsDrawn' => $cardsDrawn
        ]);

        $this->gamestate->nextState(ACT_PASS);
    }
}
