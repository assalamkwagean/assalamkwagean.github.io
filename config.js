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
    let alertClass = '';
    let icon = '';

    switch (type) {
        case 'success':
            alertClass = 'success-message';
            icon = '✓';
            break;
        case 'error':
            alertClass = 'error-message';
            icon = '✖';
            break;
        case 'warning':
            alertClass = 'warning-message';
            icon = '⚠️';
            break;
        default:
            alertClass = 'info-message';
            icon = 'ℹ️';
    }

    element.innerHTML = `<span class="alert-icon">${icon}</span> ${message}`;
    element.className = alertClass;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
};

const handleApiError = (error) => {
    console.error('API Error:', error);
    showMessage('errorMessage', 'Terjadi kesalahan koneksi. Silakan coba lagi.', 'error');
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

// Fungsi untuk memuat data santri
async function loadSantriData() {
    try {
        const response = await fetch(`${API_URL}?action=getDataSantri`, {
            method: 'POST',
            body: JSON.stringify({})
        });
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error loading santri data:', error);
        return [];
    }
}

// Inisialisasi Select2 untuk pemilihan NIS
function initializeNisSelect(selectElement, filterByPembimbing = null) {
    loadSantriData().then(santriData => {
        let filteredData = santriData;

        // Filter berdasarkan pembimbing jika diperlukan
        if (filterByPembimbing) {
            filteredData = santriData.filter(santri =>
                santri.pembimbing === filterByPembimbing
            );
        }

        // Clear existing options
        selectElement.innerHTML = '<option value="">Pilih NIS Santri</option>';

        // Add options
        filteredData.forEach(santri => {
            const option = document.createElement('option');
            option.value = santri.nis;
            option.textContent = `${santri.nis} - ${santri.nama}`;
            option.setAttribute('data-limit', santri.limitHarian);
            option.setAttribute('data-pembimbing', santri.pembimbing);
            selectElement.appendChild(option);
        });

        // Initialize Select2
        $(selectElement).select2({
            placeholder: "Pilih NIS Santri",
            allowClear: true,
            width: '100%'
        });
    });
}
