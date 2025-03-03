import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URI || "http://localhost:3000/",
});

export default axiosInstance;
