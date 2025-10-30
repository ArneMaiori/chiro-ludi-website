// public/js/hero-editor.js

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('heroEditModal');
    if (!modal) return;

    // --- Formulier Elementen ---
    const form = document.getElementById('heroImageForm');
    const modalPageKey = document.getElementById('modalPageKey');
    const modalPageTitle = document.getElementById('modalPageTitle');
    const modalExistingImageUrl = document.getElementById('modalExistingImageUrl');
    const modalImageRemoved = document.getElementById('modalImageRemoved');
    const newImageInput = document.getElementById('newImage');
    const modalPreviewImage = document.getElementById('modalPreviewImage');
    
    // --- Sectie Elementen ---
    const displaySection = document.getElementById('modalImageDisplaySection');
    const uploadSection = document.getElementById('modalImageUploadSection');
    const btnChangeImage = document.getElementById('modalBtnChangeImage');
    const btnRemoveImage = document.getElementById('modalBtnRemoveImage');
    const btnCancelChange = document.getElementById('modalBtnCancelChange');

    let originalUrl = ''; // Bewaart de URL bij het openen van de modal

    // --- Zichtbaarheid Functies ---

    function showImageDisplay(url) {
        modalPreviewImage.src = url;
        displaySection.style.display = 'block';
        uploadSection.style.display = 'none';
        btnChangeImage.style.display = 'inline-block';
        btnRemoveImage.style.display = 'inline-block';
        newImageInput.value = ''; // Zorgt ervoor dat er geen file meegestuurd wordt
    }

    function showImageUpload() {
        displaySection.style.display = 'none';
        uploadSection.style.display = 'block';
        btnChangeImage.style.display = 'none';
        btnRemoveImage.style.display = 'none';
    }

    // --- Modal Events ---

    // 1. Bij het openen van de modal
    modal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget; 
        const pageKey = button.getAttribute('data-page-key');
        const currentUrl = button.getAttribute('data-current-url');
        const pageTitle = button.closest('section').querySelector('h1').textContent;

        // Reset state
        form.reset();
        modalImageRemoved.value = 'false';
        originalUrl = currentUrl; 

        // Vul basisvelden
        modalPageKey.value = pageKey;
        modalPageTitle.textContent = pageTitle;

        if (currentUrl && !currentUrl.includes('default_hero.jpg')) {
            modalExistingImageUrl.value = currentUrl;
            showImageDisplay(currentUrl);
        } else {
            // Geen bestaande afbeelding of default: direct naar upload
            modalExistingImageUrl.value = '';
            showImageUpload();
        }
    });

    // 2. Klik op 'Aanpassen' (van display naar upload)
    btnChangeImage.addEventListener('click', () => {
        showImageUpload();
        // Verberg de knop 'Annuleren' als er nog geen bestand is gekozen
        btnCancelChange.style.display = 'none';
        
        // Zorgt ervoor dat de server de oude niet bewaart als er een nieuwe wordt geüpload
        modalExistingImageUrl.value = ''; 
    });

    // 3. Klik op 'Verwijderen'
    btnRemoveImage.addEventListener('click', () => {
        if (confirm('Weet u zeker dat u deze afbeelding wilt verwijderen? De standaardafbeelding wordt gebruikt.')) {
            modalExistingImageUrl.value = ''; // Server weet: verwijderen
            modalImageRemoved.value = 'true'; // Extra vlag
            showImageUpload();
            
            // Toon de annuleren knop niet
            btnCancelChange.style.display = 'none';
        }
    });

    // 4. Bestand geselecteerd in de file input
    newImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            updatePreview(this.files[0]);
            
            // Toon de preview en de 'Annuleren' knop
            modalPreviewImage.style.display = 'block';
            btnCancelChange.style.display = 'inline-block';
            
            // Zet de verborgen velden correct
            modalImageRemoved.value = 'false';
            modalExistingImageUrl.value = '';
        } else if (originalUrl) {
            // Als er geen bestand is gekozen (gebruiker annuleert in de file dialog), herstel de originele view
            showImageDisplay(originalUrl);
        }
    });
    
    // 5. Klik op 'Annuleren' (bij upload)
    btnCancelChange.addEventListener('click', () => {
         if (originalUrl) {
            // Terug naar de bestaande afbeelding
            showImageDisplay(originalUrl);
        } else {
            // Terug naar de lege upload status
            showImageUpload();
        }
    });
});