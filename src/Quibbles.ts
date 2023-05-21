declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_replayFrom;
declare const g_archive_mode;

class Quibbles implements QuibblesGame {

    instantaneousMode: boolean;
    private gamedatas: QuibblesGameData;
    private cardsManager: CardsManager;
    private playerManager: PlayerManager

    constructor() {
        this.cardsManager = new CardsManager(this);
        this.playerManager = new PlayerManager(this);
    }

    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: QuibblesGameData) {
        log( "Starting game setup" );

        this.gamedatas = gamedatas;

        this.cardsManager.setUp(gamedatas);

        this.playerManager.setUp(gamedatas);

        log('gamedatas', gamedatas);

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
           //TODO
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            //TODO
        }
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {

        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                //TODO
            }
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////

    private isReadOnly() {
        return (this as any).isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayer(playerId: number): QuibblesPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/elawa/elawa/${action}.html`, data, this, () => {});
    }
    public takeNoLockAction(action: string, data?: any) {
        data = data || {};
        (this as any).ajaxcall(`/elawa/elawa/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        log( 'notifications subscriptions setup' );

        const notifs = [
            // TODO
        ];

        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }
}