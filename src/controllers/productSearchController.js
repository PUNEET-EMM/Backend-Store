import { Product } from "../models/Product.js";
import { sendError, success } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export const searchProducts = async (req, res) => {
  try {
    const {
      q,
      categoryId,
      subCategoryId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;

    if (q) {
      query.$text = { $search: q };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .select("name sku sellingPrice mrp images categoryId subCategoryId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return success(res, {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    }, "Products fetched");
  } catch (error) {
    logger.mongo("error", "Product search failed", { message: error.message });
    return sendError(
      res,
      "Failed to search products",
      req.HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
