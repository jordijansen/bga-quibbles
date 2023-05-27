class PlayerManager  {

    private handCounters: Counter[] = []
    constructor(private game: QuibblesGame) {
    }

    public setUp(gameData: QuibblesGameData) {
        const playerAreas = [];
        for (const playerId in gameData.players) {
            const player = gameData.players[playerId];
            this.createPlayerPanels(player);

            const playerArea=this.createPlayerArea(player);
            if (player.self) {
                playerAreas.unshift(playerArea);
            } else {
                playerAreas.push(playerArea);
            }
        }
        playerAreas.forEach(playerArea => dojo.place(playerArea, "quibbles-ui-row-4"))

        this.game.setTooltipToClass('playerhand-counter', _('Number of cards in hand'));
    }

    public setHandCounter(playerId: number, handCount: number) {
        this.handCounters[playerId].toValue(handCount);
    }

    private createPlayerArea(player: QuibblesPlayer) {
        return `<div id="player-area-${player.id}" class="player-area whiteblock">
                    <div class="quibbles-title-wrapper">
                        <h2 class="quibbles-title" style="background-color: #${player.color};">${player.name}${_("'s Collection")}</h2>
                    </div>
                    <div id="player-collection-${player.id}" class="player-collection"></div>
                </div>`
    }

    private createPlayerPanels(player: QuibblesPlayer) {
        const playerId = Number(player.id)
        let html = `<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${player.id}"></span>
                    <div id="playerhand-stock-${player.id}"></div>
                </div>
            </div><div class="counters">`;

        dojo.place(html, `player_board_${player.id}`);

        const handCounter = new ebg.counter();
        handCounter.create(`playerhand-counter-${player.id}`);
        handCounter.setValue(player.handCount);
        this.handCounters[playerId] = handCounter;
    }
}