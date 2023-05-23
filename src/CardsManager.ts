const cardWidth = 165;
const cardHeight = 257;

class CardsManager extends CardManager<Card> {

    private display: ManualPositionStock<Card>
    private playerHand: ManualPositionStock<Card>
    private deck: Deck<Card>
    private discard: Deck<Card>

    constructor(private quibblesGame: QuibblesGame) {
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
            cardHeight
        })
    }

    public setUp(gameData: QuibblesGameData) {
        this.display = new LineFitPositionStock<Card>(this, $('card-display'), {});

        this.deck = new Deck<Card>(this, $('card-deck'), {
            autoUpdateCardNumber: false,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: gameData.deckCount,
            topCard: gameData.deckCount > 0 ? {id: -1} : undefined, // this is just a card as this will never change
        });

        this.discard = new Deck<Card>(this, $('card-discard'), {
            autoUpdateCardNumber: true,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: 0
        });

        this.discard.addCards(gameData.discard);
        this.display.addCards(gameData.display);

        if (!this.quibblesGame.isReadOnly()) {
            this.playerHand = new LineFitPositionStock<Card>(this, $('player-hand'), {});
            for (let playersKey in gameData.players) {
                if (gameData.players[playersKey].self) {
                    this.playerHand.addCards(gameData.players[playersKey].hand)
                }
            }
        }


    }
}