import Joi from "joi";

// VARIANT VALIDATION SCHEMA
const variantSchema = Joi.object({
  sku: Joi.string()
    .trim()
    .uppercase()
    .optional(),
  name: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  attributes: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
    .messages({
      "object.base": "Attributes must be a key-value object",
    }),
  mrp: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "MRP must be a number",
      "number.min": "MRP cannot be negative",
      "any.required": "MRP is required",
    }),
  sellingPrice: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Selling price must be a number",
      "number.min": "Selling price cannot be negative",
      "any.required": "Selling price is required",
    }),
  discountPercent: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .optional(),
  gstPercent: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .optional(),
  marginPercent: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .optional(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().allow("", null).optional(),
        order: Joi.number().integer().default(0).optional(),
      })
    )
    .optional(),
});

// IMAGE VALIDATION SCHEMA
const imageSchema = Joi.object({
  url: Joi.string()
    .uri()
    .required()
    .messages({
      "string.uri": "Image URL must be valid",
      "any.required": "Image URL is required",
    }),
  alt: Joi.string().allow("", null).optional(),
  order: Joi.number().integer().default(0).optional(),
});

// PRODUCT CREATE VALIDATION
const validateProductCreateData = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(2)
      .max(200)
      .messages({
        "string.empty": "Product name is required",
        "string.min": "Product name must be at least 2 characters",
        "string.max": "Product name cannot exceed 200 characters",
        "any.required": "Product name is required",
      }),
    description: Joi.string()
      .trim()
      .allow("", null)
      .optional(),
    categoryId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "Category ID is required",
        "string.pattern.base": "Invalid category ID format",
        "any.required": "Category ID is required",
      }),
    subCategoryId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "Subcategory ID is required",
        "string.pattern.base": "Invalid subcategory ID format",
        "any.required": "Subcategory ID is required",
      }),
    mrp: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "MRP must be a number",
        "number.min": "MRP cannot be negative",
        "any.required": "MRP is required",
      }),
    sellingPrice: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "Selling price must be a number",
        "number.min": "Selling price cannot be negative",
        "any.required": "Selling price is required",
      }),
    discountPercent: Joi.number()
      .min(0)
      .max(100)
      .default(0)
      .optional(),
    gstPercent: Joi.number()
      .min(0)
      .max(100)
      .default(0)
      .optional(),
    marginPercent: Joi.number()
      .min(0)
      .max(100)
      .default(0)
      .optional(),
    currency: Joi.string()
      .valid("INR", "USD", "EUR", "GBP")
      .default("INR")
      .optional(),
    variants: Joi.array()
      .items(variantSchema)
      .optional(),
    images: Joi.array()
      .items(imageSchema)
      .min(1)
      .required()
      .messages({
        "array.min": "At least one image is required",
        "any.required": "Product images are required",
      }),
    isActive: Joi.boolean()
      .default(true)
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

// PRODUCT UPDATE VALIDATION
const validateProductUpdateData = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .optional(),
    description: Joi.string()
      .trim()
      .allow("", null)
      .optional(),
    categoryId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    subCategoryId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    mrp: Joi.number()
      .min(0)
      .optional(),
    sellingPrice: Joi.number()
      .min(0)
      .optional(),
    discountPercent: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    gstPercent: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    marginPercent: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    currency: Joi.string()
      .valid("INR", "USD", "EUR", "GBP")
      .optional(),
    variants: Joi.array()
      .items(variantSchema)
      .optional(),
    images: Joi.array()
      .items(imageSchema)
      .min(1)
      .optional(),
    isActive: Joi.boolean()
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

// MIDDLEWARE: VALIDATE PRODUCT CREATION
export const validateProductCreation = (req, res, next) => {
  const { error, value } = validateProductCreateData(req.body);

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

// MIDDLEWARE: VALIDATE PRODUCT UPDATE
export const validateProductUpdate = (req, res, next) => {
  const { error, value } = validateProductUpdateData(req.body);

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