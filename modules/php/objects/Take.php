<?php

namespace objects;
class Take
{
    public int $totalDiscardValue;
    public array $cardsToDiscard;

    public function __construct(int $totalDiscardValue, array $cardsToDiscard) {
        $this->totalDiscardValue = $totalDiscardValue;
        $this->cardsToDiscard = $cardsToDiscard;
    }
}

?>