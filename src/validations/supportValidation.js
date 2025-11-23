import Joi from "joi";
import { sendError } from "../utils/apiResponse.js";

const supportSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    "string.empty": "Message is required",
    "any.required": "Message is required",
  }),
});

export const validateSupportMessage = (req, res, next) => {
  const { error, value } = supportSchema.validate(req.body, {
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
