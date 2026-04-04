import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3002/api"
});

// 🔥 ORDER SERVICE
export const ORDER_API = axios.create({
  baseURL: "http://localhost:3003/api"
});

export default API;