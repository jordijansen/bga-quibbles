/**
 * Similar to LineStock except this stock uses the available space to lay out the elements and overlap them if there is not enough space guaranteeing a single line of elements.
 */
class LineFitPositionStock<T> extends ManualPositionStock<T> {
    constructor(manager: CardManager<T>, element: HTMLElement, settings: CardStockSettings) {
        super(manager, element, settings, (element, cards, lastCard, stock) => {
            const margin = 8;
            const totalCardWidth = cards.length * manager.getCardWidth();
            const totalMarginWidth = (cards.length -  1) * margin;
            const totalWidth = totalCardWidth + totalMarginWidth;

            let leftOffset = 0;
            let leftForSingleCard = manager.getCardWidth() + margin;
            if (totalWidth > element.clientWidth) {
                // The totalWidth required is larger than the available with we need to calculate overlap
                leftForSingleCard = (element.clientWidth - manager.getCardWidth() - margin) / (cards.length - 1);
            } else {
                leftOffset = ((element.clientWidth - totalWidth) / 2) - 10;
            }

            cards.forEach((card, index) => {
                const cardDiv = stock.getCardElement(card);
                const cardLeft = (leftForSingleCard * index) + leftOffset;

                cardDiv.style.left = `${ cardLeft }px`;
            });

        });
    }

    cardRemoved(card: T) {
        const cardDiv = this.getCardElement(card);
        cardDiv.style.left = null;
        cardDiv.classList.remove('to-discard')
        super.cardRemoved(card);
    }
}
