// assets/js/login.js - FIXED VERSION
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

    // Handle toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
}

async function loadLogo() {
    try {
        // Gunakan logo lokal dari assets
        const logoImage = document.getElementById('logoImage');
        const logoLoading = document.getElementById('logoLoading');
        
        logoImage.src = 'assets/images/logo.png';
        logoImage.onload = function() {
            logoImage.classList.remove('hidden');
            logoLoading.classList.add('hidden');
        };
        
        logoImage.onerror = function() {
            console.log('Local logo failed, trying API...');
            // Fallback ke API
            ApiService.getAppLogo().then(response => {
                if (response.success && response.url) {
                    logoImage.src = response.url;
                }
            }).catch(err => {
                console.error('Failed to load logo:', err);
                logoLoading.innerHTML = '<i class="fas fa-image text-2xl"></i>';
            });
        };
    } catch (error) {
        console.error('Error loading logo:', error);
        document.getElementById('logoLoading').innerHTML = '<i class="fas fa-exclamation-circle text-red-500 text-2xl"></i>';
    }
}

// 🔧 TAMBAHKAN FUNGSI YANG HILANG
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.remove('bg-green-600', 'text-green-100');
    element.classList.add('bg-red-600', 'text-red-100');
}

function showSuccess(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.remove('bg-red-600', 'text-red-100');
    element.classList.add('bg-green-600', 'text-green-100');
}
