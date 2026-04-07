module.exports = (...inputRoles) => {
  const roles =
    inputRoles.length === 1 && Array.isArray(inputRoles[0]) ? inputRoles[0] : inputRoles;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        error: "Authentication required"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        error: `Required role: ${roles.join(", ")}`
      });
    }

    return next();
  };
};
