<?php

abstract class AbstractCardManager extends APP_DbObject {

    private string $tableName;

    protected Deck $cards;

    public function __construct(Deck $deck, string $tableName)
    {
        $this->tableName = $tableName;

        $this->cards = $deck;
        $this->cards->init($tableName);
    }
    public function init(array $cards, string $initialLocation = 'deck') {
        $this->cards->createCards($cards, $initialLocation);
        $this->cards->shuffle($initialLocation);
    }

    public function getCardsInLocation(string $location, int $location_arg = null): array
    {
        $dbResults = $this->cards->getCardsInLocation($location, $location_arg);
        return array_map(fn($dbCard) => new Card($dbCard), array_values($dbResults));
    }

    public function getIdsInLocation(string $location, int $location_arg = null): array
    {
        $dbResults = $this->cards->getCardsInLocation($location, $location_arg);
        return array_keys($dbResults);
    }

    public function countCardsInLocation(string $location, int $location_arg = null): int
    {
        return $this->cards->countCardInLocation($location, $location_arg);
    }

    public function moveCards(array $cardIds, string $location, int $location_arg = 0): void {
        $this->cards->moveCards($cardIds, $location, $location_arg);
    }

    public function moveCard(int $cardId, string $location, int $location_arg = 0): void {
        $this->cards->moveCard($cardId, $location, $location_arg);
    }

    public function getCards(array $cardIds): array {
        $dbResults = $this->cards->getCards($cardIds);
        return array_map(fn($dbCard) => new Card($dbCard), array_values($dbResults));
    }

    public function getCard(int $cardId): Card {
        $dbCard = $this->cards->getCard($cardId);
        return new Card($dbCard);
    }

    public function countByTypeInLocationAndLocationArg(string $location, int $location_arg) {
        $sql = "SELECT `card_type`, COUNT(1) AS `count` FROM `card` WHERE `card_location` = '$location' AND `card_location_arg` = $location_arg GROUP BY `card_type`";
        return $this->getCollectionFromDb($sql);
    }

    public function getCardsOfTypeInLocation(string $type, string $location, int $location_arg) {
        $dbResults = $this->cards->getCardsOfTypeInLocation($type, null, $location, $location_arg);
        return array_map(fn($dbCard) => new Card($dbCard), array_values($dbResults));

    }
}