/**
 * Upload controller for KalaSetu
 * Handles image uploads to Google Cloud Storage
 */

import {
  uploadToGCS,
  deleteFromGCS,
  getFileNameFromUrl,
  verifyFileOwnership
} from '../middleware/upload.js';

/**
 * Upload a single image
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const publicUrl = await uploadToGCS(req.file);
    
    res.json({
      url: publicUrl,
      fileName: getFileNameFromUrl(publicUrl),
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadPromises = req.files.map(file => uploadToGCS(file));
    const urls = await Promise.all(uploadPromises);

    res.json({
      urls,
      fileNames: urls.map(url => getFileNameFromUrl(url)),
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

/**
 * Delete an image
 */
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    await deleteFromGCS(filename);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

/**
 * Verify image ownership before deletion
 */
export const verifyImageOwnership = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const isOwner = await verifyFileOwnership(req.user.uid, filename);
    
    if (!isOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this image' });
    }
    
    next();
  } catch (error) {
    console.error('Verify image ownership error:', error);
    res.status(500).json({ error: 'Failed to verify image ownership' });
  }
};