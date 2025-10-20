import Joi from "joi";

const addressSchema = Joi.object({
  address: Joi.string().required().trim().messages({
    "string.empty": "Address is required",
    "any.required": "Address is required",
  }),
  city: Joi.string().required().trim().messages({
    "string.empty": "City is required",
    "any.required": "City is required",
  }),
  state: Joi.string().required().trim().messages({
    "string.empty": "State is required",
    "any.required": "State is required",
  }),
  pincode: Joi.string()
    .required()
    .pattern(/^\d{5,6}$/)
    .trim()
    .messages({
      "string.pattern.base": "Pincode must be 5-6 digits",
      "string.empty": "Pincode is required",
      "any.required": "Pincode is required",
    }),
  gstin: Joi.string()
    .optional()
    .uppercase()
    .trim()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .messages({
      "string.pattern.base": "Invalid GSTIN format",
    }),
});

 const validateCorporateRegistration = (data) => {
  const schema = Joi.object({
    companyLegalName: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(255)
      .messages({
        "string.empty": "Company legal name is required",
        "string.min": "Company name must be at least 3 characters",
        "string.max": "Company name cannot exceed 255 characters",
      }),
    employeeCount: Joi.string()
      .required()
      .trim()
      .pattern(/^\d+$/)
      .messages({
        "string.empty": "Employee count is required",
        "string.pattern.base": "Employee count must be a valid number",
      }),
    adminName: Joi.string().required().trim().min(2).max(100).messages({
      "string.empty": "Admin name is required",
      "string.min": "Admin name must be at least 2 characters",
      "string.max": "Admin name cannot exceed 100 characters",
    }),
    adminEmail: Joi.string()
      .required()
      .lowercase()
      .trim()
      .email()
      .messages({
        "string.empty": "Admin email is required",
        "string.email": "Admin email must be a valid email address",
      }),
    adminContact: Joi.string()
      .required()
      .trim()
      .pattern(/^\d{10}$/)
      .messages({
        "string.empty": "Admin contact is required",
        "string.pattern.base": "Admin contact must be a valid 10-digit number",
      }),
    address: addressSchema.required().messages({
      "any.required": "Address is required",
    }),
    billingAddress: Joi.array()
      .items(addressSchema)
      .min(1)
      .required()
      .messages({
        "array.min": "At least one billing address is required",
        "any.required": "Billing address is required",
      }),
    deliveryAddress: Joi.array()
      .items(addressSchema)
      .min(1)
      .required()
      .messages({
        "array.min": "At least one delivery address is required",
        "any.required": "Delivery address is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};


export const validateRegistration = (req, res, next) => {
  const { error, value } = validateCorporateRegistration(req.body);
  
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