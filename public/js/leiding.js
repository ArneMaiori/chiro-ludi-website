document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.leiding-card');

    /**
     * Event handlers voor de info card van leiding
     */
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Als we op een link klikken (email/tel), draai de kaart niet om
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }

            // Stop event propagation zodat document click niet meteen triggert
            e.stopPropagation();

            // Sluit alle andere cards
            cards.forEach(otherCard => {
                if (otherCard !== this && otherCard.classList.contains('flipped')) {
                    otherCard.classList.remove('flipped');
                    const backFace = otherCard.querySelector('.leiding-card-back');
                    if (backFace) {
                        setTimeout(() => {
                            backFace.scrollTop = 0;
                        }, 300);
                    }
                }
            });

            // Toggle deze card
            const isFlippingBack = this.classList.contains('flipped');
            this.classList.toggle('flipped');

            // Reset scroll als we terug draaien
            if (isFlippingBack) {
                const backFace = this.querySelector('.leiding-card-back');
                if (backFace) {
                    setTimeout(() => {
                        backFace.scrollTop = 0;
                    }, 300);
                }
            }
        });
    });

    /**
     * Sluit alle cards als we ene openen
     */
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.leiding-card')) {
            cards.forEach(card => {
                if (card.classList.contains('flipped')) {
                    card.classList.remove('flipped');
                    const backFace = card.querySelector('.leiding-card-back');
                    if (backFace) {
                        setTimeout(() => {
                            backFace.scrollTop = 0;
                        }, 300);
                    }
                }
            });
        }
    });
});