// Ganti dengan URL Google Apps Script Web App Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbw1DFxgoTWLkC_rHMPcgvFARZYV_DxoPuq_1LheYo6-ISjJGnBW-NYmWZGRuwjLe1PT_w/exec';

// Helper Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const showLoading = (button) => {
    button.disabled = true;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    if (btnText) btnText.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
};

const hideLoading = (button) => {
    button.disabled = false;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
};

const showMessage = (elementId, message, type = 'error') => {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = type === 'error' ? 'error-message' : 'success-message';
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
};

const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

const getUserType = () => {
    return localStorage.getItem('userType');
};

const getCSRFToken = () => {
    return localStorage.getItem('csrfToken');
};

const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('csrfToken');
    window.location.href = 'index.html';
};

const callAPI = async (action, data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let url = `${API_URL}?action=${action}`;
    
    // Add CSRF token for non-login requests
    if (action !== 'login') {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            logout(); // Invalid session
            return;
        }
        url += `&csrfToken=${csrfToken}`;
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        // Handle CSRF validation failures
        if (!result.success && result.message === 'Sesi tidak valid. Silakan login kembali.') {
            logout();
            return;
        }

        // Store CSRF token from login response
        if (action === 'login' && result.success && result.csrfToken) {
            localStorage.setItem('csrfToken', result.csrfToken);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada sistem. Silakan coba lagi nanti.'
        };
    }
};

const checkAuth = (allowedTypes) => {
    const userType = getUserType();
    if (!userType || !allowedTypes.includes(userType)) {
        window.location.href = 'index.html';
    }
};