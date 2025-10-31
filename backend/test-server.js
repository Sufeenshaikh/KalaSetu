import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: new URL('../.env', import.meta.url).pathname
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import AI routes
import AIController from './src/controllers/ai.controller.js';
import { aiValidation } from './src/middleware/ai.validation.js';

// AI Routes
app.post('/api/ai/story', aiValidation.validateArtisanStory, AIController.generateArtisanStory);
app.post('/api/ai/enhance-description', aiValidation.validateProductDescription, AIController.enhanceDescription);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});