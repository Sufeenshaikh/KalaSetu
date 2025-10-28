/**
 * Upload middleware configuration for KalaSetu
 * Sets up multer for handling file uploads and Google Cloud Storage
 */

import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

// Configure multer for memory storage (files stored in memory before GCS upload)
const multerStorage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

// Multer configuration
export const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 files per request
  }
});

/**
 * Helper to generate a unique filename for GCS
 */
export const generateFileName = (originalname) => {
  const uniqueId = uuidv4();
  const extension = path.extname(originalname);
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}${extension}`;
};

/**
 * Upload a single file to Google Cloud Storage
 */
export const uploadToGCS = async (file, customFileName = null) => {
  try {
    const fileName = customFileName || generateFileName(file.originalname);
    const gcsFile = bucket.file(fileName);

    // Create write stream and pipe file buffer
    const stream = gcsFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false
    });

    // Handle upload with promises
    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(file.buffer);
    });

    // Make the file public
    await gcsFile.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (error) {
    console.error('GCS upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Delete a file from Google Cloud Storage
 */
export const deleteFromGCS = async (fileName) => {
  try {
    await bucket.file(fileName).delete();
  } catch (error) {
    console.error('GCS delete error:', error);
    throw new Error('Failed to delete file from storage');
  }
};

/**
 * Extract filename from GCS URL
 */
export const getFileNameFromUrl = (url) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

/**
 * Verify file ownership (to be implemented based on your data model)
 */
export const verifyFileOwnership = async (userId, fileName) => {
  // Implement your ownership verification logic here
  // Example: Check if the file is associated with the user's products/profile
  return true;
};