document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

async function initializeLogin() {
    // Load logo
    await loadLogo();
    
    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('loginMessage');
        const submitBtn = this.querySelector('button[type="submit"]');

        // Tampilkan loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...';
        messageEl.classList.add('hidden');

        try {
            const response = await ApiService.verifyLogin(email, password);
            
            if (response.success) {
                if (response.user) {
                    sessionStorage.setItem('adminNama', response.user);
                }
                window.location.href = 'form.html';
            } else {
                showError(messageEl, response.message);
            }
        } catch (error) {
            showError(messageEl, 'Terjadi kesalahan: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login';
        }
    });
}

async function loadLogo() {
    try {
        // Gunakan logo lokal dari assets
        const logoImage = document.getElementById('logoImage');
        logoImage.src = 'assets/images/logo.png';
        logoImage.classList.remove('hidden');
        document.getElementById('logoLoading').classList.add('hidden');
        
        // Fallback: jika logo tidak ada, coba dari API
        logoImage.onerror = async function() {
            try {
                const response = await ApiService.getAppLogo();
                if (response.url) {
                    logoImage.src = response.url;
                } else {
                    throw new Error('Logo tidak ditemukan');
                }
            } catch (error) {
                document.getElementById('logoLoading').innerHTML = '<i class="fas fa-exclamation-circle text-red-500 text-2xl"></i>';
            }
        };
    } catch (error) {
        console.error('Error loading logo:', error);
        document.getElementById('logoLoading').innerHTML = '<i class="fas fa-exclamation-circle text-red-500 text-2xl"></i>';
    }
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.add('bg-red-600');
}