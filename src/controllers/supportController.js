import SupportRequest from "../models/SupportRequest.js";
import { sendError, success } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export const createSupportRequest = async (req, res) => {
  try {
    const { message } = req.validatedData;

    const support = await SupportRequest.create({
      corporateId: req.user.corporateId,
      userId: req.user.userId,
      message,
      status: "open",
    });

    logger.mongo("info", "Support request created", {
      supportId: support._id,
      corporateId: req.user.corporateId,
    });

    return success(
      res,
      support,
      "Support request submitted",
      req.HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.mongo("error", "Create support request failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to submit support request",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const listCorporateSupportRequests = async (req, res) => {
  try {
    const supports = await SupportRequest.find({
      corporateId: req.user.corporateId,
    })
      .sort({ createdAt: -1 });

    return success(res, supports, "Support requests fetched");
  } catch (error) {
    logger.mongo("error", "List support requests failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to fetch support requests",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
