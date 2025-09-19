import axios from "axios";

const apiClient = axios.create({
  baseURL:
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
