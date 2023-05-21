const cardWidth = 165;
const cardHeight = 257;

class CardsManager extends CardManager<Card> {

    private display: LineStock<Card>
    private deck: Deck<Card>
    private discard: Deck<Card>
    constructor(game: QuibblesGame) {
        super(game, {
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
            cardHeight
        })
    }

    public setUp(gameData: QuibblesGameData) {
        this.display = new LineStock<Card>(this, $('card-display'), { wrap: 'nowrap' });
        this.deck = new Deck<Card>(this, $('card-deck'), {
            autoUpdateCardNumber: false,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: gameData.deckCount,
            topCard: {id: -1}, // this is just a card as this will never change
        });

        this.discard = new Deck<Card>(this, $('card-discard'), {
            autoUpdateCardNumber: false,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: gameData.discard.length,
            topCard: gameData.discard.length > 0 ? gameData.discard[0] : undefined
        });

        this.display.addCards(gameData.display);
    }
}