// assets/js/config.js
const API_CONFIG = {
    // GANTI dengan URL Web App Anda dari GAS
    URL: 'https://script.google.com/macros/s/AKfycbwyy25QJ8y1VKu9t31lN8f6jCxypqcIwKGT1aSjoaNzT-fdL-jsZpavNLBt9Y22vSY2/exec',
    
    // API Key harus sama dengan di GAS
    KEY: 'PondokAsSalam2025!SecretKey@DigitalPayment'
};

console.log('API Config loaded:', {
    URL: API_CONFIG.URL,
    KEY: API_CONFIG.KEY ? '***' : 'missing'
});

