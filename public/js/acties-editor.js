document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('actionForm');
    const title = document.getElementById('editorTitle');
    const btnDelete = document.getElementById('btnDelete');
    const titleInput = document.getElementById('titleInput');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImage = document.getElementById('previewImage');
    const descriptionArea = document.getElementById('description');
    const imageError = document.getElementById('imageError');
    const photoLabel = document.getElementById('photoLabel');

    // Hidden fields
    const existingIdField = document.getElementById('existingImagePublicId');
    const existingUrlField = document.getElementById('existingImageUrl');

    // ===== Link Functionaliteit =====
    let linkMap = {};

    /** * Zet de opgeslagen HTML <a> tags om naar de bewerkbare [link: tekst] syntax 
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

    document.getElementById('confirmInsertLink').addEventListener('click', () => {
        const text = document.getElementById('linkText').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        if (!text || !url) return;

        const cursorStart = descriptionArea.selectionStart;
        const before = descriptionArea.value.substring(0, cursorStart);
        const after = descriptionArea.value.substring(descriptionArea.selectionEnd);

        descriptionArea.value = `${before}[link: ${text}]${after}`;
        linkMap[text] = url;

        const modal = bootstrap.Modal.getInstance(document.getElementById('linkModal'));
        modal.hide();
    });

    // Waarschuwing als er geen afbeelding geupload is
    form.addEventListener('submit', (e) => {
        imageError.classList.add('d-none');

        const hasNewFile = imageInput.files && imageInput.files.length > 0;
        const hasExistingFile = existingUrlField.value && existingUrlField.value !== '';

        if (!hasNewFile && !hasExistingFile) {
            e.preventDefault();
            imageError.classList.remove('d-none');
            return;
        }
        
        descriptionArea.value = processDescription(descriptionArea.value);
    });

    // ===== Formulier reset / load =====
    // Reset
    window.resetForm = function () {
        form.action = '/acties/admin';
        title.textContent = 'Nieuwe actie toevoegen';
        form.reset();
        descriptionArea.value = '';
        existingIdField.value = '';
        existingUrlField.value = '';
        previewContainer.classList.add('d-none');
        previewImage.src = '';
        btnDelete.style.display = 'none';
        imageInput.required = false;
        imageError.classList.add('d-none');
        titleInput.value = '';
        
        if(photoLabel) photoLabel.innerText = 'Foto *';

        document.querySelectorAll('.action-item').forEach(i => i.classList.remove('active'));
    };

    document.getElementById('btnNewAction').addEventListener('click', window.resetForm);

    // Load
    window.loadAction = function (el) {
        const item = el.closest('.action-item');
        const id = item.dataset.id;
        const titleValue = item.dataset.title;
        const imgUrl = item.dataset.imageUrl;
        const imgId = item.dataset.imagePublicId;
        const description = item.dataset.description;

        document.querySelectorAll('.action-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        imageError.classList.add('d-none');

        form.action = `/acties/admin/edit/${id}`;
        title.textContent = 'Actie bewerken';
        titleInput.value = titleValue;
        existingIdField.value = imgId;
        existingUrlField.value = imgUrl;
        
        if(photoLabel) photoLabel.innerText = 'Verander afbeelding';

        previewImage.src = imgUrl;
        previewContainer.classList.remove('d-none');
        imageInput.required = false;
        
        imageInput.value = '';

        descriptionArea.value = unprocessDescription(description);

        btnDelete.style.display = 'block';
        btnDelete.onclick = () => {
            if (confirm('Ben je zeker?')) {
                const delForm = document.createElement('form');
                delForm.method = 'POST';
                delForm.action = `/acties/admin/delete/${id}`;
                document.body.appendChild(delForm);
                delForm.submit();
            }
        };
    };

    // Image preview
    imageInput.addEventListener('change', function () {
        imageError.classList.add('d-none');
        
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewContainer.classList.remove('d-none');
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // ===== Reorder acties =====
    async function saveOrder() {
        const items = document.querySelectorAll('.action-item');
        const order = Array.from(items).map(item => item.dataset.id);

        await fetch('/acties/admin/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order })
        });
    }

    document.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.action-item');
            const prev = item.previousElementSibling;
            if (prev) {
                item.parentNode.insertBefore(item, prev);
                saveOrder();
            }
        });
    });

    document.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.action-item');
            const next = item.nextElementSibling;
            if (next) {
                item.parentNode.insertBefore(next, item);
                saveOrder();
            }
        });
    });
});