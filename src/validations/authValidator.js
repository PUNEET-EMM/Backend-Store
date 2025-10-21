// validators/authValidator.js
import Joi from "joi";

/**
 * Validate login request (email)
 */
const validateLoginRequest = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .lowercase()
      .trim()
      .email()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate OTP verification
 */
const validateOTPVerification = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .lowercase()
      .trim()
      .email()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      }),
    otp: Joi.string()
      .required()
      .trim()
      .length(5)
      .pattern(/^\d{5}$/)
      .messages({
        "string.empty": "OTP is required",
        "string.length": "OTP must be exactly 5 digits",
        "string.pattern.base": "OTP must contain only digits",
        "any.required": "OTP is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Middleware to validate login request
 */
export const validateLogin = (req, res, next) => {
  const { error, value } = validateLoginRequest(req.body);

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware to validate OTP verification
 */
export const validateOTP = (req, res, next) => {
  const { error, value } = validateOTPVerification(req.body);

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.validatedData = value;
  next();
};