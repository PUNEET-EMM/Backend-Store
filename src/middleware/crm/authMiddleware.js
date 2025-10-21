import jwt from "jsonwebtoken";
import InternalUser from "../models/InternalUser.js";
import CorporateProfile from "../models/CorporateProfile.js";
import User from "../models/User.js";
import { sendError } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import { verifyInternalToken } from "../../utils/crm/authUtlis.js";

// Middleware to authenticate internal users
export const authenticateInternalUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return sendError(res, "Authentication token is required", 401);
    }

    // Verify token
   const decoded = verifyInternalToken(token);

    // Find user
    const user = await InternalUser.findById(decoded.userId);

    if (!user) {
      logger.mongo("warn", "Authentication failed - user not found", {
        userId: decoded.userId,
      });
      return sendError(res, "Invalid authentication token", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      logger.mongo("warn", "Authentication failed - user inactive", {
        userId: user._id,
      });
      return sendError(res, "Your account has been deactivated", 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid authentication token", 401);
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Authentication token has expired", 401);
    }

    logger.mongo("error", "Authentication error", {
      message: error.message,
    });
    return sendError(res, "Authentication failed", 500);
  }
};

// Middleware to authenticate corporate users
export const authenticateCorporateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return sendError(res, "Authentication token is required", 401);
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user
    const user = await User.findById(decoded.userId).populate("corporateId");

    if (!user) {
      logger.mongo("warn", "Authentication failed - user not found", {
        userId: decoded.userId,
      });
      return sendError(res, "Invalid authentication token", 401);
    }

    // Check if corporate profile is verified
    if (!user.corporateId.isVerified) {
      logger.mongo("warn", "Authentication failed - corporate not verified", {
        corporateId: user.corporateId._id,
      });
      return sendError(
        res,
        "Your corporate profile is not yet verified",
        403
      );
    }

    // Attach user and corporate to request
    req.user = user;
    req.corporate = user.corporateId;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid authentication token", 401);
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Authentication token has expired", 401);
    }

    logger.mongo("error", "Authentication error", {
      message: error.message,
    });
    return sendError(res, "Authentication failed", 500);
  }
};

// Middleware to check if internal user has admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return sendError(
      res,
      "Access denied. Admin privileges required.",
      403
    );
  }
  next();
};

// Middleware to check corporate user permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions[permission]) {
      logger.mongo("warn", "Permission denied", {
        userId: req.user._id,
        permission,
      });
      return sendError(
        res,
        `Access denied. ${permission} permission required.`,
        403
      );
    }
    next();
  };
};