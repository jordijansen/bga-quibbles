<?php

trait DebugTrait {

    function discardAllHandCards() {
        $cardsInHand = $this->cardManager->getCardsInLocation(ZONE_PLAYER_HAND, $this->getActivePlayerId());
        $this->cardManager->moveCards(array_map(fn($card) => $card->id, $cardsInHand), ZONE_DISCARD);
    }
}
