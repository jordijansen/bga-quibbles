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
                this.quibblesGame.getPlayer(playerId).self) {
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
        this.playerHand?.setSelectionMode(selectionMode)
        if (selectionMode != 'none') {
            if (maxTotalValue) {
                this.playerHand.onSelectionChange = ((selection) => {
                    const selectedValue = selection.map(card => Number(card.type)).reduce((sum, current) => sum + current, 0);
                    const remainingValue = maxTotalValue - selectedValue;

                    const selectableCards = this.playerHand.getCards()
                        .filter(card => selection.includes(card) || Number(card.type) <= remainingValue)
                    this.playerHand.setSelectableCards(selectableCards)

                    this.unsetDisplayDisabledCards();
                    this.setAllOtherDisplayCardsToDisabled(this.determineSelectableCardsForTake(selection.length > 1, selection.map(card => Number(card.type)).reduce((sum, current) => sum + current, 0)));
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
            this.display.setSelectableCards(this.determineSelectableCardsForTake(false, totalDiscardValue))
            this.display.onSelectionChange = ((selection) => {
                const selectedValue = selection.map(card => Number(card.type)).reduce((sum, current) => sum + current, 0);
                const remainingValue = totalDiscardValue - selectedValue;

                if (remainingValue === 0) {
                    this.selectedSets.push(selection.map(card => card.id));
                    this.playerHand.addCards(selection);
                    this.display.setSelectableCards(this.determineSelectableCardsForTake(false, totalDiscardValue))
                } else {
                    const selectableCards = this.display.getCards()
                        .filter(card => selection.includes(card) || (Number(card.type) <= remainingValue && Number(card.type) < totalDiscardValue))
                    this.display.setSelectableCards(selectableCards)
                }
            })
        }
    }

    public determineSelectableCardsForTake(isSingleTake: boolean, totalDiscardValue?: number) {
        if (isSingleTake) {
            return this.display.getCards().filter(card => Number(card.type) === totalDiscardValue);
        } else {
            const listOfNumbers = this.display.getCards().map(card => Number(card.type)).sort((a, b) => a - b);
            let result = [];
            this.unique_combination(0, 0, totalDiscardValue, [], listOfNumbers, result);
            return this.display.getCards().filter(card => result.includes(Number(card.type)));
        }
    }

    public setDisplayCardsSelectableSingle(selectionMode: CardSelectionMode, totalDiscardValue?: number) {
        this.selectedSets = [];
        this.display.setSelectionMode(selectionMode);
        if (selectionMode != 'none') {
            this.display.setSelectableCards(this.determineSelectableCardsForTake(true, totalDiscardValue))
            this.display.onSelectionChange = ((selection) => {
                if (selection.length == 1) {
                    this.selectedSets.push(selection.map(card => card.id));
                    this.playerHand.addCards(selection);
                }
            })
        }
    }

    public setCollectionCardsSelectableForDiscard(selectionMode: CardSelectionMode, playerId: number) {
        this.playerCollections[playerId].setSelectionMode(selectionMode);
        this.playerCollections[playerId].onSelectionChange = undefined;
        this.unsetCardsToDiscard(this.playerCollections[playerId].getCards())
        if (selectionMode != 'none') {
            this.playerCollections[playerId].onSelectionChange = ((selection) => {
                this.unsetCardsToDiscard(this.playerCollections[playerId].getCards())
                if (selection.length == 1) {
                    this.setCardsToDiscard(selection)
                }
            })
        }
    }

    getSelectedCollectionCards(playerId: number) {
        return this.playerCollections[playerId].getSelection();
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
    public addCardsToDisplay(cards: Card[], playerId: number) {
        this.display.addCards(cards, {fromStock: this.quibblesGame.getPlayer(playerId).self ? this.playerHand : this.playerStocks[playerId]});
    }

    public addCardsToPlayerHandFromDeck(playerId: number, cards: Card[]) {
        this.addCardsToPlayerHand(playerId, cards, {fromStock: this.deck})
    }

    public addCardsToPlayerHand(playerId: number, cards: Card[], animation: CardAnimation<Card> = {}) {
        if (this.quibblesGame.getPlayerId() === playerId &&
            this.quibblesGame.getPlayer(playerId).self) {
            this.playerHand.addCards(cards, animation);
        } else {
            this.playerStocks[playerId].addCards(cards, animation);
        }
    }

    setCardsToDiscard(cards: Card[]) {
        cards.map(card => this.getCardElement(card))
            .forEach(card => card.classList.add('to-discard'))
    }

    unsetCardsToDiscard(cards: Card[]) {
        cards.map(card => this.getCardElement(card))
            .forEach(card => card.classList.remove('to-discard'))
    }

    setAllOtherDisplayCardsToDisabled(cards: Card[]) {
        this.display.getCards()
            .filter(card => !cards.includes(card))
            .map(card => this.getCardElement(card))
            .forEach(card => card.classList.add('disabled'))
    }

    unsetDisplayDisabledCards() {
        this.display.getCards()
            .map(card => this.getCardElement(card))
            .forEach(card => card.classList.remove('disabled'))
    }

    unsetCardsToDiscardPlayerHand() {
        this.unsetCardsToDiscard(this.playerHand.getCards());
    }

    addCardToCollection(cardCollected: Card, playerId: number) {
        this.playerCollections[playerId].addCard(cardCollected, {fromStock: this.quibblesGame.getPlayer(playerId).self ? this.playerHand : this.playerStocks[playerId]});
    }

    updateLineFitPositionStocks() {
        const lineFitPositionStocks = [this.display, this.playerHand, ...Object.values(this.playerCollections)];
        lineFitPositionStocks.forEach(stock => stock?.adjust());
    }

    setDeckCount(deckCount: number) {
        this.deck.setCardNumber(deckCount);
    }

    getCardsInCollection(playerId: number) {
        return this.playerCollections[playerId].getCards();
    }

    deckReshuffled(deckCount: number) {
        this.discard.removeAll();
        this.discard.setCardNumber(0);
        this.deck.setCardNumber(deckCount, {id: -1});
        this.deck.shuffle();
    }

    private unique_combination(l, sum, K, local, A, result) {
        // If a unique combination is found
        if (sum == K && local.length > 1) {
            const newResult = [...result, ...local];
            result.pop();
            result.push(...newResult)
            return;
        }

        // For all other combinations
        for (let i = l; i < A.length; i++) {

            // Check if the sum exceeds K
            if (sum + A[i] > K)
                continue;

            // Check if it is repeated or not
            if (i > l && A[i] == A[i - 1])
                continue;

            // Take the element into the combination
            local.push(A[i]);

            // Recursive call
            this.unique_combination(i + 1, sum + A[i], K, local, A, result);

            // Remove element from the combination
            local.pop();
        }
    }
}