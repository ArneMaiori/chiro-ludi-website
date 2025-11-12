// ===== FORM LOGICA =====
window.addEventListener('load', () => {
    // ===== SELECTEER ELEMENTEN =====
    const form = document.getElementById('leidingForm');
    const formTitle = document.getElementById('formTitle');
    const formMode = document.getElementById('formMode');
    const leidingId = document.getElementById('leidingId');

    const nameInput = document.getElementById('name');
    const groupSelect = document.getElementById('group');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const bioInput = document.getElementById('bio');
    const isHoofdleidingInput = document.getElementById('isHoofdleiding');

    const imageInput = document.getElementById('image');
    const existingImageUrlInput = document.getElementById('existingImageUrl');
    const existingImagePublicIdInput = document.getElementById('existingImagePublicId');
    const imageRemovedInput = document.getElementById('imageRemoved');
    const previewImage = document.getElementById('previewImage');
    const uploadSection = document.getElementById('imageUploadSection');
    const displaySection = document.getElementById('imageDisplaySection');
    const btnRemoveImage = document.getElementById('btnRemoveImage');

    const btnSubmit = document.getElementById('btnSubmit');
    const btnDelete = document.getElementById('btnDelete');
    const btnAddNew = document.getElementById('btnAddNew');

    const leidingItems = document.querySelectorAll('.leiding-item');
    const listContainer = document.getElementById('leidingList');

    // ===== HELPER FUNCTIES =====

    /**
     * Toont de bestandsupload en verbergt de preview.
     */
    function showImageUpload() {
        uploadSection.style.display = '';
        displaySection.style.display = 'none';
        imageInput.value = '';
    }

    /**
     * Toont de huidige preview en verbergt de bestandsupload.
     */
    function showImageDisplay() {
        uploadSection.style.display = 'none';
        displaySection.style.display = '';
    }

    /**
     * Update de preview met een nieuw geselecteerd bestand.
     * @param {File} file
     */
    function updatePreview(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Reset het formulier naar de aanmaakmodus.
     */
    function resetForm() {
        form.reset();
        formMode.value = 'create';
        leidingId.value = '';
        formTitle.textContent = 'Nieuwe leiding toevoegen';
        btnSubmit.textContent = 'Toevoegen';
        btnDelete.style.display = 'none';
        form.action = '/leiding/admin';

        existingImageUrlInput.value = '';
        existingImagePublicIdInput.value = '';
        imageRemovedInput.value = 'false';

        isHoofdleidingInput.checked = false;
        if (groupSelect) {
            groupSelect.value = '';
        }

        showImageUpload();
        leidingItems.forEach((item) => item.classList.remove('active'));
    }

    /**
     * Vul het formulier met gegevens van een bestaande leiding.
     * @param {HTMLElement} item
     */
    function loadLeidingData(item) {
        const id = item.getAttribute('data-id');
        const name = item.getAttribute('data-name');
        const group = item.getAttribute('data-group') || '';
        const phone = item.getAttribute('data-phone');
        const email = item.getAttribute('data-email');
        const bio = item.getAttribute('data-bio');
        const imageUrl = item.getAttribute('data-image-url');
        const imagePublicId = item.getAttribute('data-image-public-id');
        const isHoofdleiding = item.getAttribute('data-is-hoofdleiding') === 'true';

        formMode.value = 'edit';
        leidingId.value = id;
        form.action = `/leiding/admin/edit/${id}`;

        nameInput.value = name;
        phoneInput.value = phone;
        emailInput.value = email;
        bioInput.value = bio;
        isHoofdleidingInput.checked = isHoofdleiding;
        if (groupSelect) {
            groupSelect.value = group;
        }

        formTitle.textContent = 'Leiding bewerken';
        btnSubmit.textContent = 'Opslaan';
        btnDelete.style.display = 'block';
        imageRemovedInput.value = 'false';

        if (imageUrl) {
            existingImageUrlInput.value = imageUrl;
            existingImagePublicIdInput.value = imagePublicId;
            previewImage.src = imageUrl;
            showImageDisplay();
        } else {
            existingImageUrlInput.value = '';
            existingImagePublicIdInput.value = imagePublicId || '';
            showImageUpload();
        }

        leidingItems.forEach((listItem) => listItem.classList.remove('active'));
        item.classList.add('active');
    }

    // ===== EVENT HANDLERS =====

    leidingItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            loadLeidingData(item);
        });
    });

    imageInput.addEventListener('change', function onImageChange() {
        if (this.files && this.files.length > 0) {
            updatePreview(this.files[0]);
            showImageDisplay();
            existingImageUrlInput.value = '';
            imageRemovedInput.value = 'false';
        } else if (existingImageUrlInput.value) {
            previewImage.src = existingImageUrlInput.value;
            showImageDisplay();
        } else {
            showImageUpload();
        }
    });

    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', () => {
            if (confirm('Weet u zeker dat u deze foto wilt verwijderen?')) {
                showImageUpload();
                existingImageUrlInput.value = '';
                imageRemovedInput.value = 'true';
            }
        });
    }

    btnAddNew.addEventListener('click', resetForm);

    btnDelete.addEventListener('click', () => {
        if (confirm('Weet u zeker dat u deze leiding wilt verwijderen?')) {
            const id = leidingId.value;
            const deleteForm = document.createElement('form');
            deleteForm.method = 'POST';
            deleteForm.action = `/leiding/admin/delete/${id}`;
            document.body.appendChild(deleteForm);
            deleteForm.submit();
        }
    });

    form.addEventListener('submit', (event) => {
        if (groupSelect && !groupSelect.value) {
            event.preventDefault();
            alert('Selecteer een tak voor deze leiding.');
            groupSelect.focus();
        }
    });

    // ===== INIT =====
    if (listContainer) {
        const selectedId = listContainer.dataset.selectedId;
        if (selectedId) {
            const selectedItem = Array.from(leidingItems).find((item) => item.dataset.id === selectedId);
            if (selectedItem) {
                loadLeidingData(selectedItem);
                selectedItem.classList.add('active');
            }
        }
    }
});