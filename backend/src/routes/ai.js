/**
 * AI routes for KalaSetu
 * Handles Gemini API integration for story generation
 */

import { Router } from 'express';
import { verifyToken } from '../../server.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

/**
 * POST /api/ai/generate-story
 * Generate an artisan story using Gemini API
 * @body {object} data - Story generation parameters
 * @body {string} data.artisanName - Name of the artisan
 * @body {string} data.craft - Type of craft/art
 * @body {string[]} data.keywords - Key aspects to include
 * @body {string} data.tone - Desired tone (inspiring, personal, etc.)
 */
router.post('/generate-story',
  verifyToken,
  aiController.verifyArtisan,
  aiController.generateStory
);

/**
 * POST /api/ai/enhance-description
 * Enhance a product description
 * @body {string} description - Original description
 * @body {string} category - Product category
 * @body {string[]} keywords - Key features to highlight
 */
router.post('/enhance-description',
  verifyToken,
  aiController.verifyArtisan,
  aiController.enhanceDescription
);

/**
 * POST /api/ai/translate
 * Translate content to multiple languages
 * @body {string} text - Text to translate
 * @body {string[]} languages - Target languages
 */
router.post('/translate',
  verifyToken,
  aiController.translate
);

export default router;