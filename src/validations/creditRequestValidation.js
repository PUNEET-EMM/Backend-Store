import Joi from "joi";
import { sendError } from "../utils/apiResponse.js";

const creditRequestSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be greater than zero",
      "any.required": "Amount is required",
    }),
  reason: Joi.string()
    .max(500)
    .allow("", null)
    .optional(),
});

export const validateCreditRequest = (req, res, next) => {
  const { error, value } = creditRequestSchema.validate(req.body, {
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
