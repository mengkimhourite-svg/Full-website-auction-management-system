import axios from 'axios';

// បង្កើត Axios Instance
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // ចាំបាច់សម្រាប់ការបញ្ជូន Cookie ពី Backend
});

// Interceptor: គ្រប់គ្រង Error 401 ដោយស្វ័យប្រវត្តិ
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // បើ Token មិនត្រឹមត្រូវ បញ្ជូនទៅ Login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;