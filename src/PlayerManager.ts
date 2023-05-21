class PlayerManager  {

    private game: QuibblesGame
    constructor(game: QuibblesGame) {
    }

    public setUp(gameData: QuibblesGameData) {
        const playerAreas = [];
        for (const playerId in gameData.players) {
            const player = gameData.players[playerId];
            const playerArea=this.createPlayerArea(player);
            if (player.self) {
                playerAreas.unshift(playerArea);
            } else {
                playerAreas.push(playerArea);
            }
        }
        playerAreas.forEach(playerArea => dojo.place(playerArea, "quibbles-ui-row-3"))
    }

    private createPlayerArea(player: Player) {
        return `<div id="player-area-${player.id}" class="player-area whiteblock">
                    <h2 style="color: #${player.color};">${player.name}</h2>
                </div>`
    }
}