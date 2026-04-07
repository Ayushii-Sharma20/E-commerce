const axios = require("axios");
const Product = require("../models/Product");
const redisClient = require("../config/redis");

const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || "http://localhost:3004/api/inventory";
const INVENTORY_TIMEOUT = Number(process.env.SERVICE_TIMEOUT_MS || 5000);
const CACHE_TTL_SECONDS = Number(process.env.REDIS_CACHE_TTL || 120);

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
  timeout: INVENTORY_TIMEOUT
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

const normalizeVariantList = (variants = [], colors = [], fallbackImage = "") => {
  if (Array.isArray(variants) && variants.length > 0) {
    return variants
      .map((variant) => ({
        color: String(variant?.color || "").trim(),
        image: String(variant?.image || "").trim()
      }))
      .filter((variant) => variant.color && variant.image);
  }

  const normalizedColors = Array.isArray(colors)
    ? colors.map((color) => String(color || "").trim()).filter(Boolean)
    : [];

  if (normalizedColors.length === 0 || !fallbackImage) {
    return [];
  }

  return normalizedColors.map((color) => ({
    color,
    image: String(fallbackImage).trim()
  }));
};

const normalizeProductAttributes = (payload = {}) => {
  const baseImage = String(payload.image || "").trim();
  const colors = Array.isArray(payload.colors)
    ? payload.colors.map((color) => String(color || "").trim()).filter(Boolean)
    : [];
  const variants = normalizeVariantList(payload.variants, colors, baseImage);

  return {
    image: variants[0]?.image || baseImage,
    colors:
      variants.length > 0
        ? variants.map((variant) => variant.color)
        : colors,
    variants
  };
};

const canUseRedis = () => redisClient && redisClient.isOpen;

const getCache = async (key) => {
  if (!canUseRedis()) {
    return null;
  }

  return redisClient.get(key);
};

const setCache = async (key, value, ttl = CACHE_TTL_SECONDS) => {
  if (!canUseRedis()) {
    return;
  }

  await redisClient.set(key, JSON.stringify(value), { EX: ttl });
};

const deleteCache = async (...keys) => {
  if (!canUseRedis() || keys.length === 0) {
    return;
  }

  await redisClient.del(keys);
};

const extractSellerId = (req) => {
  if (req.user.role === "seller") {
    return req.user.userId;
  }

  return req.body.sellerId;
};

const getProductStatusForWrite = (req, existingStatus = "APPROVED") => {
  if (req.user.role === "admin") {
    return "APPROVED";
  }

  return existingStatus || "APPROVED";
};

const clearProductCaches = async (productId, sellerId) => {
  const keys = ["products:approved", "products:all"];

  if (productId) {
    keys.push(`product:${productId}`);
  }

  if (sellerId) {
    keys.push(`products:seller:${sellerId}`);
  }

  await deleteCache(...keys);
};

const ensureProductOwnership = async (req, product) => {
  if (req.user.role === "admin") {
    return null;
  }

  if (product.sellerId !== req.user.userId) {
    return "You can only manage your own products";
  }

  return null;
};

const backfillLegacyApprovedProducts = async () => {
  const approvedCount = await Product.countDocuments({ status: "APPROVED" });

  if (approvedCount > 0) {
    return;
  }

  await Product.updateMany(
    { status: { $in: ["PENDING", null] } },
    { $set: { status: "APPROVED" } }
  );

  await deleteCache("products:approved", "products:all");
};

exports.createProduct = async (req, res) => {
  try {
    const sellerId = extractSellerId(req);
    const { name, price, description, stock, category, quantity } = req.body;

    if (!sellerId) {
      return sendError(res, 400, "sellerId is required");
    }

    if (!name || price === undefined) {
      return sendError(res, 400, "Product name and price are required");
    }

    const finalQuantity = Number(quantity ?? stock ?? 0);
    const attributes = normalizeProductAttributes(req.body);
    const product = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      description,
      stock: Number(stock ?? finalQuantity ?? 0),
      image: attributes.image,
      colors: attributes.colors,
      variants: attributes.variants,
      category,
      sellerId,
      status: getProductStatusForWrite(req, "APPROVED")
    });

    try {
      await inventoryClient.post("/", {
        productId: product._id,
        quantity: finalQuantity > 0 ? finalQuantity : 0
      });
    } catch (error) {
      await Product.findByIdAndDelete(product._id);

      return sendError(
        res,
        error.response?.status || 500,
        "Failed to initialize inventory for product",
        error.response?.data?.error || error
      );
    }

    await clearProductCaches(product._id.toString(), sellerId);

    return sendSuccess(res, 201, "Product created successfully", {
      product
    });
  } catch (error) {
    return sendError(res, 500, "Failed to create product", error);
  }
};

const fetchProductsByScope = async (includeAll) => {
  if (!includeAll) {
    await backfillLegacyApprovedProducts();
  }

  const query = includeAll ? {} : { status: "APPROVED" };
  const cacheKey = includeAll ? "products:all" : "products:approved";
  const cachedProducts = await getCache(cacheKey);

  if (cachedProducts) {
    return JSON.parse(cachedProducts);
  }

  let products = await Product.find(query).sort({ createdAt: -1 }).lean();

  // Backward-compatible fallback for older datasets where seller products were left pending.
  if (!includeAll && products.length === 0) {
    products = await Product.find({}).sort({ createdAt: -1 }).lean();
  }

  await setCache(cacheKey, products);
  return products;
};

exports.getProducts = async (_req, res) => {
  try {
    const products = await fetchProductsByScope(false);

    return sendSuccess(res, 200, "Products fetched successfully", {
      products
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch products", error);
  }
};

exports.getAllProducts = async (_req, res) => {
  try {
    const products = await fetchProductsByScope(true);

    return sendSuccess(res, 200, "All products fetched successfully", {
      products
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch all products", error);
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const cacheKey = `products:seller:${req.user.userId}`;
    const cachedProducts = await getCache(cacheKey);

    if (cachedProducts) {
      return sendSuccess(res, 200, "Seller products fetched successfully", {
        products: JSON.parse(cachedProducts)
      });
    }

    const products = await Product.find({ sellerId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    await setCache(cacheKey, products);

    return sendSuccess(res, 200, "Seller products fetched successfully", {
      products
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch seller products", error);
  }
};

exports.getProductById = async (req, res) => {
  try {
    await backfillLegacyApprovedProducts();

    const cacheKey = `product:${req.params.id}`;
    const cachedProduct = await getCache(cacheKey);

    if (cachedProduct) {
      const parsedProduct = JSON.parse(cachedProduct);

      if (parsedProduct.status === "APPROVED") {
        return sendSuccess(res, 200, "Product fetched successfully", {
          product: parsedProduct
        });
      }

      await deleteCache(cacheKey);
    }

    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    await setCache(cacheKey, product);

    return sendSuccess(res, 200, "Product fetched successfully", {
      product
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch product", error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    const ownershipError = await ensureProductOwnership(req, product);
    if (ownershipError) {
      return sendError(res, 403, ownershipError);
    }

    const updates = { ...req.body };
    const attributes = normalizeProductAttributes({
      ...product.toObject(),
      ...updates
    });

    if (req.user.role === "seller") {
      updates.sellerId = req.user.userId;
      updates.status = getProductStatusForWrite(req, product.status);
    }

    updates.image = attributes.image;
    updates.colors = attributes.colors;
    updates.variants = attributes.variants;

    Object.assign(product, updates);
    await product.save();

    await clearProductCaches(product._id.toString(), product.sellerId);

    return sendSuccess(res, 200, "Product updated successfully", {
      product
    });
  } catch (error) {
    if (isConcurrencyError(error)) {
      return sendError(
        res,
        409,
        "Product was updated by another request. Please refresh and try again."
      );
    }

    return sendError(res, 500, "Failed to update product", error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    const ownershipError = await ensureProductOwnership(req, product);
    if (ownershipError) {
      return sendError(res, 403, ownershipError);
    }

    await Product.findByIdAndDelete(product._id);
    await clearProductCaches(product._id.toString(), product.sellerId);

    return sendSuccess(res, 200, "Product deleted successfully");
  } catch (error) {
    return sendError(res, 500, "Failed to delete product", error);
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    product.status = "APPROVED";
    await product.save();

    await clearProductCaches(product._id.toString(), product.sellerId);

    return sendSuccess(res, 200, "Product approved successfully", {
      product
    });
  } catch (error) {
    if (isConcurrencyError(error)) {
      return sendError(
        res,
        409,
        "Product approval conflicted with another update. Please refresh and try again."
      );
    }

    return sendError(res, 500, "Failed to approve product", error);
  }
};
