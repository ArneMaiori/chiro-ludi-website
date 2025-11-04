document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('heroEditModal');
    if (!modal) return;

    // --- Formulier Elementen ---
    const form = document.getElementById('heroImageForm');
    const modalPageKey = document.getElementById('modalPageKey');
    const modalExistingImagePublicId = document.getElementById('modalExistingImagePublicId');
    const modalExistingImageUrl = document.getElementById('modalExistingImageUrl');
    const modalImageRemoved = document.getElementById('modalImageRemoved');
    const newImageInput = document.getElementById('newImage');
    const modalPreviewImage = document.getElementById('modalPreviewImage');
    const currentImageLabel = document.getElementById('currentImageLabel');
    
    // --- Sectie Elementen ---
    const displaySection = document.getElementById('modalImageDisplaySection');
    const uploadSection = document.getElementById('modalImageUploadSection');
    const btnRemoveImage = document.getElementById('modalBtnRemoveImage');

    const DEFAULT_URL = 'https://res.cloudinary.com/dph1xlgfc/image/upload/v1759244464/GebouwChiro_rmjnjp.jpg';
    let originalUrl = '';

    // --- Zichtbaarheid Functies ---

    /**
     * Toont de afbeelding en de bijbehorende label en verwijderknopstatus.
     * @param {string} url - De URL van de afbeelding.
     * @param {boolean} isDefault - True als het de standaardafbeelding is.
     */
    function showImageDisplay(url, isDefault) {
        modalPreviewImage.src = url;
        displaySection.style.display = 'block';
        uploadSection.style.display = 'block'; 
        
        currentImageLabel.textContent = isDefault ? 'Huidige Afbeelding (standaard)' : 'Huidige Afbeelding';
        btnRemoveImage.style.display = isDefault ? 'none' : 'block';
    }

    /**
     * Verbergt de display sectie en toont de upload sectie (wordt alleen gebruikt bij reset)
     */
    function resetToDefaultUpload() {
        modalPreviewImage.src = DEFAULT_URL;
        currentImageLabel.textContent = 'Huidige Afbeelding (standaard)';
        btnRemoveImage.style.display = 'none';
        newImageInput.value = '';
    }

    // --- Modal Events ---
    // Bij het openen van de modal
    modal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget; 
        const pageKey = button.getAttribute('data-page-key');
        const currentPublicId = button.getAttribute('data-current-public-id');
        const currentUrl = button.getAttribute('data-current-url');
        const isDefault = button.getAttribute('data-is-default') === 'true';

        // Reset state
        form.reset();
        modalImageRemoved.value = 'false';
        originalUrl = currentUrl; 

        // Vul gegevens in en toon de image display
        modalPageKey.value = pageKey;
        modalExistingImageUrl.value = currentUrl; 
        modalExistingImagePublicId.value = currentPublicId;
        showImageDisplay(currentUrl, isDefault);
    });

    /**
     * Helper functie om een live preview te tonen
     */
    function updatePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            modalPreviewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Huidige afbeelding verwijderen
    btnRemoveImage.addEventListener('click', () => {
        if (confirm('Weet u zeker dat u deze afbeelding wilt verwijderen? De standaardafbeelding wordt gebruikt.')) {
            resetToDefaultUpload();

            modalExistingImageUrl.value = '';
            modalImageRemoved.value = 'true';
        }
    });

    // Bestand geselecteerd in de file input
    newImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            updatePreview(this.files[0]);
            
            currentImageLabel.textContent = 'Nieuwe afbeelding geselecteerd';
            btnRemoveImage.style.display = 'none'; 

            modalImageRemoved.value = 'false';
            modalExistingImageUrl.value = '';
        } else if (originalUrl && originalUrl !== DEFAULT_URL) {
            showImageDisplay(originalUrl, false); 
        } else {
             resetToDefaultUpload();
        }
    });
});