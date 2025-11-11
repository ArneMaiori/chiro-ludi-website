// ===== SELECTEER ELEMENTEN =====
window.addEventListener('load', () => {
    // Form elementen
    const form = document.getElementById('leidingForm');
    const formTitle = document.getElementById('formTitle');
    const formMode = document.getElementById('formMode');
    const leidingId = document.getElementById('leidingId');
    
    // Input velden
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const bioInput = document.getElementById('bio');
    const isHoofdleidingInput = document.getElementById('isHoofdleiding');
    
    // Afbeelding elementen
    const imageInput = document.getElementById('image');
    const existingImageUrlInput = document.getElementById('existingImageUrl');
    const existingImagePublicIdInput = document.getElementById('existingImagePublicId');
    const imageRemovedInput = document.getElementById('imageRemoved');
    const previewImage = document.getElementById('previewImage');
    const uploadSection = document.getElementById('imageUploadSection');
    const displaySection = document.getElementById('imageDisplaySection');
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    
    // Knoppen
    const btnSubmit = document.getElementById('btnSubmit');
    const btnDelete = document.getElementById('btnDelete');
    const btnAddNew = document.getElementById('btnAddNew');

    // Leiding lijst items
    const leidingItems = document.querySelectorAll('.leiding-item');


    // ===== HELPER FUNCTIES =====
    
    /**
     * Reset het formulier naar de initiële staat voor het toevoegen van nieuwe leiding
     */
    function resetForm() {
        form.reset();
        formMode.value = 'create';
        leidingId.value = '';
        formTitle.textContent = 'Nieuwe leiding toevoegen';
        btnSubmit.textContent = 'Toevoegen';
        btnDelete.style.display = 'none';
        form.action = '/leiding/admin';
        
        // Reset afbeelding velden
        existingImageUrlInput.value = '';
        existingImagePublicIdInput.value = '';
        imageRemovedInput.value = 'false';
        
        // Reset checkbox
        isHoofdleidingInput.checked = false;
        
        // Toon upload sectie
        showImageUpload();
        
        // Verwijder actieve styling van lijst items
        leidingItems.forEach(item => item.classList.remove('active'));
    }

    /**
     * Laad de gegevens van een bestaand leiding lid in het formulier
     * @param {HTMLElement} item - Het aangeklikte leiding list item element
     */
    function loadLeidingData(item) {
        // Haal data attributes op
        const id = item.getAttribute('data-id');
        const name = item.getAttribute('data-name');
        const phone = item.getAttribute('data-phone');
        const email = item.getAttribute('data-email');
        const bio = item.getAttribute('data-bio');
        const imageUrl = item.getAttribute('data-image-url');
        const imagePublicId = item.getAttribute('data-image-public-id');
        const isHoofdleiding = item.getAttribute('data-is-hoofdleiding') === 'true';

        // Zet form in edit mode
        formMode.value = 'edit';
        leidingId.value = id;
        form.action = `/leiding/admin/edit/${id}`;
        
        // Vul input velden
        nameInput.value = name;
        phoneInput.value = phone;
        emailInput.value = email;
        bioInput.value = bio;
        isHoofdleidingInput.checked = isHoofdleiding;
        
        // Update UI
        formTitle.textContent = 'Leiding bewerken';
        btnSubmit.textContent = 'Opslaan';
        btnDelete.style.display = 'block';

        // Reset image removed flag
        imageRemovedInput.value = 'false';

        // Afbeelding handling
        if (imageUrl) {
            existingImageUrlInput.value = imageUrl;
            existingImagePublicIdInput.value = imagePublicId;
            previewImage.src = imageUrl;
            showImageDisplay();
        } else {
            existingImageUrlInput.value = '';
            existingImagePublicIdInput.value = '';
            showImageUpload();
        }

        // Update actieve item styling
        leidingItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }

    /**
     * Toon de upload sectie en verberg de display sectie
     */
    function showImageUpload() {
        uploadSection.style.display = '';
        displaySection.style.display = 'none';
        imageInput.value = '';
    }

    /**
     * Toon de display sectie en verberg de upload sectie
     */
    function showImageDisplay() {
        uploadSection.style.display = 'none';
        displaySection.style.display = '';
    }

    /**
     * Update de preview afbeelding met een geselecteerd bestand
     * @param {File} file - Het geselecteerde afbeeldingsbestand
     */
    function updatePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }


    // ===== EVENT LISTENERS =====
    
    /**
     * Klik op een leiding item in de lijst - laad data in formulier
     */
    leidingItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            loadLeidingData(item);
        });
    });

    /**
     * Nieuwe afbeelding geselecteerd in file input
     */
    imageInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            // Toon preview van nieuwe afbeelding
            updatePreview(this.files[0]);
            showImageDisplay();
            
            // Clear bestaande afbeelding data (nieuwe afbeelding vervangt oude)
            existingImageUrlInput.value = '';
            existingImagePublicIdInput.value = '';
            imageRemovedInput.value = 'false';
        } else if (existingImageUrlInput.value) {
            // Gebruiker heeft selectie geannuleerd, toon bestaande afbeelding indien beschikbaar
            previewImage.src = existingImageUrlInput.value;
            showImageDisplay();
        } else {
            // Geen bestand en geen bestaande afbeelding, toon upload sectie
            showImageUpload();
        }
    });

    /**
     * Verwijder knop - verwijder huidige afbeelding
     */
    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', () => {
            if (confirm('Weet u zeker dat u deze foto wilt verwijderen?')) {
                showImageUpload();
                
                // Markeer afbeelding als verwijderd
                existingImageUrlInput.value = '';
                existingImagePublicIdInput.value = '';
                imageRemovedInput.value = 'true';
            }
        });
    }

    /**
     * Plus knop - reset formulier naar nieuwe leiding modus
     */
    btnAddNew.addEventListener('click', () => {
        resetForm();
    });

    /**
     * Delete knop - verwijder leiding lid
     */
    btnDelete.addEventListener('click', () => {
        if (confirm('Weet u zeker dat u deze leiding wilt verwijderen?')) {
            const id = leidingId.value;
            
            // Maak en submit delete form
            const deleteForm = document.createElement('form');
            deleteForm.method = 'POST';
            deleteForm.action = `/leiding/admin/delete/${id}`;
            document.body.appendChild(deleteForm);
            deleteForm.submit();
        }
    });

    /**
     * Form submission - zorg dat de juiste action wordt gebruikt
     */
    form.addEventListener('submit', (e) => {
        // Action wordt al gezet in resetForm() en loadLeidingData()
        // Deze listener is hier voor eventuele toekomstige validatie
    });
});