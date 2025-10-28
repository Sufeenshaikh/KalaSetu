/**
 * Validation middleware for AI endpoints
 */

import Joi from 'joi';

// Validation schemas for each endpoint
const schemas = {
  artisanStory: Joi.object({
    artisanName: Joi.string().required().min(2).max(100),
    craft: Joi.string().required().min(2).max(100),
    location: Joi.string().required().min(2).max(100),
    experience: Joi.number().required().min(0).max(100),
    keywords: Joi.array().items(Joi.string()).max(10).default([]),
    tone: Joi.string().valid('inspiring', 'professional', 'casual', 'formal').default('inspiring')
  }),

  productDescription: Joi.object({
    productName: Joi.string().required().min(2).max(100),
    originalDescription: Joi.string().required().min(10).max(1000),
    category: Joi.string().required().min(2).max(50),
    keywords: Joi.array().items(Joi.string()).max(10).default([]),
    style: Joi.string().valid('professional', 'casual', 'formal', 'technical').default('professional')
  }),

  productTags: Joi.object({
    productName: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(10).max(1000),
    existingTags: Joi.array().items(Joi.string()).max(20).default([])
  }),

  reviewResponse: Joi.object({
    review: Joi.string().required().min(10).max(1000),
    rating: Joi.number().required().min(1).max(5),
    productName: Joi.string().required().min(2).max(100),
    artisanName: Joi.string().required().min(2).max(100)
  })
};

// Validation middleware factory
const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: 'Invalid schema configuration'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

export const aiValidation = {
  validateArtisanStory: validateRequest('artisanStory'),
  validateProductDescription: validateRequest('productDescription'),
  validateProductTags: validateRequest('productTags'),
  validateReviewResponse: validateRequest('reviewResponse')
};