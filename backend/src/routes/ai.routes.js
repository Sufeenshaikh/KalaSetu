/**
 * AI Routes for KalaSetu
 * Endpoints for AI-powered content generation
 */

import express from 'express';
import AIController from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { aiValidation } from '../middleware/ai.validation.js';

const router = express.Router();

// All AI routes require authentication
router.use(authMiddleware);

// Generate artisan story
router.post('/story', 
  aiValidation.validateArtisanStory,
  AIController.generateArtisanStory
);

// Enhance product description
router.post('/enhance-description',
  aiValidation.validateProductDescription,
  AIController.enhanceDescription
);

// Generate product tags
router.post('/generate-tags',
  aiValidation.validateProductTags,
  AIController.generateTags
);

// Generate review response
router.post('/review-response',
  aiValidation.validateReviewResponse,
  AIController.generateReviewResponse
);

export default router;