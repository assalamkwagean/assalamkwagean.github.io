// assets/js/auth.js - Authentication Utilities
class AuthService {
    static isLoggedIn() {
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

    static setAdminSession(userData) {
        const sessionData = {
            user: userData,
            loginTime: Date.now(),
            expiry: Date.now() + (8 * 60 * 60 * 1000) // 8 jam
        };
        sessionStorage.setItem('adminData', JSON.stringify(sessionData));
    }

    static getAdminData() {
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

    static logout() {
        sessionStorage.removeItem('adminData');
        window.location.href = 'index.html';
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            alert('Sesi telah berakhir. Silakan login kembali.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// Global functions untuk kompatibilitas
function isLoggedIn() {
    return AuthService.isLoggedIn();
}

function getAdminData() {
    return AuthService.getAdminData();
}

function logout() {
    AuthService.logout();
}
