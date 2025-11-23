import Joi from "joi";
import { sendError } from "../../utils/apiResponse.js";

const creditDecisionSchema = Joi.object({
  action: Joi.string()
    .valid("approve", "reject")
    .required()
    .messages({
      "any.only": "Action must be either approve or reject",
      "any.required": "Action is required",
    }),
  note: Joi.string().max(500).allow("", null).optional(),
});

export const validateCreditDecision = (req, res, next) => {
  const { error, value } = creditDecisionSchema.validate(req.body, {
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
