import axios from "axios";
import { getAccessToken, handleUnauthorizedSession, isExpiredSessionError } from "@/lib/auth";

const attachAuthInterceptor = (client: ReturnType<typeof axios.create>) => {
  client.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (typeof window !== "undefined" && isExpiredSessionError(error)) {
        handleUnauthorizedSession();
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const createClient = (baseURL: string) =>
  attachAuthInterceptor(
    axios.create({
      baseURL,
      timeout: 8000
    })
  );

export const USER_API = createClient("http://localhost:3001/api/users");
export const PRODUCT_API = createClient("http://localhost:3002/api/products");
export const ORDER_API = createClient("http://localhost:3003/api/orders");
export const INVENTORY_API = createClient("http://localhost:3004/api/inventory");
export const NOTIFICATION_API = createClient("http://localhost:3005/api");
export const CHAT_API = createClient("http://localhost:3006/chat");
