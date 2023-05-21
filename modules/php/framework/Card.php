<?php

class CardType {
    public int $id;
    public string $type;
    public int $type_arg;
    public string $location;
    public int $location_arg;

    public function __construct(int $id, string $type, int $type_arg, string $location, int $location_arg)
    {
        $this->id = $id;
        $this->type = $type;
        $this->type_arg = $type_arg;
        $this->location = $location;
        $this->location_arg = $location_arg;
    }
}

class Card extends CardType {

    public function __construct($dbCard)
    {
        parent::__construct(
            $this->id = intval($dbCard['card_id'] ?? $dbCard['id']),
            $this->type = $dbCard['card_type'] ?? $dbCard['type'],
            $this->type_arg = intval($dbCard['card_type_arg'] ?? $dbCard['type_arg']),
            $this->location = $dbCard['card_location'] ?? $dbCard['location'],
            $this->location_arg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg'])
        );
    }
}