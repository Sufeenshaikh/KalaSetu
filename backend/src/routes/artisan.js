/**
 * Artisan profile management routes for KalaSetu
 * Handles artisan profiles, stories, and public artisan discovery
 */

import { Router } from 'express';
import { verifyToken } from '../../server.js';
import * as artisanController from '../controllers/artisan.controller.js';

const router = Router();

/**
 * GET /api/artisans
 * List all artisans (public)
 * @query {number} page - Page number for pagination
 * @query {number} limit - Items per page
 * @query {string} search - Optional search term
 * @query {string} category - Optional category filter
 */
router.get('/', artisanController.listArtisans);

/**
 * GET /api/artisans/:id
 * Get a single artisan's public profile
 * @param {string} id - Artisan's user ID
 */
router.get('/:id', artisanController.getArtisan);

/**
 * PUT /api/artisans/:id
 * Update an artisan's profile (requires authentication as that artisan)
 * @param {string} id - Artisan's user ID
 * @header Authorization: Bearer <token>
 * @body {object} profile - Profile fields to update
 */
router.put('/:id', verifyToken, artisanController.verifyArtisanRole, artisanController.updateArtisan);

/**
 * POST /api/artisans/:id/story
 * Add or update an artisan's story (requires authentication as that artisan)
 * @param {string} id - Artisan's user ID
 * @header Authorization: Bearer <token>
 * @body {string} story - Artisan's story/bio
 * @body {string[]} images - Array of image URLs
 */
router.post('/:id/story', verifyToken, artisanController.verifyArtisanRole, artisanController.updateStory);

/**
 * GET /api/artisans/:id/products
 * Get all products by an artisan (public)
 * @param {string} id - Artisan's user ID
 */
router.get('/:id/products', artisanController.getArtisanProducts);

/**
 * GET /api/artisans/:id/reviews
 * Get reviews for an artisan (public)
 * @param {string} id - Artisan's user ID
 */
router.get('/:id/reviews', artisanController.getArtisanReviews);

export default router;