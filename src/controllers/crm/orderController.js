import Order from "../../models/Order.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.validatedData;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(
        res,
        "Order not found",
        req.HTTP_STATUS.NOT_FOUND
      );
    }

    if (order.status === "delivered") {
      return sendError(
        res,
        "Order is already delivered",
        req.HTTP_STATUS.BAD_REQUEST
      );
    }

    order.status = status;
    await order.save();

    logger.mongo("info", "Order status updated", {
      orderId: order._id,
      status,
      updatedBy: req.user._id,
    });

    return success(res, order, "Order status updated");
  } catch (error) {
    logger.mongo("error", "Update order status failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to update order status",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
