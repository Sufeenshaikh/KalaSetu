import { collections, db } from './firebase.service';
import admin from 'firebase-admin';

export class ProductService {
  static async createProduct(productData: {
    artisanId: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    tags: string[];
    inStock: number;
  }) {
    try {
      const product = {
        ...productData,
        rating: 0,
        totalReviews: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await collections.products.add(product);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(productId: string, updateData: any) {
    try {
      await collections.products.doc(productId).update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async getProducts(filters: {
    artisanId?: string;
    category?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    lastDoc?: FirebaseFirestore.DocumentSnapshot;
  }) {
    try {
      let query: FirebaseFirestore.Query = collections.products;

      if (filters.artisanId) {
        query = query.where('artisanId', '==', filters.artisanId);
      }

      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }

      if (filters.minPrice !== undefined) {
        query = query.where('price', '>=', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.where('price', '<=', filters.maxPrice);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags);
      }

      // Order by creation date
      query = query.orderBy('createdAt', 'desc');

      // Apply pagination
      if (filters.lastDoc) {
        query = query.startAfter(filters.lastDoc);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      
      return {
        products: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === filters.limit
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  static async deleteProduct(productId: string) {
    try {
      const batch = db.batch();
      
      // Delete the product
      const productRef = collections.products.doc(productId);
      batch.delete(productRef);

      // Delete associated reviews
      const reviewsSnapshot = await collections.reviews
        .where('productId', '==', productId)
        .get();
      
      reviewsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async addReview(reviewData: {
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    images?: string[];
  }) {
    const batch = db.batch();

    try {
      // Create review document
      const reviewRef = collections.reviews.doc();
      const review = {
        ...reviewData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(reviewRef, review);

      // Update product rating
      const productRef = collections.products.doc(reviewData.productId);
      const productDoc = await productRef.get();
      const productData = productDoc.data();

      if (!productData) {
        throw new Error('Product not found');
      }

      const newTotalReviews = productData.totalReviews + 1;
      const newRating = 
        ((productData.rating * productData.totalReviews) + reviewData.rating) / newTotalReviews;

      batch.update(productRef, {
        rating: newRating,
        totalReviews: newTotalReviews,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
      return reviewRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
}