import Joi from "joi";
import { sendError } from "../utils/apiResponse.js";

const listEntrySchema = Joi.object({
  fieldname: Joi.string().required(),
  category: Joi.number().required(),
  subCategory: Joi.number().required(),
});

const sectionSchema = Joi.object({
  name: Joi.string().required(),
  list: Joi.array().items(listEntrySchema).default([]),
});

const bannerSchema = Joi.object({
  sequence: Joi.number().required(),
  image: Joi.string().uri().required(),
  link: Joi.string().required(),
  alt: Joi.string().allow("", null).optional(),
});

const homepageSchema = Joi.object({
  sections: Joi.array().items(sectionSchema).default([]),
  carousel: Joi.object({
    mobile: Joi.array().items(bannerSchema).default([]),
    desktop: Joi.array().items(bannerSchema).default([]),
  }).default({}),
  miceBanner: Joi.object({
    mobile: Joi.object({
      image: Joi.string().uri().optional(),
      link: Joi.string().optional(),
      alt: Joi.string().allow("", null).optional(),
    }).optional(),
    desktop: Joi.object({
      image: Joi.string().uri().optional(),
      link: Joi.string().optional(),
      alt: Joi.string().allow("", null).optional(),
    }).optional(),
  }).default({}),
});

export const validateHomepagePayload = (req, res, next) => {
  const { error, value } = homepageSchema.validate(req.body, {
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
