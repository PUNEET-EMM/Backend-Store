import Joi from "joi";

const validateInternalUserRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(2)
      .max(100)
      .messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Name is required",
      }),
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
    contact: Joi.string()
      .required()
      .trim()
      .pattern(/^\d{10}$/)
      .messages({
        "string.empty": "Contact is required",
        "string.pattern.base": "Contact must be a valid 10-digit number",
        "any.required": "Contact is required",
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(100)
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password cannot exceed 100 characters",
        "any.required": "Password is required",
      }),
    role: Joi.string()
      .valid("admin")
      .default("admin")
      .messages({
        "any.only": "Role must be admin",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

const validateInternalUserLogin = (data) => {
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
    password: Joi.string()
      .required()
      .messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validateRegistration = (req, res, next) => {
  const { error, value } = validateInternalUserRegistration(req.body);

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  req.validatedData = value;
  next();
};

export const validateLogin = (req, res, next) => {
  const { error, value } = validateInternalUserLogin(req.body);

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  req.validatedData = value;
  next();
};