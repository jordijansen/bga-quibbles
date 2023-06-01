/**
 * Your game interfaces
 */

interface Card {
    id: number,
    type?: string,
    type_arg?: number,
    location?: string,
    location_arg?: number
}
interface QuibblesGameData extends GameData {
    display: Card[]
    discard: Card[]
    deckCount: number
}

interface QuibblesPlayer extends Player {
    /**
     * Indicates if the player is the player viewing the game (self)
     */
    self: boolean
    handCount: number
    hand?: Card[]
    collection: Card[];
}

interface QuibblesGame extends Game {
    getPlayerId(): number;
    getPlayer(playerId: number): QuibblesPlayer;
    isReadOnly(): boolean;

    setTooltipToClass(className: string, html: string): void;
}

interface EnteringPlayerTurnArgs {}

interface PlayerTurnTakeConfirmArgs {
    canCancelMoves: boolean,
    cardsToDiscard: Card[],
    totalDiscardValue: number
}

interface PlayerTurnAddCollectionArgs {
    playerHandTypeCount: {[type: string]: {card_type: string, count: number }}
}

/**
 * Notification Args
 */

interface NotifCancelLastMoves {
    displayCards: Card[]
}

interface NotifTakeConfirmed {
    playerId: number,
    player_name: string,
    handCount: number,
    cardsDiscarded: Card[],
    cardsTaken: Card[]
}

interface NotifDisplayDiscarded {
    cardsDiscarded: Card[]
}

interface NotifDisplayRefilled {
    deckCount: number,
    displayCards: Card[]
}

interface NotifCardAddedToCollection {
    playerId: number,
    player_name: string,
    handCount: number,
    playerScore: number,
    cardsDiscarded: Card[],
    cardCollected: Card
}

interface NotifCardRemovedFromCollection {
    playerId: number,
    player_name: string,
    cardRemoved: Card
}

interface NotifPassConfirmed {
    playerId: number,
    player_name: string,
    handCount: number,
    deckCount: number,
    cardToDisplay: Card,
    cardsDrawn: Card[],
}

interface NotifCardsDrawn {
    playerId: number,
    cardsDrawn: Card[]
}

interface NotifHandDiscarded {
    playerId: number,
    cardsDiscarded: Card[],
    handCount: number
}

interface NotifDeckReshuffled {
    deckCount: number
}