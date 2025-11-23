import Order from "../models/Order.js";
import { sendError, success } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export const listCorporateOrders = async (req, res) => {
  try {
    const corporateId = req.user.corporateId;
    const orders = await Order.find({ corporateId })
      .sort({ createdAt: -1 });

    return success(res, orders, "Orders fetched successfully");
  } catch (error) {
    logger.mongo("error", "List corporate orders failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to fetch orders",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const getCorporateOrderById = async (req, res) => {
  try {
    const corporateId = req.user.corporateId;
    const order = await Order.findOne({
      _id: req.params.id,
      corporateId,
    });

    if (!order) {
      return sendError(
        res,
        "Order not found",
        req.HTTP_STATUS.NOT_FOUND
      );
    }

    return success(res, order, "Order fetched successfully");
  } catch (error) {
    logger.mongo("error", "Get corporate order failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to fetch order",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
