// assets/js/api.js - Tambahkan debugging lebih detail
class ApiService {
    static async callApi(action, data = null, method = 'GET') {
        console.log(`🔧 API Call: ${action}`, { method, data });
        
        try {
            if (method === 'GET') {
                const url = new URL(API_CONFIG.URL);
                url.searchParams.append('action', action);
                url.searchParams.append('apiKey', API_CONFIG.KEY);
                
                if (data) {
                    Object.keys(data).forEach(key => {
                        url.searchParams.append(key, data[key]);
                    });
                }
                
                console.log('🔧 GET URL:', url.toString());
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('✅ API Response:', result);
                return result;
                
            } else {
                const requestBody = {
                    action: action,
                    apiKey: API_CONFIG.KEY,
                    ...data
                };

                console.log('🔧 POST Request:', requestBody);
                
                const response = await fetch(API_CONFIG.URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('✅ API Response:', result);
                return result;
            }
        } catch (error) {
            console.error('❌ API Call Error:', error);
            return { 
                success: false, 
                message: 'Network error: ' + error.message 
            };
        }
    }

    // GET requests
    static getActiveStudents() {
        return this.callApi('getActiveStudents');
    }

    static getCategories() {
        return this.callApi('getCategories');
    }

    static getPaymentMethods() {
        return this.callApi('getPaymentMethods');
    }

    static getAdminUsers() {
        return this.callApi('getAdminUsers');
    }

    static getRecapDetail(nis) {
        return this.callApi('getRecapDetail', { nis: nis });
    }

    static getAppLogo() {
        return this.callApi('getAppLogo');
    }

    // POST requests
    static verifyLogin(email, password) {
        return this.callApi('verifyLogin', { email, password }, 'POST');
    }

    static processPayment(paymentData) {
        return this.callApi('processPayment', { paymentData }, 'POST');
    }
}
