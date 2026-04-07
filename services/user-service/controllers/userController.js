const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ALLOWED_PUBLIC_ROLES = ["buyer", "seller"];

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

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  blocked: user.blocked,
  sellerStatus: user.sellerStatus,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const normalizeRole = (role) => {
  if (!role || typeof role !== "string") {
    return "buyer";
  }

  const normalizedRole = role.toLowerCase();
  return ALLOWED_PUBLIC_ROLES.includes(normalizedRole) ? normalizedRole : "buyer";
};

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = normalizeRole(req.body.role);

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role
    });

    return sendSuccess(res, 201, "User registered successfully", {
      user: sanitizeUser(user)
    });
  } catch (error) {
    return sendError(res, 500, "Failed to register user", error);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (role && user.role !== role.toLowerCase()) {
      return sendError(res, 403, `This account does not have ${role} access`);
    }

    if (user.blocked) {
      return sendError(res, 403, "Your account is blocked");
    }

    if (user.role === "seller" && user.sellerStatus === "rejected") {
      return sendError(res, 403, "Seller account has been rejected");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid credentials");
    }

    const token = signToken(user);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return sendError(res, 500, "Failed to login user", error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Profile fetched successfully", {
      user
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch profile", error);
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.userId === id) {
      return sendError(res, 400, "You cannot block yourself");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.role === "admin") {
      return sendError(res, 403, "Admin accounts cannot be blocked");
    }

    user.blocked = !user.blocked;
    await user.save();

    return sendSuccess(res, 200, "User status updated successfully", {
      user: sanitizeUser(user)
    });
  } catch (error) {
    return sendError(res, 500, "Failed to update user status", error);
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Users fetched successfully", {
      users
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch users", error);
  }
};

exports.getAllSellers = async (_req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("-password")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Sellers fetched successfully", {
      sellers
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch sellers", error);
  }
};

exports.updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerStatus, blocked } = req.body;

    const allowedStatuses = ["approved", "rejected", "pending"];
    if (!sellerStatus || !allowedStatuses.includes(String(sellerStatus).toLowerCase())) {
      return sendError(
        res,
        400,
        "sellerStatus must be one of: approved, rejected, pending"
      );
    }

    const seller = await User.findById(id);
    if (!seller) {
      return sendError(res, 404, "Seller not found");
    }

    if (seller.role !== "seller") {
      return sendError(res, 400, "Target user is not a seller");
    }

    seller.sellerStatus = String(sellerStatus).toLowerCase();

    if (typeof blocked === "boolean") {
      seller.blocked = blocked;
    }

    await seller.save();

    return sendSuccess(res, 200, "Seller status updated successfully", {
      seller: sanitizeUser(seller)
    });
  } catch (error) {
    return sendError(res, 500, "Failed to update seller status", error);
  }
};

exports.getAdminAnalytics = async (_req, res) => {
  try {
    const [totalUsers, totalBuyers, totalSellers, approvedSellers, blockedUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "buyer" }),
        User.countDocuments({ role: "seller" }),
        User.countDocuments({ role: "seller", sellerStatus: "approved" }),
        User.countDocuments({ blocked: true })
      ]);

    return sendSuccess(res, 200, "User analytics fetched successfully", {
      analytics: {
        totalUsers,
        totalBuyers,
        totalSellers,
        approvedSellers,
        blockedUsers
      }
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch user analytics", error);
  }
};

exports.getChatContacts = async (req, res) => {
  try {
    let query = { _id: { $ne: req.user.userId }, blocked: false };

    if (req.user.role === "buyer") {
      query = {
        ...query,
        role: { $in: ["seller", "admin"] }
      };
    }

    if (req.user.role === "seller") {
      query = {
        ...query,
        role: { $in: ["buyer", "admin"] }
      };
    }

    if (req.user.role === "admin") {
      query = {
        ...query,
        role: { $in: ["buyer", "seller"] }
      };
    }

    const users = await User.find(query)
      .select("_id name email role sellerStatus")
      .sort({ role: 1, name: 1 });

    return sendSuccess(res, 200, "Chat contacts fetched successfully", {
      users
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch chat contacts", error);
  }
};
