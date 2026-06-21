// src/config/api.js

import axios from 'axios';

// Create an instance of axios that uses the .env variable
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// The interceptor remains the same, it will attach the token to every request
api.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem('user'));

        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;