/**
 * Authentication routes for KalaSetu
 * Handles user registration, login state management, and role assignment
 */

import { Router } from 'express';
import { verifyToken } from '../../server.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user (buyer or artisan)
 * @body {string} email - User's email
 * @body {string} password - User's password
 * @body {string} role - Either 'buyer' or 'artisan'
 * @body {object} profile - Additional profile information
 */
router.post('/signup', authController.signup);

/**
 * POST /api/auth/login
 * Log in an existing user
 * @body {string} email - User's email
 * @body {string} password - User's password
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current user's profile (requires authentication)
 * @header Authorization: Bearer <token>
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * PUT /api/auth/me
 * Update current user's profile (requires authentication)
 * @header Authorization: Bearer <token>
 * @body {object} profile - Profile fields to update
 */
router.put('/me', verifyToken, authController.updateProfile);

/**
 * POST /api/auth/verify-token
 * Verify a Firebase ID token and return user info
 * @header Authorization: Bearer <token>
 */
router.post('/verify-token', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;