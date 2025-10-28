/**
 * Artisan model for KalaSetu
 * Handles Firestore operations for artisan profiles
 */

import admin from 'firebase-admin';

const db = admin.firestore();
const artisansRef = db.collection('artisans');

export class ArtisanModel {
  /**
   * List artisans with optional filtering and pagination
   */
  static async listArtisans({ offset = 0, limit = 10, search = '', category = '' }) {
    let query = artisansRef.where('role', '==', 'artisan');

    if (category) {
      query = query.where('categories', 'array-contains', category);
    }

    if (search) {
      // Firebase doesn't support full-text search, so we do a simple contains
      query = query.where('searchableFields', 'array-contains', search.toLowerCase());
    }

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    const artisans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { artisans, total };
  }

  /**
   * Get a single artisan by ID
   */
  static async getArtisanById(artisanId) {
    const doc = await artisansRef.doc(artisanId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Update an artisan's profile
   */
  static async updateArtisan(artisanId, updates) {
    // Create searchable fields for filtering
    const searchableFields = [
      updates.name,
      updates.location,
      ...(updates.categories || []),
      ...(updates.skills || []),
    ].map(field => field?.toLowerCase()).filter(Boolean);

    const updateData = {
      ...updates,
      searchableFields,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await artisansRef.doc(artisanId).update(updateData);
    return this.getArtisanById(artisanId);
  }

  /**
   * Update an artisan's story/bio
   */
  static async updateArtisanStory(artisanId, { story, images }) {
    const updateData = {
      story,
      storyImages: images,
      storyUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await artisansRef.doc(artisanId).update(updateData);
    return this.getArtisanById(artisanId);
  }

  /**
   * Create initial artisan profile (called after user registration)
   */
  static async createArtisanProfile(artisanData) {
    const { uid, ...data } = artisanData;
    
    const searchableFields = [
      data.name,
      data.location,
      ...(data.categories || []),
      ...(data.skills || []),
    ].map(field => field?.toLowerCase()).filter(Boolean);

    await artisansRef.doc(uid).set({
      ...data,
      searchableFields,
      role: 'artisan',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      products: 0, // Counter for total products
      averageRating: 0,
      totalReviews: 0,
    });

    return this.getArtisanById(uid);
  }

  /**
   * Update artisan metrics (product count, rating, etc.)
   */
  static async updateArtisanMetrics(artisanId, updates) {
    const updateData = {};
    
    if (updates.productCount !== undefined) {
      updateData.products = updates.productCount;
    }
    
    if (updates.rating !== undefined) {
      updateData.averageRating = updates.rating;
    }
    
    if (updates.reviewCount !== undefined) {
      updateData.totalReviews = updates.reviewCount;
    }

    if (Object.keys(updateData).length > 0) {
      await artisansRef.doc(artisanId).update(updateData);
    }
  }
}