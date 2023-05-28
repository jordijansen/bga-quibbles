<?php

trait ArgsTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    //////////////////////////////////////////////////////////////////////////////
    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argPlayerTurnTake() {
        return [
            'canCancelMoves' => $this->canCancelMoves()
        ];
    }

    function argPlayerTurnPass() {
        return [
            'canCancelMoves' => $this->canCancelMoves()
        ];
    }

    function argPlayerTurnTakeConfirm() {
        $take = $this->getGlobalVariable(TAKE);

        return [
            'canCancelMoves' => $this->canCancelMoves(),
            'cardsToDiscard' => $take->cardsToDiscard,
            'totalDiscardValue' => $take->totalDiscardValue,
        ];
    }

    function argPlayerTurnAddCollection() {
        return [
            'playerHandTypeCount' => $this->cardManager->countByTypeInLocationAndLocationArg(ZONE_PLAYER_HAND, $this->getActivePlayerId())
        ];
    }
}