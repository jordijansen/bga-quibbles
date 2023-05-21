<?php

class CardManager extends AbstractCardManager {
    public function __construct(Deck $deck)
    {
        parent::__construct($deck, 'card');
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
        foreach( $players as $player_id => $player )
        {
            $this->cards->pickCardsForLocation(INITIAL_HAND_SIZE, ZONE_DECK, ZONE_PLAYER_HAND, $player_id);
        }
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
