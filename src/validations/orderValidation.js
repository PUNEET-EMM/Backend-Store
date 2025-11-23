import Joi from "joi";
import { sendError } from "../utils/apiResponse.js";

const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("out_for_delivery", "delivered")
    .required()
    .messages({
      "any.only": "Status must be out_for_delivery or delivered",
      "any.required": "Status is required",
    }),
});

export const validateOrderStatus = (req, res, next) => {
  const { error, value } = orderStatusSchema.validate(req.body, {
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
