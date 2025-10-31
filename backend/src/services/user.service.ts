import { collections, db } from './firebase.service';
import admin from 'firebase-admin';

export class UserService {
  static async createUser(userData: {
    email: string;
    password: string;
    displayName: string;
    role: 'artisan' | 'customer' | 'admin';
  }) {
    try {
      // Create auth user
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      // Create user document
      await collections.users.doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // If user is artisan, create artisan profile
      if (userData.role === 'artisan') {
        await collections.artisans.doc(userRecord.uid).set({
          userId: userRecord.uid,
          bio: '',
          craftType: [],
          experience: 0,
          stories: [],
          rating: 0,
          totalReviews: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return userRecord.uid;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const userDoc = await collections.users.doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (userData?.role === 'artisan') {
        const artisanDoc = await collections.artisans.doc(userId).get();
        return {
          ...userData,
          artisanProfile: artisanDoc.exists ? artisanDoc.data() : null,
        };
      }

      return userData;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updateData: any) {
    try {
      const batch = db.batch();
      const userRef = collections.users.doc(userId);
      
      // Update user document
      batch.update(userRef, {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // If artisan profile exists and there's artisan data to update
      if (updateData.artisanProfile) {
        const artisanRef = collections.artisans.doc(userId);
        batch.update(artisanRef, {
          ...updateData.artisanProfile,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}