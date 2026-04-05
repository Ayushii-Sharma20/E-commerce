import axios from "axios";

export const USER_API = axios.create({
  baseURL: "http://localhost:3001/api/products"
});

export const PRODUCT_API = axios.create({
  baseURL: "http://localhost:3002/api/products"
});

export const ORDER_API = axios.create({
  baseURL: "http://localhost:3003/api/orders"
});

export const INVENTORY_API = axios.create({
  baseURL: "http://localhost:3004/api/inventory"
});