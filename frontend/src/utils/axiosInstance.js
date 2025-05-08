// src/axiosInstance.js
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menyisipkan token secara otomatis
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani token expired (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token
      localStorage.removeItem("token");

      // Tampilkan alert sesi habis
      Swal.fire({
        icon: "warning",
        title: "Sesi Anda Habis",
        text: "Silakan login kembali.",
        confirmButtonText: "OK",
      }).then(() => {
        // Redirect ke halaman login
        window.location.href = "/";
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
