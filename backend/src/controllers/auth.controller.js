/**
 * Authentication controller for KalaSetu
 * Handles user registration, login, and profile management logic
 */

import admin from 'firebase-admin';
import { UserModel } from '../models/user.model.js';

/**
 * Register a new user with Firebase Auth and create their profile
 */
export const signup = async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!['buyer', 'artisan'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be either buyer or artisan' });
    }

    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: profile?.name,
    });

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Create user profile in Firestore
    await UserModel.createUser({
      uid: userRecord.uid,
      email,
      role,
      ...profile,
      createdAt: new Date(),
    });

    // Generate a custom token for immediate login
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Login is handled client-side with Firebase Auth SDK
 * This endpoint just validates the token and returns user data
 */
export const login = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await UserModel.getUserById(decodedToken.uid);

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

/**
 * Get current user's complete profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Update current user's profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const updatedUser = await UserModel.updateUser(req.user.uid, profile);

    // If name is being updated, also update in Firebase Auth
    if (profile.name) {
      await admin.auth().updateUser(req.user.uid, {
        displayName: profile.name,
      });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};