import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  try {
    const authData = localStorage.getItem("__auth");

    if (authData) {
      const parsedAuth = JSON.parse(authData);
      const token = parsedAuth?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn("Não foi possível obter token do localStorage:", error);
  }

  return config;
});

export const fetcher = (url) => api.get(url).then((res) => res.data);
export default api;
