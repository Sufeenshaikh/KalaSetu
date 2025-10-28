/**
 * Product model for KalaSetu
 * Handles Firestore operations for products
 */

import admin from 'firebase-admin';

const db = admin.firestore();
const productsRef = db.collection('products');

export class ProductModel {
  /**
   * List products with filtering and pagination
   */
  static async listProducts({
    offset = 0,
    limit = 20,
    search = '',
    category = '',
    artisanId = '',
    sort = 'createdAt',
    order = 'desc'
  }) {
    let query = productsRef;

    // Apply filters
    if (artisanId) {
      query = query.where('artisanId', '==', artisanId);
    }

    if (category) {
      query = query.where('categories', 'array-contains', category);
    }

    if (search) {
      // Add search terms to searchableFields array when creating/updating products
      query = query.where('searchableFields', 'array-contains', search.toLowerCase());
    }

    // Apply sorting
    switch (sort) {
      case 'price':
        query = query.orderBy('price', order);
        break;
      case 'popular':
        query = query.orderBy('totalSales', order);
        break;
      default:
        query = query.orderBy('createdAt', order);
    }

    // Get total count (for pagination)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const snapshot = await query
      .offset(offset)
      .limit(limit)
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { products, total };
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(productId) {
    const doc = await productsRef.doc(productId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Create a new product
   */
  static async createProduct(productData) {
    const { artisanId, title, categories = [], description } = productData;

    // Create searchable fields array for text search
    const searchableFields = [
      title,
      ...categories,
      description.substring(0, 100), // First 100 chars of description
    ].map(field => field?.toLowerCase()).filter(Boolean);

    const data = {
      ...productData,
      searchableFields,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalSales: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    const docRef = await productsRef.add(data);
    return this.getProductById(docRef.id);
  }

  /**
   * Update a product
   */
  static async updateProduct(productId, updates) {
    const { title, categories, description } = updates;

    // Update searchable fields if relevant fields changed
    if (title || categories || description) {
      const current = await this.getProductById(productId);
      const searchableFields = [
        title || current.title,
        ...(categories || current.categories),
        (description || current.description).substring(0, 100),
      ].map(field => field?.toLowerCase()).filter(Boolean);
      updates.searchableFields = searchableFields;
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await productsRef.doc(productId).update(updates);
    return this.getProductById(productId);
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId) {
    await productsRef.doc(productId).delete();
  }

  /**
   * Add a review to a product
   */
  static async addReview(productId, review) {
    const product = await this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    // Create the review
    const reviewRef = await productsRef
      .doc(productId)
      .collection('reviews')
      .add({
        ...review,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update product review metrics
    const allReviews = await this.getProductReviews(productId);
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await this.updateProduct(productId, {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
    });

    return { id: reviewRef.id, ...review };
  }

  /**
   * Get reviews for a product
   */
  static async getProductReviews(productId, { offset = 0, limit = 10 } = {}) {
    const snapshot = await productsRef
      .doc(productId)
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Update product metrics after order
   */
  static async updateProductMetrics(productId, { soldQuantity }) {
    await productsRef.doc(productId).update({
      totalSales: admin.firestore.FieldValue.increment(soldQuantity),
      stock: admin.firestore.FieldValue.increment(-soldQuantity),
    });
  }
}