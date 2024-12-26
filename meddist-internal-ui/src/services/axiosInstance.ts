/** @format */

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3003",
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      token = sessionStorage.getItem("accessToken");
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
