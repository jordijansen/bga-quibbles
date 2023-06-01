<?php

trait DebugTrait {

    function discardAllHandCards() {
        $cardsInHand = $this->cardManager->getCardsInLocation(ZONE_PLAYER_HAND, $this->getActivePlayerId());
        $this->cardManager->moveCards(array_map(fn($card) => $card->id, $cardsInHand), ZONE_DISCARD);
    }

    function discardAllDeckCards() {
        $cardsInDeck = $this->cardManager->getCardsInLocation(ZONE_DECK);
        $this->cardManager->moveCards(array_map(fn($card) => $card->id, $cardsInDeck), ZONE_DISCARD);
    }

    function addAllHandCardsToCollection() {
        $cardsInHand = $this->cardManager->getCardsInLocation(ZONE_PLAYER_HAND, $this->getActivePlayerId());
        $this->cardManager->moveCards(array_map(fn($card) => $card->id, $cardsInHand), ZONE_PLAYER_AREA, $this->getActivePlayerId());
    }
}
