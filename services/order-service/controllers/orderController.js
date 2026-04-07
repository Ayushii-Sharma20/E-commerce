const axios = require("axios");
const Order = require("../models/Order");
const { sendToQueue } = require("../utils/rabbitmq");

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:3002/api/products";
const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || "http://localhost:3004/api/inventory";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005/api";
const SERVICE_TIMEOUT = Number(process.env.SERVICE_TIMEOUT_MS || 5000);

const productClient = axios.create({
  baseURL: PRODUCT_SERVICE_URL,
  timeout: SERVICE_TIMEOUT
});

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
  timeout: SERVICE_TIMEOUT
});

const notificationClient = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  timeout: SERVICE_TIMEOUT
});

const sendError = (res, statusCode, message, error = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    error: error ? (typeof error === "string" ? error : error.message) : null
  });

const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });

const isConcurrencyError = (error) => error?.name === "VersionError";

const getForwardHeaders = (req) => {
  const authorization = req.header("Authorization") || req.header("authorization");
  return authorization ? { Authorization: authorization } : {};
};

const extractSellerItems = (order, sellerId) =>
  order.items.filter((item) => item.sellerId === sellerId);

const calculateOrderItemTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

const buildMonthlyRevenue = (orders, sellerId = null) => {
  const monthlyMap = new Map();

  orders.forEach((order) => {
    const key = new Date(order.createdAt).toISOString().slice(0, 7);
    const items = sellerId ? extractSellerItems(order, sellerId) : order.items;
    const revenue = calculateOrderItemTotal(items);

    monthlyMap.set(key, (monthlyMap.get(key) || 0) + revenue);
  });

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
};

const releaseReservedInventory = async (items) => {
  await Promise.allSettled(
    items.map((item) =>
      inventoryClient.post("/release", {
        productId: item.productId,
        quantity: item.quantity
      })
    )
  );
};

exports.createOrder = async (req, res) => {
  const { items = [], shippingInfo = {}, paymentMethod = "card" } = req.body;
  const buyerId = req.user.userId;

  if (!Array.isArray(items) || items.length === 0) {
    return sendError(res, 400, "Order must contain at least one item");
  }

  const reservedItems = [];

  try {
    const enrichedItems = [];
    const sellerIds = new Set();
    const headers = getForwardHeaders(req);

    for (const item of items) {
      if (!item.productId || Number(item.quantity) <= 0) {
        return sendError(res, 400, "Each order item must include productId and quantity");
      }

      const productResponse = await productClient.get(`/${item.productId}`, {
        headers
      });
      const product = productResponse.data.product;

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.status !== "APPROVED") {
        return sendError(res, 400, `${product.name} is not available for purchase`);
      }

      await inventoryClient.post("/reserve", {
        productId: item.productId,
        quantity: Number(item.quantity)
      });

      reservedItems.push({
        productId: item.productId,
        quantity: Number(item.quantity)
      });

      sellerIds.add(product.sellerId);

      enrichedItems.push({
        productId: product._id.toString(),
        sellerId: product.sellerId,
        name: product.name,
        price: Number(product.price),
        quantity: Number(item.quantity),
        size: item.size || "",
        color: item.color || "",
        image: product.image || ""
      });
    }

    const totalAmount = calculateOrderItemTotal(enrichedItems);

    const order = await Order.create({
      buyerId,
      sellerIds: Array.from(sellerIds),
      items: enrichedItems,
      totalAmount,
      shippingInfo,
      paymentMethod,
      status: "PENDING"
    });

    try {
      await Promise.all(
        reservedItems.map((item) =>
          inventoryClient.post("/confirm", {
            productId: item.productId,
            quantity: item.quantity
          })
        )
      );
    } catch (error) {
      await releaseReservedInventory(reservedItems);
      await Order.findByIdAndDelete(order._id);

      return sendError(
        res,
        error.response?.status || 500,
        "Failed to confirm inventory for order",
        error.response?.data?.error || error
      );
    }

    order.status = "CONFIRMED";
    await order.save();

    sendToQueue({
      userId: order.buyerId,
      message: `Order ${order._id} placed successfully`,
      type: "order"
    });

    await Promise.allSettled(
      Array.from(sellerIds).map((sellerId) =>
        notificationClient.post("/notify", {
          sellerId,
          message: `New order ${order._id} received`
        })
      )
    );

    return sendSuccess(res, 201, "Order placed successfully", {
      order
    });
  } catch (error) {
    if (reservedItems.length > 0) {
      await releaseReservedInventory(reservedItems);
    }

    console.error("❌ CREATE ORDER FAILED", {
      message: error.message,
      stack: error.stack,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });

    if (error.response) {
      return sendError(
        res,
        error.response.status || 500,
        error.response.data?.message || "Inter-service request failed",
        error.response.data?.error || error.message
      );
    }

    return sendError(res, 500, "Failed to create order", error);
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const requestedBuyerId = req.params.userId;

    if (req.user.role !== "admin" && req.user.userId !== requestedBuyerId) {
      return sendError(res, 403, "You can only view your own orders");
    }

    const orders = await Order.find({ buyerId: requestedBuyerId }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, "Buyer orders fetched successfully", {
      orders
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch buyer orders", error);
  }
};

exports.getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, "Orders fetched successfully", {
      orders
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch orders", error);
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.role === "admin" ? req.params.sellerId : req.user.userId;

    if (!sellerId) {
      return sendError(res, 400, "sellerId is required");
    }

    const orders = await Order.find({ sellerIds: sellerId }).sort({ createdAt: -1 });

    const sellerOrders = orders.map((order) => {
      const sellerItems = extractSellerItems(order, sellerId);

      return {
        ...order.toObject(),
        items: sellerItems,
        sellerRevenue: calculateOrderItemTotal(sellerItems)
      };
    });

    return sendSuccess(res, 200, "Seller orders fetched successfully", {
      orders: sellerOrders
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch seller orders", error);
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    const isBuyer = order.buyerId === req.user.userId;
    const isSeller = order.sellerIds.includes(req.user.userId);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return sendError(res, 403, "You do not have access to this order");
    }

    const responseOrder =
      req.user.role === "seller"
        ? {
            ...order.toObject(),
            items: extractSellerItems(order, req.user.userId),
            sellerRevenue: calculateOrderItemTotal(
              extractSellerItems(order, req.user.userId)
            )
          }
        : order;

    return sendSuccess(res, 200, "Order fetched successfully", {
      order: responseOrder
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch order", error);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowedStatuses.join(", ")}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (
      req.user.role !== "admin" &&
      !order.sellerIds.includes(req.user.userId)
    ) {
      return sendError(res, 403, "You can only update your own seller orders");
    }

    order.status = status;
    await order.save();

    return sendSuccess(res, 200, "Order status updated successfully", {
      order
    });
  } catch (error) {
    if (isConcurrencyError(error)) {
      return sendError(
        res,
        409,
        "Order status was changed by another request. Please refresh and try again."
      );
    }

    return sendError(res, 500, "Failed to update order status", error);
  }
};

exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const orders = await Order.find({ sellerIds: sellerId }).sort({ createdAt: 1 });

    const deliveredStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED"];
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + calculateOrderItemTotal(extractSellerItems(order, sellerId)),
      0
    );
    const monthlyRevenue = buildMonthlyRevenue(
      orders.filter((order) => deliveredStatuses.includes(order.status)),
      sellerId
    );

    return sendSuccess(res, 200, "Seller analytics fetched successfully", {
      analytics: {
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        monthlyRevenue
      }
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch seller analytics", error);
  }
};

exports.getAdminAnalytics = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + calculateOrderItemTotal(order.items),
      0
    );
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const topProductsMap = new Map();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = topProductsMap.get(item.productId) || {
          productId: item.productId,
          name: item.name,
          quantitySold: 0,
          revenue: 0
        };

        existing.quantitySold += Number(item.quantity);
        existing.revenue += Number(item.price) * Number(item.quantity);
        topProductsMap.set(item.productId, existing);
      });
    });

    return sendSuccess(res, 200, "Admin analytics fetched successfully", {
      analytics: {
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        monthlyRevenue: buildMonthlyRevenue(orders),
        topSellingProducts: Array.from(topProductsMap.values())
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 5)
      }
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch admin analytics", error);
  }
};
