import Homepage from "../../models/Homepage.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";

export const getHomepage = async (_req, res) => {
  try {
    const homepage = await Homepage.findOne().sort({ updatedAt: -1 });
    return success(res, homepage || {}, "Homepage fetched");
  } catch (error) {
    logger.mongo("error", "Fetch homepage failed", { message: error.message });
    return sendError(
      res,
      "Failed to fetch homepage",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export const upsertHomepage = async (req, res) => {
  try {
    const payload = req.validatedData;

    const homepage = await Homepage.findOneAndUpdate(
      {},
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.mongo("info", "Homepage updated", { homepageId: homepage._id });
    return success(res, homepage, "Homepage saved");
  } catch (error) {
    logger.mongo("error", "Update homepage failed", { message: error.message });
    return sendError(
      res,
      "Failed to save homepage",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
