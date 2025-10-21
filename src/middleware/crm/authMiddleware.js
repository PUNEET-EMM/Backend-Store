import jwt from "jsonwebtoken";
import InternalUser from "../../models/crm/InternalUser.js";
import { sendError } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";
import { verifyInternalToken } from "../../utils/crm/authUtlis.js";

export const authenticateInternalUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return sendError(res, "Authentication token is required", 401);
    }

   const decoded = verifyInternalToken(token);

    const user = await InternalUser.findById(decoded.userId);

    if (!user) {
      logger.mongo("warn", "Authentication failed - user not found", {
        userId: decoded.userId,
      });
      return sendError(res, "Invalid authentication token", 401);
    }

    if (!user.isActive) {
      logger.mongo("warn", "Authentication failed - user inactive", {
        userId: user._id,
      });
      return sendError(res, "Your account has been deactivated", 403);
    }

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

