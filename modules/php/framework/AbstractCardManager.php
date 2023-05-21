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
}