// Fungsi helper untuk panggil API
class ApiService {
    static async callApi(action, data = null, method = 'GET') {
        try {
            const url = new URL(API_CONFIG.URL);
            
            if (method === 'GET') {
                url.searchParams.append('action', action);
                url.searchParams.append('apiKey', API_CONFIG.KEY);
                
                if (data) {
                    Object.keys(data).forEach(key => {
                        url.searchParams.append(key, data[key]);
                    });
                }
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } else {
                const requestBody = {
                    action: action,
                    apiKey: API_CONFIG.KEY,
                    ...data
                };

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
                return await response.json();
            }
        } catch (error) {
            console.error('API Call Error:', error);
            throw error;
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