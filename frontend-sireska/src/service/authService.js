import api from '../api/axios';

const authService = {

    register: async (nim_nip, nama_lengkap, email, password) => {
        const res = await api.post('/auth/register', { nim_nip, nama_lengkap, email, password });
        return res.data;
    },

    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('authChange'));
        return res.data;
    },

    verifyOtp: async (email, otp) => {
        const res = await api.post('/auth/verify-otp', { email, otp });
        return res.data;
    },

    resendOtp: async (email) => {
        const res = await api.post('/auth/resend-otp', { email });
        return res.data;
    },

    getProfile: async () => {
        const res = await api.get('/auth/profile');
        return res.data;
    },

    updateProfile: async (payload) => {
        const res = await api.put('/auth/profile', payload);
        return res.data;
    },

    changePassword: async (password_lama, password_baru) => {
        const res = await api.post('/auth/change-password', { password_lama, password_baru });
        return res.data;
    },

    // Forgot password dengan OTP (2 langkah)
    forgotPasswordSendOtp: async (email) => {
        const res = await api.post('/auth/forgot-password', { email });
        return res.data;
    },

    // Verifikasi OTP sekaligus reset password
    resetPassword: async (email, otp, password) => {
        const res = await api.post('/auth/reset-password', { email, otp, password });
        return res.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

export default authService;