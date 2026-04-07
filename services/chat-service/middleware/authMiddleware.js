const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
      error: "Missing bearer token"
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        error: "Token must include userId and role"
      });
    }

    req.user = {
      userId: String(userId),
      id: String(userId),
      role: decoded.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token validation failed",
      error: error.message
    });
  }
};
