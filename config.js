// Ganti dengan URL Google Apps Script Web App Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbxqDzAESks8XqyrITsTL51u9SS_vsIRUb1YIfd-hUkpTxD29V4fgAUbt3Ag4H_XcvaAqQ/exec';

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

const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
};

const checkAuth = (allowedTypes) => {
    const userType = getUserType();
    if (!userType || !allowedTypes.includes(userType)) {
        window.location.href = 'index.html';
    }
};