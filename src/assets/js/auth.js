const API_URL = 'https://gymfinder953.runasp.net/api'; // URL khi deploy lên MonsterASP
// const API_URL = 'http://localhost:5037/api';

const Auth = {
    async login(email, password) {
        console.log('Attempting login for:', email);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                localStorage.setItem('gym-user', JSON.stringify(data.user));
                localStorage.setItem('gym-login', 'true');
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error details:', error);
            return { success: false, message: 'Không thể kết nối với máy chủ. Vui lòng đảm bảo Backend đang chạy.' };
        }
    },

    async register(user, otp) {
        console.log('Attempting registration for:', user.email);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, otp })
            });

            const data = await response.json();
            if (data.success) {
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Không thể kết nối với máy chủ.' };
        }
    },

    async sendOtp(email) {
        console.log('Sending OTP to:', email);
        try {
            const response = await fetch(`${API_URL}/otp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            console.error('Send OTP error:', error);
            return { success: false, message: 'Không thể kết nối với máy chủ.' };
        }
    },

    async verifyOtp(email, otp) {
        console.log('Verify OTP for:', email);
        try {
            const response = await fetch(`${API_URL}/otp/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            console.error('Verify OTP error:', error);
            return { success: false, message: 'Không thể kết nối với máy chủ.' };
        }
    },

    async forgotPassword(email) {
        console.log('Forgot password request for:', email);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, message: 'Không thể kết nối với máy chủ.' };
        }
    },

    async resetPassword(email, otp, newPassword) {
        console.log('Reset password for:', email);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, message: 'Không thể kết nối với máy chủ.' };
        }
    },

    logout() {
        localStorage.removeItem('gym-user');
        localStorage.removeItem('gym-login');
        window.location.href = 'index.html';
    },

    getUser() {
        const user = localStorage.getItem('gym-user');
        return user ? JSON.parse(user) : null;
    },

    checkAuthState() {
        const isLoggedIn = localStorage.getItem('gym-login') === 'true';
        const user = this.getUser();

        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');
        const userNameSpan = document.getElementById('user-display-name');

        const loginBtnMobile = document.getElementById('login-btn-mobile');
        const logoutBtnMobile = document.getElementById('logout-btn-mobile');
        const userInfoMobile = document.getElementById('user-info-mobile');
        const userNameMobile = document.getElementById('user-display-name-mobile');

        if (isLoggedIn && user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
                if (userNameSpan) userNameSpan.textContent = `Hi, ${user.fullName}!`;
            }

            if (loginBtnMobile) loginBtnMobile.parentElement.classList.add('hidden');
            if (userInfoMobile) {
                userInfoMobile.classList.remove('hidden');
                if (userNameMobile) userNameMobile.textContent = `Hi, ${user.fullName}!`;
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userInfo) {
                userInfo.classList.add('hidden');
                userInfo.classList.remove('flex');
            }

            if (loginBtnMobile) loginBtnMobile.parentElement.classList.remove('hidden');
            if (userInfoMobile) userInfoMobile.classList.add('hidden');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth.checkAuthState();

    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }

    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
});
