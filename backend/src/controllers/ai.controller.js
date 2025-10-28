/**
 * AI Controller for KalaSetu
 * Handles AI-powered content generation endpoints
 */

import GeminiService from '../services/gemini.service.js';

class AIController {
  /**
   * Generate an artisan's story
   */
  async generateArtisanStory(req, res) {
    try {
      const {
        artisanName,
        craft,
        location,
        experience,
        keywords,
        tone
      } = req.body;

      const story = await GeminiService.generateArtisanStory({
        artisanName,
        craft,
        location,
        experience,
        keywords,
        tone
      });

      res.json({ success: true, story });
    } catch (error) {
      console.error('Story generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate artisan story'
      });
    }
  }

  /**
   * Enhance a product description
   */
  async enhanceDescription(req, res) {
    try {
      const {
        productName,
        originalDescription,
        category,
        keywords,
        style
      } = req.body;

      const enhancedDescription = await GeminiService.enhanceProductDescription({
        productName,
        originalDescription,
        category,
        keywords,
        style
      });

      res.json({ success: true, description: enhancedDescription });
    } catch (error) {
      console.error('Description enhancement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enhance product description'
      });
    }
  }

  /**
   * Generate product tags and categories
   */
  async generateTags(req, res) {
    try {
      const {
        productName,
        description,
        existingTags
      } = req.body;

      const { tags, categories } = await GeminiService.generateProductTags({
        productName,
        description,
        existingTags
      });

      res.json({ success: true, tags, categories });
    } catch (error) {
      console.error('Tag generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate product tags'
      });
    }
  }

  /**
   * Generate a response to a customer review
   */
  async generateReviewResponse(req, res) {
    try {
      const {
        review,
        rating,
        productName,
        artisanName
      } = req.body;

      const response = await GeminiService.generateReviewResponse({
        review,
        rating,
        productName,
        artisanName
      });

      res.json({ success: true, response });
    } catch (error) {
      console.error('Review response generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate review response'
      });
    }
  }
}

export default new AIController();