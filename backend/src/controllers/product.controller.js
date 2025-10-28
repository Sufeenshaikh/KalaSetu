/**
 * Product controller for KalaSetu
 * Handles product management, reviews, and favorites
 */

import { ProductModel } from '../models/product.model.js';
import { FavoriteModel } from '../models/favorite.model.js';
import { validateBody, productSchemas } from '../middleware/validation.js';

/**
 * Middleware to verify the user is an artisan
 */
export const verifyArtisan = (req, res, next) => {
  if (req.user.roles !== 'artisan') {
    return res.status(403).json({ error: 'This action requires an artisan account' });
  }
  next();
};

/**
 * Middleware to verify the user is a buyer
 */
export const verifyBuyer = (req, res, next) => {
  if (req.user.roles !== 'buyer') {
    return res.status(403).json({ error: 'This action requires a buyer account' });
  }
  next();
};

/**
 * List products with filtering and pagination
 */
export const listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, artisanId, sort, order } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const { products, total } = await ProductModel.listProducts({
      offset,
      limit: parseInt(limit),
      search,
      category,
      artisanId,
      sort,
      order,
    });

    // If user is authenticated, get their favorites to mark products
    let favorites = [];
    if (req.user) {
      favorites = await FavoriteModel.getUserFavorites(req.user.uid);
    }

    // Mark favorited products
    const productsWithFavorites = products.map(product => ({
      ...product,
      isFavorite: favorites.includes(product.id),
    }));

    res.json({
      products: productsWithFavorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
};

/**
 * Get a single product
 */
export const getProduct = async (req, res) => {
  try {
    const product = await ProductModel.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is favorited by current user
    if (req.user) {
      const isFavorite = await FavoriteModel.isProductFavorited(req.user.uid, product.id);
      product.isFavorite = isFavorite;
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

/**
 * Create a new product
 */
export const createProduct = [
  validateBody(productSchemas.create),
  async (req, res) => {
    try {
      const productData = {
        ...req.validatedBody,
        artisanId: req.user.uid,
      };

      const product = await ProductModel.createProduct(productData);
      res.status(201).json({ product });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
];

/**
 * Update a product
 */
export const updateProduct = [
  validateBody(productSchemas.update),
  async (req, res) => {
    try {
      const product = await ProductModel.getProductById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.artisanId !== req.user.uid) {
        return res.status(403).json({ error: 'You can only update your own products' });
      }

      const updatedProduct = await ProductModel.updateProduct(req.params.id, req.validatedBody);
      res.json({ product: updatedProduct });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
];

/**
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.artisanId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await ProductModel.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

/**
 * Add a review to a product
 */
export const addReview = [
  validateBody(productSchemas.review),
  async (req, res) => {
    try {
      const review = {
        ...req.validatedBody,
        userId: req.user.uid,
        userName: req.user.name || 'Anonymous',
      };

      const newReview = await ProductModel.addReview(req.params.id, review);
      res.status(201).json({ review: newReview });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  }
];

/**
 * Get reviews for a product
 */
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const reviews = await ProductModel.getProductReviews(req.params.id, {
      offset,
      limit: parseInt(limit),
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Toggle favorite status for a product
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.uid;

    const isFavorited = await FavoriteModel.isProductFavorited(userId, productId);
    
    if (isFavorited) {
      await FavoriteModel.removeFavorite(userId, productId);
    } else {
      await FavoriteModel.addFavorite(userId, productId);
    }

    res.json({ isFavorited: !isFavorited });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
};