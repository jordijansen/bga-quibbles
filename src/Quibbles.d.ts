/**
 * Your game interfaces
 */

interface QuibblesCard extends Card {

}
interface QuibblesGameData extends GameData {
    display: QuibblesCard[]
    playerHand: QuibblesCard[]
}

interface QuibblesPlayer extends Player {

}

interface QuibblesGame extends Game {
    getPlayerId(): number;
    getPlayer(playerId: number): QuibblesPlayer;
}