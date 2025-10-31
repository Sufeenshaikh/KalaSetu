/**
 * AI Controller for KalaSetu
 * Handles AI-powered content generation endpoints
 */

import GeminiService from '../services/gemini.service.js';
import aiModel from '../models/ai.model.js';

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
      const params = { artisanName, craft, location, experience, keywords, tone };

      // check cache first
      const cached = await aiModel.getCachedContent('artisanStory', params);
      if (cached) {
        return res.json({ success: true, story: cached, cached: true });
      }

      const story = await GeminiService.generateArtisanStory(params);

      // cache for 7 days
      await aiModel.setCachedContent('artisanStory', params, story, 60 * 60 * 24 * 7);

      res.json({ success: true, story, cached: false });
    } catch (error) {
      console.error('Story generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate artisan story',
        details: error.stack
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
      const params = { productName, originalDescription, category, keywords, style };

      const cached = await aiModel.getCachedContent('productDescription', params);
      if (cached) return res.json({ success: true, description: cached, cached: true });

      const enhancedDescription = await GeminiService.enhanceProductDescription(params);
      await aiModel.setCachedContent('productDescription', params, enhancedDescription, 60 * 60 * 24 * 7);

      res.json({ success: true, description: enhancedDescription, cached: false });
    } catch (error) {
      console.error('Description enhancement error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to enhance product description',
        details: error.stack
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
      const params = { productName, description, existingTags };

      const cached = await aiModel.getCachedContent('productTags', params);
      if (cached) return res.json({ success: true, tags: cached.tags, categories: cached.categories, cached: true });

      const { tags, categories } = await GeminiService.generateProductTags(params);
      await aiModel.setCachedContent('productTags', params, { tags, categories }, 60 * 60 * 24 * 7);

      res.json({ success: true, tags, categories, cached: false });
    } catch (error) {
      console.error('Tag generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate product tags',
        details: error.stack
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
      const params = { review, rating, productName, artisanName };

      const cached = await aiModel.getCachedContent('reviewResponse', params);
      if (cached) return res.json({ success: true, response: cached, cached: true });

      const response = await GeminiService.generateReviewResponse(params);
      await aiModel.setCachedContent('reviewResponse', params, response, 60 * 60 * 24 * 7);

      res.json({ success: true, response, cached: false });
    } catch (error) {
      console.error('Review response generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate review response',
        details: error.stack
      });
    }
  }
}

export default new AIController();