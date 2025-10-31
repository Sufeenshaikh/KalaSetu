/**
 * AI Routes for KalaSetu
 * Endpoints for AI-powered content generation
 */

import express from 'express';
import AIController from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { aiValidation } from '../middleware/ai.validation.js';
import rateLimit from '../middleware/ai.rateLimit.js';

const router = express.Router();

// All AI routes require authentication
router.use(authMiddleware);

// Apply rate limit middleware (per-user daily quota)
const aiRateLimit = rateLimit({ limitPerDay: 5 });

// Generate artisan story
router.post('/story', 
  aiValidation.validateArtisanStory,
  aiRateLimit,
  AIController.generateArtisanStory
);

// Enhance product description
router.post('/enhance-description',
  aiValidation.validateProductDescription,
  aiRateLimit,
  AIController.enhanceDescription
);

// Generate product tags
router.post('/generate-tags',
  aiValidation.validateProductTags,
  aiRateLimit,
  AIController.generateTags
);

// Generate review response
router.post('/review-response',
  aiValidation.validateReviewResponse,
  aiRateLimit,
  AIController.generateReviewResponse
);

export default router;