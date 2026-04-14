import api from '../api/axios';

const authService = {

    register: async (nim_nip, nama_lengkap, email, password) => {
        const res = await api.post('/auth/register', {
            nim_nip, nama_lengkap, email, password
        });
        return res.data; 
    },

    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token); 
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

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

export default authService;