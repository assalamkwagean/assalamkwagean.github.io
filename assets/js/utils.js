const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbwzOno2-BuJRCPYh8wknLHIITLK0Fu1qS-YMqz_aNGpy8M0ar942OQ6i7o8KSuWytPQnA/exec',
    VERSION: '1.0.0',
    AUTH_TOKEN_KEY: 'tabungan_santri_token',
    USER_DATA_KEY: 'tabungan_santri_user',
    USER_TYPE_KEY: 'tabungan_santri_type'
};

// Format currency to Indonesian Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date to Indonesian format
function formatDate(dateString) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Show loading state on button
function showLoading(button, isLoading = true) {
    button.disabled = isLoading;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline';
    if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
}

// Show error or success message
function showMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = type === 'error' ? 'error-message' : 'success-message';
    element.style.display = 'block';

    // Auto hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// API call helper
async function callAPI(action, data, options = {}) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.success && result.message === 'Session expired') {
            logout();
            return null;
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Terjadi kesalahan pada sistem. Silakan coba lagi nanti.');
    }
}

// Authentication helpers
function getUserData() {
    const data = localStorage.getItem(CONFIG.USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
}

function getUserType() {
    return localStorage.getItem(CONFIG.USER_TYPE_KEY);
}

function setUserData(data, type) {
    localStorage.setItem(CONFIG.USER_DATA_KEY, JSON.stringify(data));
    localStorage.setItem(CONFIG.USER_TYPE_KEY, type);
}

function logout() {
    localStorage.removeItem(CONFIG.USER_DATA_KEY);
    localStorage.removeItem(CONFIG.USER_TYPE_KEY);
    window.location.href = 'index.html';
}

// Check user authentication
function checkAuth(allowedTypes) {
    const userType = getUserType();
    if (!userType || !allowedTypes.includes(userType)) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Generate unique ID
function generateId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Input validation
function validateInput(value, type) {
    switch (type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'nis':
            return /^\d{4,10}$/.test(value);
        case 'amount':
            return /^\d+$/.test(value) && parseInt(value) > 0;
        case 'password':
            return value.length >= 6;
        default:
            return true;
    }
}

// Create element with classes
function createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    if (classes.length) element.classList.add(...classes);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    return element;
}
