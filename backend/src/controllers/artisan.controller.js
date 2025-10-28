/**
 * Artisan profile controller for KalaSetu
 * Handles artisan profile management, stories, and product listing
 */

import { ArtisanModel } from '../models/artisan.model.js';
import { ProductModel } from '../models/product.model.js';
import { ReviewModel } from '../models/review.model.js';

/**
 * Middleware to verify the user has an artisan role
 */
export const verifyArtisanRole = async (req, res, next) => {
  if (req.user.roles !== 'artisan') {
    return res.status(403).json({ error: 'This action requires an artisan account' });
  }
  
  // For routes with :id param, verify the artisan is modifying their own profile
  if (req.params.id && req.params.id !== req.user.uid) {
    return res.status(403).json({ error: 'You can only modify your own profile' });
  }
  
  next();
};

/**
 * List artisans with optional filtering and pagination
 */
export const listArtisans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    const { artisans, total } = await ArtisanModel.listArtisans({
      offset,
      limit: parseInt(limit),
      search,
      category,
    });

    res.json({
      artisans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List artisans error:', error);
    res.status(500).json({ error: 'Failed to list artisans' });
  }
};

/**
 * Get a single artisan's public profile
 */
export const getArtisan = async (req, res) => {
  try {
    const artisan = await ArtisanModel.getArtisanById(req.params.id);
    
    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' });
    }

    res.json({ artisan });
  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({ error: 'Failed to fetch artisan profile' });
  }
};

/**
 * Update an artisan's profile
 */
export const updateArtisan = async (req, res) => {
  try {
    const { profile } = req.body;
    const updatedArtisan = await ArtisanModel.updateArtisan(req.params.id, profile);
    res.json({ artisan: updatedArtisan });
  } catch (error) {
    console.error('Update artisan error:', error);
    res.status(500).json({ error: 'Failed to update artisan profile' });
  }
};

/**
 * Update an artisan's story/bio
 */
export const updateStory = async (req, res) => {
  try {
    const { story, images } = req.body;
    
    if (!story) {
      return res.status(400).json({ error: 'Story text is required' });
    }

    const updatedArtisan = await ArtisanModel.updateArtisanStory(req.params.id, {
      story,
      images: images || [],
      updatedAt: new Date(),
    });

    res.json({ artisan: updatedArtisan });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Failed to update artisan story' });
  }
};

/**
 * Get all products by an artisan
 */
export const getArtisanProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { products, total } = await ProductModel.getProductsByArtisan(req.params.id, {
      offset,
      limit: parseInt(limit),
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({ error: 'Failed to fetch artisan products' });
  }
};

/**
 * Get reviews for an artisan
 */
export const getArtisanReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { reviews, total } = await ReviewModel.getReviewsByArtisan(req.params.id, {
      offset,
      limit: parseInt(limit),
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get artisan reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch artisan reviews' });
  }
};