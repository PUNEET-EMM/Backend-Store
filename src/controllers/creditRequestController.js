import CreditRequest from "../models/CreditRequest.js";
import CorporateProfile from "../models/CorporateProfile.js";
import { sendError, success } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export const createCreditRequest = async (req, res) => {
  try {
    const { amount, reason } = req.validatedData;
    const corporateId = req.user?.corporateId;

    if (!corporateId) {
      return sendError(
        res,
        "Corporate profile not found for user",
        req.HTTP_STATUS.BAD_REQUEST
      );
    }

    const corporateProfile = await CorporateProfile.findById(corporateId);
    if (!corporateProfile) {
      return sendError(
        res,
        "Corporate profile not found",
        req.HTTP_STATUS.NOT_FOUND
      );
    }

    const existingPending = await CreditRequest.findOne({
      corporateId,
      status: "pending",
    });

    if (existingPending) {
      return sendError(
        res,
        "A credit request is already pending review",
        req.HTTP_STATUS.CONFLICT
      );
    }

    const creditRequest = await CreditRequest.create({
      corporateId,
      requestedBy: req.user.userId,
      amount,
      reason,
      status: "pending",
    });

    logger.mongo("info", "Credit request raised", {
      creditRequestId: creditRequest._id,
      corporateId,
      requestedBy: req.user.userId,
    });

    return success(
      res,
      creditRequest,
      "Credit request submitted successfully",
      req.HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.mongo("error", "Create credit request failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to create credit request",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const getCorporateCreditRequests = async (req, res) => {
  try {
    const corporateId = req.user?.corporateId;
    if (!corporateId) {
      return sendError(
        res,
        "Corporate profile not found for user",
        req.HTTP_STATUS.BAD_REQUEST
      );
    }

    const requests = await CreditRequest.find({ corporateId })
      .sort({ createdAt: -1 });

    return success(res, requests, "Credit requests fetched successfully");
  } catch (error) {
    logger.mongo("error", "Fetch corporate credit requests failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to fetch credit requests",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
