import SupportRequest from "../../models/SupportRequest.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";

export const listAllSupportRequests = async (_req, res) => {
  try {
    const supports = await SupportRequest.find()
      .populate("corporateId", "companyLegalName adminEmail")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return success(res, supports, "Support requests fetched");
  } catch (error) {
    logger.mongo("error", "List all support requests failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to fetch support requests",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
