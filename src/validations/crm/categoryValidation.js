import Joi from "joi";

const validateCategoryCreate = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(2)
      .max(100)
      .messages({
        "string.empty": "Category name is required",
        "string.min": "Category name must be at least 2 characters",
        "string.max": "Category name cannot exceed 100 characters",
        "any.required": "Category name is required",
      }),
    // description: Joi.string()
    //   .trim()
    //   .allow("", null)
    //   .optional(),
    imageUrl: Joi.string()
      .uri()
      .allow("", null)
      .optional()
      .messages({
        "string.uri": "Image URL must be a valid URL",
      }),
    displayOrder: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional(),
    // seo: Joi.object({
    //   title: Joi.string().trim().allow("", null).optional(),
    //   description: Joi.string().trim().allow("", null).optional(),
    //   keywords: Joi.array().items(Joi.string()).optional(),
    // }).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

// SUBCATEGORY VALIDATION
const validateSubCategoryCreate = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(2)
      .max(100)
      .messages({
        "string.empty": "Subcategory name is required",
        "string.min": "Subcategory name must be at least 2 characters",
        "string.max": "Subcategory name cannot exceed 100 characters",
        "any.required": "Subcategory name is required",
      }),
    // description: Joi.string()
    //   .trim()
    //   .allow("", null)
    //   .optional(),
    imageUrl: Joi.string()
      .uri()
      .allow("", null)
      .optional()
      .messages({
        "string.uri": "Image URL must be a valid URL",
      }),
    displayOrder: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};



export const validateCategoryCreation = (req, res, next) => {
  const { error, value } = validateCategoryCreate(req.body);

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

export const validateSubCategoryCreation = (req, res, next) => {
  const { error, value } = validateSubCategoryCreate(req.body);

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