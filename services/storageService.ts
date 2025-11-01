/**
 * Firebase Storage Service
 * Handles image uploads to Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadImageOptions {
  folder?: 'products' | 'artisans' | 'users';
  fileName?: string;
}

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param options - Upload options (folder, fileName)
 * @returns Promise resolving to the download URL
 */
export const uploadImage = async (
  file: File,
  options: UploadImageOptions = {}
): Promise<string> => {
  try {
    const { folder = 'products', fileName } = options;
    
    // Generate unique filename if not provided
    const uniqueFileName = fileName || `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }
    
    // Create storage reference
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of image files to upload
 * @param options - Upload options
 * @returns Promise resolving to array of download URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  options: UploadImageOptions = {}
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload image from base64 data URI
 * @param dataUri - Base64 data URI (e.g., "data:image/jpeg;base64,...")
 * @param options - Upload options
 * @returns Promise resolving to the download URL
 */
export const uploadImageFromDataUri = async (
  dataUri: string,
  options: UploadImageOptions = {}
): Promise<string> => {
  try {
    // Parse data URI
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid data URI format');
    }
    
    const mimeType = match[1];
    const base64Data = match[2];
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Create file from blob
    const fileName = options.fileName || `image_${Date.now()}.${mimeType.split('/')[1]}`;
    const file = new File([blob], fileName, { type: mimeType });
    
    // Upload file
    return await uploadImage(file, options);
  } catch (error) {
    console.error('Error uploading image from data URI:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete an image from Firebase Storage
 * @param url - The storage URL or path to delete
 * @returns Promise resolving when deletion is complete
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract path from URL if full URL is provided
    let path = url;
    if (url.includes('firebasestorage.googleapis.com')) {
      // Extract path from full URL
      const pathMatch = url.match(/\/o\/(.+?)\?/);
      if (pathMatch) {
        path = decodeURIComponent(pathMatch[1]);
      }
    }
    
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error if image doesn't exist (already deleted)
    if (error instanceof Error && !error.message.includes('not found')) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
};

/**
 * Delete multiple images from Firebase Storage
 * @param urls - Array of storage URLs or paths to delete
 * @returns Promise resolving when all deletions are complete
 */
export const deleteMultipleImages = async (urls: string[]): Promise<void> => {
  try {
    const deletePromises = urls.map(url => deleteImage(url));
    await Promise.allSettled(deletePromises); // Use allSettled to continue even if some fail
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw new Error(`Failed to delete images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

