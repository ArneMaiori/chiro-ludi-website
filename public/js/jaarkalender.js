const colDay = document.getElementById('col-day');
const colMonth = document.getElementById('col-month');
const colTitle = document.getElementById('col-title');
const colSubmit = document.getElementById('col-submit');
const colCancel = document.getElementById('col-cancel');
const eventForm = document.getElementById('event-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

// Load een event in de form om deze aan te passen
function editEvent(id, day, month, title) {
    if (!formTitle) return;
    
    formTitle.innerText = "Activiteit aanpassen";
    eventForm.dataset.mode = 'edit';
    eventForm.dataset.editId = id;
    
    document.getElementById('input-day').value = day;
    document.getElementById('input-month').value = month;
    document.getElementById('input-title').value = title;
    
    submitBtn.innerText = "Aanpassen";

    colCancel.classList.remove('d-none');
    colDay.className = "col-md-2";
    colMonth.className = "col-md-2";
    colTitle.className = "col-md-4";
    colSubmit.className = "col-md-2";

    eventForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Reset form zodat we een nieuw event kunnen toevoegen
function resetForm() {
    if (!formTitle) return;
    
    formTitle.innerText = "Activiteit toevoegen";
    eventForm.dataset.mode = 'add';
    delete eventForm.dataset.editId;
    eventForm.reset();
    
    submitBtn.innerText = "Toevoegen";

    colCancel.classList.add('d-none');
    colDay.className = "col-md-2";
    colMonth.className = "col-md-3";
    colTitle.className = "col-md-4";
    colSubmit.className = "col-md-3";
}

// Event opslaan (toevoegen of aanpassen)
if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const mode = eventForm.dataset.mode || 'add';
        const id = eventForm.dataset.editId;
        const url = mode === 'edit' ? `/jaarkalender/admin/edit-event/${id}` : '/jaarkalender/admin/add-event';
        
        const formData = new FormData(eventForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (err) {
            console.error("Fout bij opslaan:", err);
        }
    });
}

// Event verwijderen
async function deleteEvent(id, monthIndex, event) {
    if (!confirm('Zeker weten dat je dit wilt verwijderen?')) return;

    try {
        const response = await fetch(`/jaarkalender/admin/delete-event/${id}`, {
            method: 'POST'
        });

        if (response.ok) {
            const eventRow = event.target.closest('.d-flex.justify-content-between');
            const parentContainer = document.querySelector('.calendar-list');
            
            eventRow.remove();

            const remainingInMonth = parentContainer.querySelectorAll(`[data-month="${monthIndex}"]`);
            
            // Verwijder maand als deze leeg is
            if (remainingInMonth.length === 0) {
                const titleElement = document.getElementById(`month-title-${monthIndex}`);
                if (titleElement) titleElement.remove();
            }
        }
    } catch (err) {
        console.error("Fout bij verwijderen:", err);
    }
}