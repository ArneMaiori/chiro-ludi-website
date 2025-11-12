document.addEventListener('DOMContentLoaded', function () {
    const mapFrame = document.getElementById('contact-map');
    const list = document.querySelector('.hoofdleiding-list');
    const cards = document.querySelectorAll('.hoofdleiding-card');

    if (!mapFrame || !list) {
        return;
    }

    const getVerticalGap = () => {
        const style = window.getComputedStyle(list);

        const rowGap = parseFloat(style.rowGap);
        if (Number.isFinite(rowGap) && rowGap > 0) {
            return rowGap;
        }

        const gutterVar = style.getPropertyValue('--bs-gutter-y').trim();
        if (gutterVar) {
            if (gutterVar.endsWith('rem')) {
                const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
                const remValue = parseFloat(gutterVar);
                if (Number.isFinite(remValue) && remValue > 0) {
                    return remValue * rootFontSize;
                }
            }

            const numeric = parseFloat(gutterVar);
            if (Number.isFinite(numeric) && numeric > 0) {
                return numeric;
            }
        }

        return 16;
    };

    const computeHeight = () => {
        const gap = getVerticalGap();
        const cardArray = Array.from(cards);

        const cardsHeight = cardArray.reduce((total, card, index) => {
            const cardHeight = card.offsetHeight;
            const extraGap = index < cardArray.length - 1 ? gap : 0;
            return total + cardHeight + extraGap;
        }, 0);

        const firstCardHeight = cardArray.length > 0 ? cardArray[0].offsetHeight : 180;
        const minCards = 2;
        const minHeight = (firstCardHeight * minCards) + (minCards - 1) * gap;
        const targetHeight = Math.max(cardsHeight, minHeight, 320);

        const height = Math.ceil(targetHeight);
        const minimum = Math.ceil(minHeight);

        mapFrame.style.height = `${height}px`;
        mapFrame.style.minHeight = `${minimum}px`;
    };

    computeHeight();

    window.addEventListener('resize', computeHeight);

    const images = document.querySelectorAll('.hoofdleiding-image-wrapper img');
    images.forEach((image) => {
        if (image.complete) {
            return;
        }

        image.addEventListener('load', computeHeight);
        image.addEventListener('error', computeHeight);
    });
});

