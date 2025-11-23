import Joi from "joi";
import { sendError } from "../utils/apiResponse.js";

const addItemSchema = Joi.object({
  productId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Product ID is required",
      "string.pattern.base": "Invalid product ID",
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be at least 1",
      "any.required": "Quantity is required",
    }),
});

export const validateAddToCart = (req, res, next) => {
  const { error, value } = addItemSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return sendError(res, "Validation failed", 400, errors);
  }

  req.validatedData = value;
  return next();
};
