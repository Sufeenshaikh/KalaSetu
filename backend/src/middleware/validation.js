/**
 * Input validation schemas for KalaSetu using Zod
 */

import { z } from 'zod';

// Shared schemas
const priceSchema = z.number().positive().max(1000000);
const idSchema = z.string().min(1);
const ratingSchema = z.number().int().min(1).max(5);

// Product validation schemas
export const productSchemas = {
  create: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    price: priceSchema,
    categories: z.array(z.string()).min(1).max(5),
    images: z.array(z.string().url()).min(1).max(10),
    stock: z.number().int().min(0),
    specifications: z.record(z.string()).optional(),
    customization: z.object({
      available: z.boolean(),
      options: z.array(z.string()).optional(),
    }).optional(),
  }),

  update: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: priceSchema.optional(),
    categories: z.array(z.string()).min(1).max(5).optional(),
    images: z.array(z.string().url()).min(1).max(10).optional(),
    stock: z.number().int().min(0).optional(),
    specifications: z.record(z.string()).optional(),
    customization: z.object({
      available: z.boolean(),
      options: z.array(z.string()).optional(),
    }).optional(),
  }),

  review: z.object({
    rating: ratingSchema,
    comment: z.string().min(10).max(500),
    images: z.array(z.string().url()).max(3).optional(),
  }),
};

// Order validation schemas
export const orderSchemas = {
  create: z.object({
    shippingAddress: z.object({
      street: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(5),
      country: z.string().min(2),
    }),
    items: z.array(z.object({
      productId: idSchema,
      quantity: z.number().int().positive(),
      customization: z.string().optional(),
    })).min(1),
  }),

  update: z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    trackingNumber: z.string().optional(),
  }),
};

// Cart validation schemas
export const cartSchemas = {
  addItem: z.object({
    productId: idSchema,
    quantity: z.number().int().positive(),
    customization: z.string().optional(),
  }),

  updateItem: z.object({
    quantity: z.number().int().positive(),
  }),
};

// Artisan story validation
export const storySchemas = {
  create: z.object({
    story: z.string().min(100).max(5000),
    images: z.array(z.string().url()).max(5).optional(),
    highlights: z.array(z.string()).max(5).optional(),
  }),
};

// AI content generation
export const aiSchemas = {
  generateStory: z.object({
    artisanName: z.string().min(2),
    craft: z.string().min(3),
    keywords: z.array(z.string()).min(1).max(5),
    tone: z.enum(['inspiring', 'personal', 'professional', 'casual']),
  }),

  enhanceDescription: z.object({
    description: z.string().min(10).max(1000),
    category: z.string(),
    keywords: z.array(z.string()).min(1).max(5),
  }),
};

// Helper function to validate request body
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};