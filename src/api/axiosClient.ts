import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080", // URL backend
});

// ✅ Interceptor để tự thêm token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Xử lý tự động khi token hết hạn
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Token hết hạn hoặc không hợp lệ.");
            // có thể navigate đến trang login
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
