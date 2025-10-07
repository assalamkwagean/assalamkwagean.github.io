// assets/js/config.js
const API_CONFIG = {
    // GANTI dengan URL Web App Anda dari GAS
    URL: 'https://script.google.com/macros/s/AKfycbynqqOd9YJLLkFkbJhunw-LMKi64d6FLCtg6dwHHamUQkvbayr6GF1BvkLgDFx3OgtL/exec',
    
    // API Key harus sama dengan di GAS
    KEY: 'PondokAsSalam2025!SecretKey@DigitalPayment'
};

console.log('API Config loaded:', {
    URL: API_CONFIG.URL,
    KEY: API_CONFIG.KEY ? '***' : 'missing'
});
