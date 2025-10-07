// assets/js/login.js - DITAMBAHKAN SESSION MANAGEMENT
document.addEventListener('DOMContentLoaded', function() {
    // Cek jika sudah login, redirect ke form
    if (isLoggedIn()) {
        window.location.href = 'form.html';
        return;
    }
    
    initializeLogin();
});

// Fungsi untuk cek status login
function isLoggedIn() {
    const adminData = sessionStorage.getItem('adminData');
    if (!adminData) return false;
    
    try {
        const data = JSON.parse(adminData);
        // Cek expiry time (session 8 jam)
        if (data.expiry && data.expiry > Date.now()) {
            return true;
        } else {
            // Session expired, clear data
            sessionStorage.removeItem('adminData');
            return false;
        }
    } catch (e) {
        sessionStorage.removeItem('adminData');
        return false;
    }
}

// Fungsi untuk simpan session
function setAdminSession(userData) {
    const sessionData = {
        user: userData,
        loginTime: Date.now(),
        expiry: Date.now() + (8 * 60 * 60 * 1000) // 8 jam
    };
    sessionStorage.setItem('adminData', JSON.stringify(sessionData));
}

// Fungsi untuk get admin data
function getAdminData() {
    const adminData = sessionStorage.getItem('adminData');
    if (!adminData) return null;
    
    try {
        const data = JSON.parse(adminData);
        if (data.expiry && data.expiry > Date.now()) {
            return data.user;
        }
    } catch (e) {
        return null;
    }
    return null;
}

// Fungsi logout
function logout() {
    sessionStorage.removeItem('adminData');
    window.location.href = 'index.html';
}

async function initializeLogin() {
    console.log('🚀 Login page loaded');
    
    // Load logo
    await loadLogo();
    
    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('loginMessage');
        const submitBtn = this.querySelector('button[type="submit"]');

        console.log('🔐 Login attempt:', { email, password: '***' });

        // Tampilkan loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...';
        messageEl.classList.add('hidden');

        try {
            const response = await ApiService.verifyLogin(email, password);
            console.log('🔐 Login response:', response);
            
            if (response.success) {
                // Simpan session
                setAdminSession({
                    nama: response.user,
                    email: email,
                    loginTime: new Date().toISOString()
                });
                
                console.log('✅ Login successful, redirecting...');
                showSuccess(messageEl, 'Login berhasil! Mengalihkan...');
                
                // Redirect setelah delay singkat
                setTimeout(() => {
                    window.location.href = 'form.html';
                }, 1000);
                
            } else {
                showError(messageEl, response.message || 'Login gagal');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            showError(messageEl, 'Terjadi kesalahan: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login';
        }
    });
}

// ... fungsi loadLogo, showError, showSuccess tetap sama
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
