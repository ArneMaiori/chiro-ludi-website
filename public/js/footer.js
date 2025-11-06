document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const errorMsg = document.getElementById('errorMessage');
    const adminModalEl = document.getElementById('adminModal');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('adminPassword').value;

            const res = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
                credentials: 'same-origin'
            });

            const data = await res.json();

            if (data.success) {
                location.reload();
            } else {
                errorMsg.classList.remove('d-none');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const res = await fetch('/admin/logout', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                location.reload();
            }
        });
    }

    // Close modal 
    if (adminModalEl) {
        adminModalEl.addEventListener('shown.bs.modal', () => {
            document.getElementById('adminPassword').focus();
        });
        adminModalEl.addEventListener('hidden.bs.modal', () => {
            errorMsg.classList.add('d-none');
            loginForm.reset();
        });
    }
});