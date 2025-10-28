/**
 * User model for KalaSetu
 * Handles Firestore operations for user profiles
 */

import admin from 'firebase-admin';

const db = admin.firestore();
const usersRef = db.collection('users');

export class UserModel {
  /**
   * Create a new user profile in Firestore
   */
  static async createUser(userData) {
    const { uid, ...data } = userData;
    await usersRef.doc(uid).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return this.getUserById(uid);
  }

  /**
   * Get a user by their Firebase UID
   */
  static async getUserById(uid) {
    const doc = await usersRef.doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Update a user's profile
   */
  static async updateUser(uid, updates) {
    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await usersRef.doc(uid).update(updateData);
    return this.getUserById(uid);
  }

  /**
   * Delete a user's profile (careful!)
   */
  static async deleteUser(uid) {
    await usersRef.doc(uid).delete();
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email) {
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}