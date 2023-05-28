<?php

class CardManager extends AbstractCardManager {

    protected Quibbles $game;

    public function __construct(Quibbles $game, Deck $deck)
    {
        parent::__construct($deck, 'card');
        $this->game = $game;
        $this->cards->autoreshuffle = true;
        $this->cards->autoreshuffle_trigger = ['obj' => $this, 'method' => 'deckAutoReshuffle'];
    }

    public function setup() {
        $cards = [];

        for ($i = 1; $i <= 6; $i++) {
            for ($x = 1; $x <= $this->determineTypeArgMaxForType($i); $x++) {
                $cards[] = array( 'type' => $i, 'type_arg' => $x, 'nbr' => 1);
            }
        }
        shuffle($cards);
        parent::init($cards);
    }

    public function fillDisplay(): array
    {
        $nrOfCardsInDisplay = $this->cards->countCardInLocation(ZONE_DISPLAY);
        if ($nrOfCardsInDisplay < DISPLAY_CARD_SIZE) {
            $nrOfCardsToAddToDisplay = DISPLAY_CARD_SIZE - $nrOfCardsInDisplay;
            $this->cards->pickCardsForLocation($nrOfCardsToAddToDisplay, ZONE_DECK, ZONE_DISPLAY);
        }
        return $this->getCardsInLocation(ZONE_DISPLAY);
    }

    public function dealInitialCardsToPlayers($players) {
        foreach( $players as $playerId => $player )
        {
            $this->cards->pickCardsForLocation(INITIAL_HAND_SIZE, ZONE_DECK, ZONE_PLAYER_HAND, $playerId);
        }
    }

    public function dealCardsToPlayer(int $playerId, int $nrOfCardsToDeal) {
        $dbResults = $this->cards->pickCardsForLocation($nrOfCardsToDeal, ZONE_DECK, ZONE_PLAYER_HAND, $playerId);
        return array_map(fn($dbCard) => new Card($dbCard), array_values($dbResults));
    }

    public function deckAutoReshuffle() {
        $this->game->notifyAllPlayers('deckReshuffled', clienttranslate('Deck is emptied, shuffling the discard pile into a new deck'), [
            'deckCount' => $this->countCardsInLocation('deck')
        ]);
    }

    private function determineTypeArgMaxForType($type) {
        switch ($type) {
            case 1:
                return 16;
            case 2:
                return 18;
            case 3:
                return 20;
            case 4:
                return 22;
            case 5:
                return 24;
            case 6:
                return 26;

        }
    }
}
