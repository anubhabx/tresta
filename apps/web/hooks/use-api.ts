import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

export const useApi = () => {
  const { getToken } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return api;
};
