import axios from "axios";

// ✅ USER SERVICE
export const USER_API = axios.create({
  baseURL: "http://localhost:3001/api/users"
});

// ✅ PRODUCT SERVICE
export const PRODUCT_API = axios.create({
  baseURL: "http://localhost:3002/api/products"
});

// ✅ ORDER SERVICE
export const ORDER_API = axios.create({
  baseURL: "http://localhost:3003/api/orders"
});

// ✅ INVENTORY SERVICE
export const INVENTORY_API = axios.create({
  baseURL: "http://localhost:3004/api/inventory"
});

// 🔔 NOTIFICATION SERVICE (NEW)
export const NOTIFICATION_API = axios.create({
  baseURL: "http://localhost:3005/api"
});

// 💬 CHAT SERVICE (NEW)
export const CHAT_API = axios.create({
  baseURL: "http://localhost:3006/chat"
});

// 📊 ADMIN SERVICE (NEW)
export const ADMIN_API = axios.create({
  baseURL: "http://localhost:3007/admin"
});