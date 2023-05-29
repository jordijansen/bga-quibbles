declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_replayFrom;
declare const g_archive_mode;

const ANIMATION_MS = 500;
const TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
const LOCAL_STORAGE_ZOOM_KEY = 'Quibbles-zoom';

class Quibbles implements QuibblesGame {

    instantaneousMode: boolean;
    private gamedatas: QuibblesGameData;
    private cardsManager: CardsManager;
    private playerManager: PlayerManager
    private zoomManager: ZoomManager;

    constructor() {

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

        this.cardsManager = new CardsManager(this);
        this.playerManager = new PlayerManager(this);
        this.zoomManager = new ZoomManager({
            element: document.getElementById('quibbles-table'),
            smooth: true,
            zoomControls: {
                color: 'black',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            onDimensionsChange: () => {
                this.cardsManager.updateLineFitPositionStocks();
            },
        });

        log('gamedatas', gamedatas);

        this.gamedatas = gamedatas;
        this.playerManager.setUp(gamedatas);
        this.cardsManager.setUp(gamedatas);

        this.setupNotifications();
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
            case 'playerTurnTake':
                this.onEnteringPlayerTurnTake();
                break;
            case 'playerTurnTakeConfirm':
                this.onEnteringPlayerTurnTakeConfirm(args.args);
                break;
            case 'playerTurnAddCollection':
                this.onEnteringPlayerTurnAddCollection(args.args);
                break;
            case 'playerTurnPass':
                this.onEnteringPlayerTurnPass();
                break;
            case 'discardCollectionCard':
                this.onEnteringDiscardCollectionCard();
                break;
        }
    }

    private onEnteringPlayerTurnTake() {
        if ((this as any).isCurrentPlayerActive()) {
            const maxTotalValue = 6;
            this.cardsManager.setHandCardsSelectable('multiple', maxTotalValue);
        }
    }

    private onEnteringPlayerTurnTakeConfirm(args: PlayerTurnTakeConfirmArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.cardsManager.setCardsToDiscard(args.cardsToDiscard);

            if (args.cardsToDiscard.length === 1) {
                this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturn + '<br />' + _('Select sets of cards to take that total:') + '&nbsp;' + args.totalDiscardValue + '<br />';
                (this as any).updatePageTitle();
                this.cardsManager.setDisplayCardsSelectableSets('multiple', args.totalDiscardValue);
            } else {
                this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturn + '<br />' + _('Select cards to take with value:') + '&nbsp;' + args.totalDiscardValue + '<br />';
                (this as any).updatePageTitle();
                this.cardsManager.setDisplayCardsSelectableSingle('single', args.totalDiscardValue);
            }
        }
    }

    private onEnteringPlayerTurnAddCollection(args: PlayerTurnAddCollectionArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            const canAddToCollection = this.findCollectionAddCards(args.playerHandTypeCount);
            if (canAddToCollection.length === 0) {
                this.gamedatas.gamestate.descriptionmyturn = _("You can't add a card to your collection");
            }
            this.gamedatas.gamestate.descriptionmyturn += '<br />';
            (this as any).updatePageTitle();
        }
    }

    private onEnteringPlayerTurnPass() {
        if ((this as any).isCurrentPlayerActive()) {
            this.cardsManager.setHandCardsSelectable('single');
        }
    }

    private onEnteringDiscardCollectionCard() {
        this.cardsManager.setCollectionCardsSelectableForDiscard('single', this.getPlayerId())
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'playerTurnTake':
                this.onLeavingPlayerTurnTake();
                break;
            case 'playerTurnTakeConfirm':
                this.onLeavingPlayerTurnTakeConfirm();
                break;
            case 'playerTurnPass':
                this.onLeavingPlayerTurnPass();
                break;
            case 'discardCollectionCard':
                this.onLeavingDiscardCollectionCard();
                break;
        }
    }

    private onLeavingPlayerTurnTake() {
        this.cardsManager.setHandCardsSelectable('none');
    }

    private onLeavingPlayerTurnTakeConfirm() {
        this.cardsManager.unsetCardsToDiscardPlayerHand();
        this.cardsManager.setDisplayCardsSelectableSets('none');
    }

    private onLeavingPlayerTurnPass() {
        this.cardsManager.setHandCardsSelectable('none');
    }

    private onLeavingDiscardCollectionCard() {
        this.cardsManager.setCollectionCardsSelectableForDiscard('none', this.getPlayerId());
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {

        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerTurn':
                    (this as any).addActionButton('playerTurnTake', _("TAKE"), () => (this as any).chooseAction("take"));
                    (this as any).addActionButton('playerTurnPass', _("PASS"), () => (this as any).chooseAction("pass"));
                    break;
                case 'playerTurnTake':
                    (this as any).addActionButton('takeConfirmDiscard', _("Confirm Discard"), () => (this as any).takeConfirmDiscard());
                    break;
                case 'playerTurnTakeConfirm':
                    (this as any).addActionButton('takeConfirm', _("Confirm Take"), () => (this as any).takeConfirm());
                    break;
                case 'playerTurnAddCollection':
                    const cardsThatCanBeAdded = this.findCollectionAddCards(args.playerHandTypeCount);
                    if (cardsThatCanBeAdded.length > 0) {
                        cardsThatCanBeAdded.forEach(cardThatCanBeAdded => (this as any).addActionButton(`addCardToCollection${cardThatCanBeAdded.card_type}`, _("Add") + ` ${this.getTypeIcon(cardThatCanBeAdded.card_type)}`, () => (this as any).addCardToCollection(Number(cardThatCanBeAdded.card_type))))
                    }
                    (this as any).addActionButton('endTurn', _("End Turn"), () => (this as any).endTurn());
                    break;
                case 'playerTurnPass':
                    (this as any).addActionButton('passConfirm', _("Confirm Card"), () => (this as any).passConfirm());
                    break;
                case 'discardCollectionCard':
                    (this as any).addActionButton('confirmDiscard', _("Confirm Discard"), () => (this as any).confirmCollectionCardDiscard(args.type));
                    (this as any).addActionButton('cancelDiscard', _("Cancel"), () => (this as any).restoreServerGameState(), null, null, 'gray');
                    break;
            }

            if (['playerTurnTake', 'playerTurnTakeConfirm', 'playerTurnPass'].includes(stateName) && args.canCancelMoves) {
                (this as any).addActionButton('undoLastMoves', _("Undo last moves"), () => this.undoLastMoves(), null, null, 'gray');
            }
        }
    }

    private undoLastMoves() {
        this.takeAction('undoLastMoves');
    }

    private chooseAction(chosenAction: string) {
        this.takeAction("chooseAction", {chosenAction})
    }

    private takeConfirmDiscard() {
        let cardIds = this.cardsManager.getSelectedPlayerHandCards().map(card => card.id);
        this.takeAction("takeConfirmDiscard", {cardIds: JSON.stringify(cardIds)})
    }

    private takeConfirm() {
        const selectedSets = this.cardsManager.selectedSets;
        this.wrapInConfirm(() => this.takeAction("takeConfirm", {selectedSets: JSON.stringify(selectedSets)}));
    }

    private endTurn() {
        this.takeAction("endTurn")
    }

    private addCardToCollection(type: number) {
        const cardsInCollection = this.cardsManager.getCardsInCollection(this.getPlayerId());
        if (cardsInCollection.length == 6) {
            (this as any).setClientState("discardCollectionCard", {descriptionmyturn : _("${you} must discard a card from your collection as you already have 6 cards in your collection") + "<br />", args: {type}});
        } else {
            this.takeAction("addCardToCollection", {type, cardIdToDiscard: null});
        }
    }

    private confirmCollectionCardDiscard(type: number) {
        const selectedCardIds = this.cardsManager.getSelectedCollectionCards(this.getPlayerId())
            .map(card => card.id);
        const cardIdToDiscard = selectedCardIds.length == 1 ? selectedCardIds[0] : null;
        this.takeAction("addCardToCollection", {type, cardIdToDiscard});
    }

    private passConfirm() {
        const selectedCards = this.cardsManager.getSelectedPlayerHandCards();
        const cardId = selectedCards.length > 0 ? selectedCards[0].id : null;
        const performAction = () => this.takeAction("pass", {cardId});
        if (cardId) {
            this.wrapInConfirm(performAction);
        } else {
            // This fails because no card selected, but will be handled by the backend.
            performAction();
        }
    }

    private wrapInConfirm(runnable: () => void) {
        if (this.isAskForConfirmation()) {
            (this as any).confirmationDialog(_("This action can not be undone. Are you sure?"), () => {
                runnable();
            });
        } else {
            runnable();
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////

    public isReadOnly() {
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
        (this as any).ajaxcall(`/quibbles/quibbles/${action}.html`, data, this, () => {});
    }
    public takeNoLockAction(action: string, data?: any) {
        data = data || {};
        (this as any).ajaxcall(`/quibbles/quibbles/${action}.html`, data, this, () => {});
    }

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, TOOLTIP_DELAY);
    }

    private findCollectionAddCards(typeCounts: {[type: string]: {card_type: string, count: number }}) {
        return Object.values(typeCounts)
            .filter(typeCount => typeCount.count >= Number(typeCount.card_type));
    }

    private setScore(playerId: number, score: number) {
        (this as any).scoreCtrl[playerId]?.toValue(score);
    }

    private isAskForConfirmation() {
        return true; // For now always ask for confirmation, might make this a preference later on.
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
            ['cancelLastMoves', ANIMATION_MS],
            ['takeConfirmed', ANIMATION_MS],
            ['displayDiscarded', ANIMATION_MS],
            ['displayRefilled', ANIMATION_MS],
            ['cardAddedToCollection', ANIMATION_MS],
            ['passConfirmed', ANIMATION_MS],
            ['cardsDrawn', ANIMATION_MS],
            ['handDiscarded', ANIMATION_MS],
            ['deckReshuffled', ANIMATION_MS]
        ];

        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_cancelLastMoves(notif: Notif<NotifCancelLastMoves>) {
        log('notif_cancelLastMoves: ');
        log(notif);
        this.cardsManager.addCardsToDisplay(notif.args.displayCards, this.getPlayerId())
    }

    notif_takeConfirmed(notif: Notif<NotifTakeConfirmed>) {
        log('notif_takeConfirmed: ');
        log(notif);

        this.cardsManager.discardCardsFromPlayer(notif.args.cardsDiscarded, notif.args.playerId);

        this.cardsManager.addCardsToPlayerHand(notif.args.playerId, notif.args.cardsTaken)

        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount)
    }

    notif_displayDiscarded(notif: Notif<NotifDisplayDiscarded>) {
        log('notif_displayDiscarded: ');
        log(notif);

        this.cardsManager.discardCards(notif.args.cardsDiscarded);
    }

    notif_displayRefilled(notif: Notif<NotifDisplayRefilled>) {
        log('notif_displayRefilled: ');
        log(notif);

        this.cardsManager.setDeckCount(notif.args.deckCount);
        this.cardsManager.addCardsToDisplayFromDeck(notif.args.displayCards);
    }

    notif_cardAddedToCollection(notif: Notif<NotifCardAddedToCollection>) {
        log('notif_cardAddedToCollection: ');
        log(notif);

        this.setScore(notif.args.playerId, notif.args.playerScore);

        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);

        this.cardsManager.discardCardsFromPlayer(notif.args.cardsDiscarded, notif.args.playerId);

        this.cardsManager.addCardToCollection(notif.args.cardCollected, notif.args.playerId);
    }

    notif_passConfirmed(notif: Notif<NotifPassConfirmed>) {
        log('notif_passConfirmed: ');
        log(notif);

        this.cardsManager.setDeckCount(notif.args.deckCount);
        this.cardsManager.addCardsToDisplay([notif.args.cardToDisplay], notif.args.playerId)

        if (this.getPlayerId() !== notif.args.playerId) {
            this.cardsManager.addCardsToPlayerHandFromDeck(notif.args.playerId, notif.args.cardsDrawn)
        }

        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);

    }

    notif_cardsDrawn(notif: Notif<NotifCardsDrawn>) {
        log('notif_cardsDrawn: ');
        log(notif);
        // Only received by the player that has drawn cards
        if (this.getPlayerId() === notif.args.playerId) {
            this.cardsManager.addCardsToPlayerHandFromDeck(notif.args.playerId, notif.args.cardsDrawn)
        }
    }

    notif_handDiscarded(notif: Notif<NotifHandDiscarded>) {
        log('notif_handDiscarded: ');
        log(notif);

        this.cardsManager.discardCardsFromPlayer(notif.args.cardsDiscarded, notif.args.playerId);
        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);
    }

    notif_deckReshuffled(notif: Notif<NotifDeckReshuffled>) {
        log('notif_deckReshuffled: ');
        log(notif);

        this.cardsManager.deckReshuffled(notif.args.deckCount);
    }

    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                if (args.cardSet) {
                    if (Array.isArray(args.cardSet)) {
                        args.cardSet = args.cardSet.map(cardType => this.getTypeIcon(cardType)).join(",")
                    }
                }
                if (args.cardSets) {
                    if (Array.isArray(args.cardSets)) {
                        args.cardSets = args.cardSets.map(cardSet => cardSet.map(cardType => this.getTypeIcon(cardType)).join(",")).join(" - ")
                    }
                }
            }
        } catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }

    private getTypeIcon(type) {
        return `<span class="quibbles-icon type-icon" data-type="${type}">${type}</span>`;
    }
}