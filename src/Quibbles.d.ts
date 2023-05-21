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
}

interface QuibblesGame extends Game {
    getPlayerId(): number;
    getPlayer(playerId: number): QuibblesPlayer;
}