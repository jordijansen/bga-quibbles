interface Card {
    id: number;
    location: string;
    location_arg: number;
    type: string;
    type_arg: number;
}

interface CardManagerSettings {
    /**
     * The width of the card in px
     */
    cardWidthInPixels: number
    /**
     * The height of the card in px
     */
    cardHeightInPixels: number
    /**
     * Get the html class for cards
     */
    getCardClassNames: (card: Card) => string;
    /**
     * Get the unique id for this card
     */
    getId: (card: Card) => string;
}

interface LocationSettings {
    containerId: string
}

class CardManager {

    private locations: { [locationName: string]: CardLocation} = {}

    constructor(private game: Game, private settings: CardManagerSettings) {}

    public addLocation(name: string, location: CardLocation) {
        this.locations[name] = location;
    }

    public getLocation(name: string) {
        return this.locations[name];
    }

    public addClickListener(card: Card, handler: () => void) {
        dojo.connect($(this.settings.getId(card)), 'onClick', handler)
    }

    public createCardElement(card: Card) {
        return `<div id="${this.settings.getId(card)}" class="bga-card ${this.settings.getCardClassNames(card)}">
                    <div class="bga-card-inner">
                        <div class="bga-card-front"></div>
                        <div class="bga-card-back"></div>
                    </div>
                </div>`
    }
}

abstract class CardLocation {

    private cards: Card[] = [];
    protected constructor(protected cardManager: CardManager, protected containerId: string) {
        dojo.addClass($(containerId), 'card-location')
    }
    public addAll(cardsToAdd: Card[]) {
        cardsToAdd.forEach(card => this.add(card));
    }

    public add(cardToAdd: Card) {
        this.cards.push(cardToAdd);
        const cardElement = this.cardManager.createCardElement(cardToAdd)
        dojo.place(cardElement, $(this.containerId));
    }

    public getCards() {
        return [...this.cards];
    }

    public getCardIds() {
        return this.getCards().map(card => card.id);
    }

    public hasCardId(id: number) {
        return this.getCardIds().includes(id);
    }
}

class HorizontalCardLocation extends CardLocation {

    constructor(cardManager: CardManager, containerId: string) {
        super(cardManager, containerId);
        dojo.addClass($(containerId), 'horizontal-card-location')
    }
}