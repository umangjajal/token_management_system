const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id, role: user.role, permissions: user.permissions };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// ✨ ADMIN-ONLY MIDDLEWARE
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
      code: "ADMIN_ONLY",
      userRole: req.user.role
    });
  }
  next();
};

// ✨ SUPER ADMIN MIDDLEWARE
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Super Admin access required",
      code: "SUPER_ADMIN_ONLY"
    });
  }
  // Could add further checks for adminLevel if needed
  next();
};

// ✨ ADMIN WITH SPECIFIC PERMISSION
const requirePermission = (permission) => (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
      code: "ADMIN_ONLY"
    });
  }

  if (!req.user.permissions?.includes(permission)) {
    return res.status(403).json({
      message: `Permission denied. Required: ${permission}`,
      code: "PERMISSION_DENIED",
      required: permission,
      available: req.user.permissions || []
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requirePermission
};
