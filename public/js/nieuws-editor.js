// Slaat de link tekst en URL op tijdens bewerking
let linkMap = {};

/** 
 * Zet de opgeslagen HTML <a> tags om naar de bewerkbare [link: tekst] syntax 
 * en vult de linkMap met de URL's.
 * @param {string} htmlContent - De HTML inhoud uit de database (post.description).
 * @returns {string} De onbewerkte (unprocessed) tekst voor de textarea.
 */
function unprocessDescription(htmlContent) {
    // Zoek naar html <a> tags
    const linkRegex = /<a href="(.*?)" target="_blank">(.*?)<\/a>/g;
    let unprocessedContent = htmlContent;
    
    // Vind en vervang alle links en vul de linkMap
    unprocessedContent = unprocessedContent.replace(linkRegex, (match, url, text) => {
        linkMap[text.trim()] = url; 
        return `[link: ${text.trim()}]`; 
    });
    
    return unprocessedContent;
}

/**
 * Zet de [link: tekst] syntax om naar HTML <a> tags voor opslag.
 * @param {string} rawContent - De ruwe tekst uit de textarea.
 * @returns {string} De HTML inhoud.
 */
function processDescription(rawContent) {
    // Zoek naar de [link: tekst] placeholders
    return rawContent.replace(/\[link: (.*?)\]/g, (_, text) => {
        const url = linkMap[text];
        // Zet om naar <a> tag
        return url ? `<a href="${url}" target="_blank">${text}</a>` : text; 
    });
}


// ===== DOM LOGICA =====
window.addEventListener('load', () => {
    // ===== SELECTEER ELEMENTEN =====
    // Afbeelding elementen
    const imageInput = document.getElementById('image');
    const existingImageUrlInput = document.getElementById('existingImageUrl');
    const imageRemovedInput = document.getElementById('imageRemoved');
    const previewImage = document.getElementById('previewImage');
    const uploadSection = document.getElementById('imageUploadSection');
    const displaySection = document.getElementById('imageDisplaySection');
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    
    // Inhoud elementen
    const descriptionTextArea = document.getElementById('description');
    const existingDescriptionInput = document.getElementById('hiddenDescription'); 

    // Link elementen
    const insertLinkBtn = document.getElementById('insertLinkBtn');
    const confirmInsertLink = document.getElementById('confirmInsertLink');
    const linkModalElement = document.getElementById('linkModal');
    const linkModal = new bootstrap.Modal(linkModalElement);
    const linkTextInput = document.getElementById('linkText');
    const linkUrlInput = document.getElementById('linkUrl');


    // ===== VERWERK DATA =====
    // Afbeelding
    const existingImageUrl = existingImageUrlInput.value;
    if (existingImageUrl) {
        previewImage.src = existingImageUrl;
        showImageDisplay();
    } else {
        showImageUpload();
    }

    // Inhoud 
    const existingDescription = existingDescriptionInput.value;
    if (existingDescription) {
        descriptionTextArea.value = unprocessDescription(existingDescription);
    }


    // ===== AFBEELDING VIEW =====
    // Toon de upload file sectie
    function showImageUpload() {
        uploadSection.style.display = '';
        displaySection.style.display = 'none';
        imageInput.value = '';
    }

    // Toon de afbeelding en de verwijderknop
    function showImageDisplay() {
        uploadSection.style.display = 'none';
        displaySection.style.display = '';
    }

    // Laat afbeelding live zien bij upload
    function updatePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }


    // ===== AFBEELDING BEHEER =====
    // Wanneer gebruiker een bestand selecteert
    imageInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            updatePreview(this.files[0]); 
            showImageDisplay();
            
            // Er is een nieuw bestand, dus oude URL negeren
            existingImageUrlInput.value = ''; 
            imageRemovedInput.value = 'false';
        } else if (existingImageUrlInput.value) {
             // Als de gebruiker annuleert, en er was een oude, toon de oude
            previewImage.src = existingImageUrlInput.value;
            showImageDisplay(); 
        } else {
            // Anders, terug naar upload modus
            showImageUpload();
        }
    });

    // Afbeelding Verwijderen
    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', () => {
            if (confirm('Weet u zeker dat u deze afbeelding wilt verwijderen?')) {
                showImageUpload();
                
                // Verwijder de url
                existingImageUrlInput.value = ''; 
                imageRemovedInput.value = 'true';
            }
        });
    }


    // ===== LINK INVOEGEN =====
    let cursorStart = 0;
    let cursorEnd = 0;

    // Toon link toevoegen modal
    insertLinkBtn.addEventListener('click', () => {
        cursorStart = descriptionTextArea.selectionStart;
        cursorEnd = descriptionTextArea.selectionEnd;
        linkTextInput.value = '';
        linkUrlInput.value = '';
        linkModal.show();
    });

    // Insert link
    confirmInsertLink.addEventListener('click', () => {
        const text = linkTextInput.value.trim();
        const url = linkUrlInput.value.trim();

        if (!text || !url) {
            alert('Vul zowel de tekst als de URL in.');
            return;
        }

        const before = descriptionTextArea.value.substring(0, cursorStart);
        const after = descriptionTextArea.value.substring(cursorEnd);

        // Maak placeholder en sla op in linkmap
        descriptionTextArea.value = `${before}[link: ${text}]${after}`;
        linkMap[text] = url;

        linkModal.hide();
        descriptionTextArea.focus();
    });

    // ===== FORM SUBMISSION =====
    document.getElementById('nieuwsForm').addEventListener('submit', (e) => {
        // Converteer de ruwe editor-tekst naar HTML
        const htmlContent = processDescription(descriptionTextArea.value);
        document.getElementById('hiddenDescription').value = htmlContent;
    });
});