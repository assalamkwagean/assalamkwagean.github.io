// Pastikan auth.js sudah include fungsi yang diperlukan
class AuthService {
    static isLoggedIn() {
        const adminData = sessionStorage.getItem('adminData');
        if (!adminData) return false;
        
        try {
            const data = JSON.parse(adminData);
            if (data.expiry && data.expiry > Date.now()) {
                return true;
            } else {
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
        localStorage.removeItem('adminData');
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

// Global functions
function isLoggedIn() {
    return AuthService.isLoggedIn();
}

function getAdminData() {
    return AuthService.getAdminData();
}

function logout() {
    AuthService.logout();
}

// Session manager untuk auto logout
class SessionManager {
    constructor() {
        this.timeout = 30 * 60 * 1000;
        this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        this.timer = null;
        this.init();
    }

    init() {
        if (!AuthService.isLoggedIn()) return;
        this.resetTimer();
        this.events.forEach(event => {
            document.addEventListener(event, () => this.resetTimer());
        });
    }

    resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (AuthService.isLoggedIn()) {
                alert('Sesi telah berakhir karena tidak ada aktivitas.');
                AuthService.logout();
            }
        }, this.timeout);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new SessionManager();
});
