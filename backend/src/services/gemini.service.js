/**
 * Gemini AI service for KalaSetu
 * Handles communication with Google's Generative AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

class GeminiService {
  /**
   * Generate an artisan's story based on their craft and background
   */
  static async generateArtisanStory({
    artisanName,
    craft,
    location,
    experience,
    keywords = [],
    tone = 'inspiring'
  }) {
    // Import story templates
    const storyTemplates = (await import('../templates/story.templates.js')).default;
    
    // Get enhanced prompt using craft-specific template
    const enhancedPrompt = storyTemplates.enhancePrompt(craft, {
      keywords,
      tone
    });

    const prompt = `
      Generate an authentic and engaging story for an artisan with the following details:
      - Name: ${artisanName}
      - Craft: ${craft}
      - Location: ${location}
      - Years of experience: ${experience}
      - Key aspects to highlight: ${enhancedPrompt.keywords.join(', ')}
      
      The story should:
      - Have a ${tone} tone
      - Be personal and authentic
      - Highlight their craftsmanship journey
      - Mention their dedication to traditional techniques
      - Include their connection to their community
      - Be 2-3 paragraphs long
      
      Additional context to consider:
      ${enhancedPrompt.promptContext || ''}
      
      Format the response in clean paragraphs without any special markers or prefixes.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.cleanupAIResponse(text);
    } catch (error) {
      console.error('Story generation error:', error);
      throw new Error(error.message || 'Failed to generate artisan story');
    }
  }

  /**
   * Enhance a product description with more engaging content
   */
  static async enhanceProductDescription({
    productName,
    originalDescription,
    category,
    keywords = [],
    style = 'professional'
  }) {
    const prompt = `
      Enhance this product description for an artisanal marketplace:
      
      Product: ${productName}
      Category: ${category}
      Original description: "${originalDescription}"
      Key features to highlight: ${keywords.join(', ')}
      
      Please:
      - Maintain a ${style} tone
      - Emphasize craftsmanship and uniqueness
      - Include material quality and traditional techniques
      - Make it engaging but factual
      - Keep key product details
      - Format in 2-3 concise paragraphs
      
      Return only the enhanced description without any prefixes or markers.
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.cleanupAIResponse(text);
    } catch (error) {
      console.error('Description enhancement error:', error);
      throw new Error('Failed to enhance product description');
    }
  }

  /**
   * Generate SEO-friendly product tags and categories
   */
  static async generateProductTags({
    productName,
    description,
    existingTags = []
  }) {
    const prompt = `
      Generate relevant product tags and categories for an artisanal product:
      
      Product: ${productName}
      Description: ${description}
      Existing tags: ${existingTags.join(', ')}
      
      Please provide:
      - 5-7 specific product tags
      - 2-3 broad category suggestions
      - Focus on handmade/artisanal aspects
      
      Return the response in this format:
      tags: tag1, tag2, tag3
      categories: category1, category2
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Parse the response into structured data
      const lines = text.split('\n');
      const tags = lines[0].replace('tags:', '').split(',').map(t => t.trim());
      const categories = lines[1].replace('categories:', '').split(',').map(c => c.trim());
      
      return { tags, categories };
    } catch (error) {
      console.error('Tag generation error:', error);
      throw new Error('Failed to generate product tags');
    }
  }

  /**
   * Generate a custom response to a customer review
   */
  static async generateReviewResponse({
    review,
    rating,
    productName,
    artisanName
  }) {
    const prompt = `
      Generate a thoughtful response to this customer review:
      
      Product: ${productName}
      Artisan: ${artisanName}
      Rating: ${rating}/5
      Review: "${review}"
      
      Please:
      - Keep it personal but professional
      - Thank the customer specifically
      - Address any concerns mentioned
      - Be authentic and warm
      - Keep it concise (2-3 sentences)
      
      Return only the response without any prefixes or markers.
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.cleanupAIResponse(text);
    } catch (error) {
      console.error('Review response generation error:', error);
      throw new Error('Failed to generate review response');
    }
  }

  /**
   * Clean up AI response text
   */
  static cleanupAIResponse(text) {
    return text
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\\n/g, '\n') // Fix newlines
      .replace(/\n{3,}/g, '\n\n'); // Normalize spacing
  }
}

export default GeminiService;