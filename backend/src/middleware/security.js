/**
 * Security middleware for KalaSetu
 * Sets up rate limiting, CORS, and other security measures
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration
export const rateLimiters = {
  // General API rate limit
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
  }),

  // Stricter limit for auth endpoints
  auth: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: { error: 'Too many login attempts, please try again later.' },
  }),

  // Upload endpoint limit
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: { error: 'Upload limit reached, please try again later.' },
  }),
};

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      // Add other CSP directives as needed
    },
  },
});

// CORS configuration
export const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600, // 10 minutes
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  // Default error response
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when the response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};