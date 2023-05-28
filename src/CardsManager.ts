const cardWidth = 165;
const cardHeight = 257;

class CardsManager extends CardManager<Card> {

    private display: LineFitPositionStock<Card>
    private playerHand: LineFitPositionStock<Card>
    private deck: Deck<Card>
    private discard: Deck<Card>
    private playerStocks: VoidStock<Card>[] = []
    private playerCollections: LineFitPositionStock<Card>[] = []

    public selectedSets: number[][] = null;

    constructor(protected quibblesGame: QuibblesGame) {
        super(quibblesGame, {
            getId: (card) => `quibbles-card-${card.id}`,
            setupDiv: (card: Card, div: HTMLElement) => {
                div.classList.add('quibbles-card');
                div.dataset.id = ''+card.id;
            },
            setupFrontDiv: (card: Card, div: HTMLElement) => {
                div.id = `${this.getId(card)}-front`;
                div.dataset.number = ''+card.type;
                div.dataset.variation = ''+card.type_arg;
            },
            isCardVisible: (card: Card) => !!card.type,
            cardWidth,
            cardHeight,
        })
    }

    public setUp(gameData: QuibblesGameData) {
        this.display = new LineFitPositionStock<Card>(this, $('card-display'), {sort: sortFunction('type')});

        this.deck = new Deck<Card>(this, $('card-deck'), {
            autoUpdateCardNumber: false,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: gameData.deckCount,
            topCard: gameData.deckCount > 0 ? {id: -1} : undefined, // this is just a card as this will never change
        });

        this.discard = new Deck<Card>(this, $('card-discard'), {
            autoUpdateCardNumber: true,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: 0,
        });

        this.discard.addCards(gameData.discard);
        this.display.addCards(gameData.display);

        for (let playersKey in gameData.players) {
            const playerId = Number(playersKey);
            if (this.quibblesGame.getPlayerId() === playerId &&
                this.quibblesGame.getPlayer(playerId).self &&
                !this.quibblesGame.isReadOnly()) {
                this.playerHand = new LineFitPositionStock<Card>(this, $('player-hand'), {sort: sortFunction('type')});
                this.playerHand.addCards(gameData.players[playersKey].hand)
            } else {
                this.playerStocks[playerId] = new VoidStock<Card>(this, $(`playerhand-stock-${playerId}`))
            }
            this.playerCollections[playerId] = new LineFitPositionStock<Card>(this, $(`player-collection-${playerId}`), {sort: sortFunction('type')})
            this.playerCollections[playerId].addCards(gameData.players[playersKey].collection)
        }
    }

    public setHandCardsSelectable(selectionMode: CardSelectionMode, maxTotalValue?: number) {
        this.playerHand.setSelectionMode(selectionMode)
        if (selectionMode != 'none') {
            if (maxTotalValue) {
                this.playerHand.onSelectionChange = ((selection) => {
                    const selectedValue = selection.map(card => Number(card.type)).reduce((sum, current) => sum + current, 0);
                    const remainingValue = maxTotalValue - selectedValue;

                    const selectableCards = this.playerHand.getCards()
                        .filter(card => selection.includes(card) || Number(card.type) <= remainingValue)
                    this.playerHand.setSelectableCards(selectableCards)
                })
            } else {
                this.playerHand.onSelectionChange = undefined;
            }
        }
    }

    public setDisplayCardsSelectableSets(selectionMode: CardSelectionMode, totalDiscardValue?: number) {
        this.selectedSets = [];
        this.display.setSelectionMode(selectionMode);
        if (selectionMode != 'none') {
            this.display.setSelectableCards(this.display.getCards().filter(card => Number(card.type) < totalDiscardValue))
            this.display.onSelectionChange = ((selection) => {
                console.log(selection)
                const selectedValue = selection.map(card => Number(card.type)).reduce((sum, current) => sum + current, 0);
                const remainingValue = totalDiscardValue - selectedValue;

                if (remainingValue === 0) {
                    this.selectedSets.push(selection.map(card => card.id));
                    this.playerHand.addCards(selection);
                    this.display.setSelectableCards(this.display.getCards().filter(card => Number(card.type) < totalDiscardValue))
                } else {
                    const selectableCards = this.display.getCards()
                        .filter(card => selection.includes(card) || (Number(card.type) <= remainingValue && Number(card.type) < totalDiscardValue))
                    this.display.setSelectableCards(selectableCards)
                }
            })
        }
    }

    public setDisplayCardsSelectableSingle(selectionMode: CardSelectionMode, totalDiscardValue?: number) {
        this.selectedSets = [];
        this.display.setSelectionMode(selectionMode);
        if (selectionMode != 'none') {
            this.display.setSelectableCards(this.display.getCards().filter(card => Number(card.type) === totalDiscardValue))
            this.display.onSelectionChange = ((selection) => {
                if (selection.length == 1) {
                    this.selectedSets.push(selection.map(card => card.id));
                    this.playerHand.addCards(selection);
                }
            })
        }
    }

    public getSelectedPlayerHandCards() {
        return this.playerHand.getSelection();
    }

    public discardCards(cards: Card[]) {
        this.discard.addCards(cards, {},  {visible: true, updateInformations: true});
    }

    public discardCardsFromPlayer(cards: Card[], playerId) {
        this.discard.addCards(cards, {fromStock: this.quibblesGame.getPlayer(playerId).self ? this.playerHand : this.playerStocks[playerId]},  {visible: true, updateInformations: true});
    }

    public addCardsToDisplayFromDeck(cards: Card[]) {
        this.display.addCards(cards, {fromStock: this.deck});
    }
    public addCardsToDisplay(cards: Card[]) {
        this.display.addCards(cards);
    }

    public addCardsToPlayerHandFromDeck(playerId: number, cards: Card[]) {
        this.addCardsToPlayerHand(playerId, cards, {fromStock: this.deck})
    }

    public addCardsToPlayerHand(playerId: number, cards: Card[], animation: CardAnimation<Card> = {}) {
        if (this.quibblesGame.getPlayerId() === playerId &&
            this.quibblesGame.getPlayer(playerId).self &&
            !this.quibblesGame.isReadOnly()) {
            this.playerHand.addCards(cards, animation);
        } else {
            this.playerStocks[playerId].addCards(cards, animation);
        }
    }

    setCardsToDiscard(cards: Card[]) {
        cards.map(card => this.getCardElement(card))
            .forEach(card => card.classList.add('to-discard'))
    }

    unsetCardsToDiscard() {
        this.playerHand.getCards().map(card => this.getCardElement(card))
            .forEach(card => card.classList.remove('to-discard'))
    }

    addCardToCollection(cardCollected: Card, playerId: number) {
        this.playerCollections[playerId].addCard(cardCollected);
    }

    updateLineFitPositionStocks() {
        const lineFitPositionStocks = [this.display, this.playerHand, ...Object.values(this.playerCollections)];
        lineFitPositionStocks.forEach(stock => stock?.adjust());
    }

    setDeckCount(deckCount: number) {
        this.deck.setCardNumber(deckCount);
    }
}