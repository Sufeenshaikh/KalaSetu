/**
 * File upload routes for KalaSetu
 * Handles image uploads to Google Cloud Storage
 */

import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../../server.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = Router();

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload/image
 * Upload a single image to Google Cloud Storage
 * @body {file} image - The image file to upload
 * Returns the public URL of the uploaded image
 */
router.post('/image', 
  verifyToken,
  upload.single('image'),
  uploadController.uploadImage
);

/**
 * POST /api/upload/images
 * Upload multiple images to Google Cloud Storage
 * @body {file[]} images - Array of image files
 * Returns array of public URLs
 */
router.post('/images',
  verifyToken,
  upload.array('images', 5), // Max 5 images
  uploadController.uploadMultipleImages
);

/**
 * DELETE /api/upload/:filename
 * Delete an image from storage (requires ownership verification)
 */
router.delete('/:filename',
  verifyToken,
  uploadController.verifyImageOwnership,
  uploadController.deleteImage
);

/**
 * Error handling for multer
 */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;