/**
 * Product management routes for KalaSetu
 * Handles CRUD operations for artisan products
 */

import { Router } from 'express';
import { verifyToken } from '../../server.js';
import * as productController from '../controllers/product.controller.js';

const router = Router();

/**
 * GET /api/products
 * List all products with filtering and pagination
 * @query {number} page - Page number
 * @query {number} limit - Items per page
 * @query {string} search - Search term
 * @query {string} category - Filter by category
 * @query {string} artisanId - Filter by artisan
 * @query {string} sort - Sort field (price, created, popular)
 * @query {string} order - Sort order (asc, desc)
 */
router.get('/', productController.listProducts);

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', productController.getProduct);

/**
 * POST /api/products
 * Create a new product (requires artisan auth)
 * @body {object} product - Product details
 */
router.post('/', verifyToken, productController.verifyArtisan, productController.createProduct);

/**
 * PUT /api/products/:id
 * Update a product (requires artisan auth)
 * @body {object} updates - Fields to update
 */
router.put('/:id', verifyToken, productController.verifyArtisan, productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Delete a product (requires artisan auth)
 */
router.delete('/:id', verifyToken, productController.verifyArtisan, productController.deleteProduct);

/**
 * POST /api/products/:id/reviews
 * Add a review to a product (requires buyer auth)
 */
router.post('/:id/reviews', verifyToken, productController.verifyBuyer, productController.addReview);

/**
 * GET /api/products/:id/reviews
 * Get reviews for a product
 */
router.get('/:id/reviews', productController.getProductReviews);

/**
 * POST /api/products/:id/favorite
 * Toggle favorite status for a product (requires auth)
 */
router.post('/:id/favorite', verifyToken, productController.toggleFavorite);

export default router;