document.addEventListener('DOMContentLoaded', () => {
    const editors = {};
    let activeQuill = null;
    let currentSelection = null;
    const linkModal = new bootstrap.Modal(document.getElementById('quillLinkModal'));

    // Quill initialiseren
    document.querySelectorAll('.admin-editor').forEach((container) => {
        const index = container.getAttribute('data-index');
        const quill = new Quill(container, {
            theme: 'snow',
            modules: {
                toolbar: [['bold', 'italic', 'underline'], ['link'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['clean']]
            }
        });

        // Als link toevoegen, gebruik geselecteerde naam als placeholder en open modal
        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            toolbar.addHandler('link', function() {
                activeQuill = quill;
                currentSelection = quill.getSelection(true);
                
                const currentText = currentSelection && currentSelection.length > 0 
                    ? quill.getText(currentSelection.index, currentSelection.length) 
                    : '';

                document.getElementById('quillLinkText').value = currentText;
                document.getElementById('quillLinkUrl').value = '';
                linkModal.show();
            });
        }
        editors[index] = quill;
    });

    // Link toevoegen modal bevestiging
    document.getElementById('confirmQuillLink').addEventListener('click', () => {
        const displayText = document.getElementById('quillLinkText').value;
        const href = document.getElementById('quillLinkUrl').value.trim();
        
        if (!href) {
            if (currentSelection && currentSelection.length > 0) {
                activeQuill.formatText(currentSelection.index, currentSelection.length, 'link', false);
            }
        } else {
            const url = (href.startsWith('http') || href.startsWith('/') || href.startsWith('#')) ? href : `https://${href}`;

            if (currentSelection && currentSelection.length > 0) {
                activeQuill.deleteText(currentSelection.index, currentSelection.length);
                activeQuill.insertText(currentSelection.index, displayText, { link: url });
            } else {
                const insertIndex = currentSelection ? currentSelection.index : activeQuill.getLength();
                activeQuill.insertText(insertIndex, displayText, { link: url });
            }
        }
        linkModal.hide();
    });

    // Opslaan van text in cards
    document.querySelectorAll('.save-card-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const index = btn.getAttribute('data-index');
            const content = editors[index].root.innerHTML;
            const page = document.querySelector('main')?.dataset?.page || 'bivak';
            
            const response = await fetch('bivak/admin/update-bivak-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index, content, page })
            });

            if (response.ok) {
                btn.innerText = 'Succesvol opgeslagen';
                btn.classList.replace('btn-success', 'btn-outline-success');
                btn.disabeld = true;

                setTimeout(() => {
                    btn.innerText = 'Opslaan';
                    btn.classList.replace('btn-outline-success', 'btn-success');
                    btn.disabled = false;
                }, 2000);
            } else {
                btn.innerText = 'Fout bij opslaan';
                btn.classList.replace('btn-success', 'btn-danger');
                btn.disabeld = true;

                setTimeout(() => {
                    btn.innerText = 'Opslaan';
                    btn.classList.replace('btn-danger', 'btn-success');
                    btn.disabled = false;
                }, 2000);
            }
        });
    });

    // Opslaan van de inschrijvingslink voor bivak
    const saveLinkBtn = document.getElementById('saveLinkBtn');
    if(saveLinkBtn) {
        saveLinkBtn.addEventListener('click', async () => {
            const newLink = document.getElementById('newLinkInput').value;
            const response = await fetch('/bivak/admin/update-inschrijvingslink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkUrl: newLink })
            });

            if (response.ok) location.reload();
        });
    }

    // Opslaan van de BBQ inschrijvingslink 
    const saveBBQLinkBtn = document.getElementById('saveBBQLinkBtn');
    if (saveBBQLinkBtn) {
        saveBBQLinkBtn.addEventListener('click', async () => {
            const newLink = document.getElementById('newBBQLinkInput').value;
            const response = await fetch('/bivak/admin/update-bbq-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkUrl: newLink })
            });

            if (response.ok) location.reload();
        });
    }
});