import CreditRequest from "../../models/CreditRequest.js";
import CorporateProfile from "../../models/CorporateProfile.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";

export const listCreditRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await CreditRequest.find(filter)
      .populate("corporateId", "companyLegalName adminEmail")
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });

    return success(res, requests, "Credit requests fetched successfully");
  } catch (error) {
    logger.mongo("error", "List credit requests failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to fetch credit requests",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const decideCreditRequest = async (req, res) => {
  try {
    const { action, note } = req.validatedData;
    const { id } = req.params;

    const creditRequest = await CreditRequest.findById(id);
    if (!creditRequest) {
      return sendError(
        res,
        "Credit request not found",
        req.HTTP_STATUS.NOT_FOUND
      );
    }

    if (creditRequest.status !== "pending") {
      return sendError(
        res,
        "This request has already been processed",
        req.HTTP_STATUS.BAD_REQUEST
      );
    }

    creditRequest.status = action === "approve" ? "approved" : "rejected";
    creditRequest.decisionNote = note;
    creditRequest.decidedBy = req.user._id;
    creditRequest.decidedAt = new Date();

    if (action === "approve") {
      await CorporateProfile.findByIdAndUpdate(
        creditRequest.corporateId,
        { $inc: { creditLimit: creditRequest.amount } },
        { new: true }
      );
    }

    await creditRequest.save();

    logger.mongo("info", "Credit request decision recorded", {
      creditRequestId: creditRequest._id,
      action,
      decidedBy: req.user._id,
    });

    return success(
      res,
      creditRequest,
      `Credit request ${creditRequest.status} successfully`
    );
  } catch (error) {
    logger.mongo("error", "Decide credit request failed", {
      message: error.message,
    });
    return sendError(
      res,
      "Failed to update credit request",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
