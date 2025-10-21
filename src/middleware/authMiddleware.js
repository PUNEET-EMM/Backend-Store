// middleware/authMiddleware.js
import { verifyToken } from "../utils/authUtils.js";
import { sendError } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        "Authentication required. Please provide a valid token.",
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      logger.mongo("warn", "Invalid token provided", {
        ip: req.ip,
      });
      return sendError(res, "Invalid or expired token", 401);
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      corporateId: decoded.corporateId,
    };

    next();
  } catch (error) {
    logger.mongo("error", "Authentication middleware error", {
      message: error.message,
    });
    return sendError(res, "Authentication failed", 401);
  }
};

/**
 * Middleware to check if user has specific role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.mongo("warn", "Unauthorized access attempt", {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
      });
      return sendError(
        res,
        "You do not have permission to access this resource",
        403
      );
    }

    next();
  };
};

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Required permission key
 */
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, "Authentication required", 401);
      }

      const User = (await import("../models/User.js")).default;
      const user = await User.findById(req.user.userId);

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      if (!user.permissions || !user.permissions[permission]) {
        logger.mongo("warn", "Permission denied", {
          userId: req.user.userId,
          permission,
        });
        return sendError(
          res,
          `You do not have permission to perform this action`,
          403
        );
      }

      next();
    } catch (error) {
      logger.mongo("error", "Permission check error", {
        message: error.message,
      });
      return sendError(res, "Failed to verify permissions", 500);
    }
  };
};