import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', 
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || '';

        if (status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        if (status === 403 && message.includes('diverifikasi')) {
            const email = error.response?.data?.email || '';
            window.location.href = `/verify-otp?email=${email}`;
        }
                if (
            status === 403 &&
            error.response?.data?.code === "ACCOUNT_DISABLED"
        ) {
            localStorage.removeItem('token');
            window.location.href = '/akun-nonaktif';
        }

        return Promise.reject(error);
    }
);

export default api;