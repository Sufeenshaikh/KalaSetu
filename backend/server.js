/**
 * backend/server.js
 *
 * Entry point for the KalaSetu backend (Node.js + Express).
 * - Uses ES modules (import/export)
 * - Initializes Firebase Admin SDK for Auth + Firestore
 * - Configures Google Cloud Storage usage (placeholder)
 * - Installs middleware for CORS, JSON parsing, logging
 * - Exposes a verifyToken middleware that verifies Firebase ID tokens
 * - Registers route placeholders (to be implemented in ./routes/*)
 *
 * Environment variables (put these into a .env):
 *   PORT=5000
 *   FIREBASE_PROJECT_ID=your-firebase-project-id
 *   FIREBASE_CLIENT_EMAIL=your-service-account-client-email
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *   GCLOUD_PROJECT=your-gcloud-project-id
 *   GCLOUD_STORAGE_BUCKET=your-bucket-name
 *   STRIPE_SECRET_KEY=sk_test_...
 *   GEMINI_API_KEY=ya29....
 *   SENDGRID_API_KEY=
 *   MAILCHIMP_API_KEY=
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';

// Load .env variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Initialize Firebase Admin SDK using environment variables.
// We build a service account object from env vars to avoid having a file committed.
try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key in env must have literal newlines (\n) which we convert back
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.warn('Firebase service account not fully configured via env; admin SDK will not be initialized.');
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.GCLOUD_STORAGE_BUCKET || undefined,
    });
    console.log('Firebase Admin initialized');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Admin:', err);
}

// Middleware to verify Firebase ID tokens sent by the client in Authorization: Bearer <token>
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.*)$/i);
  const idToken = match ? match[1] : null;

  if (!idToken) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    // firebase-admin must be initialized; verifyIdToken will throw if not.
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Attach a minimal user object to the request for downstream handlers
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      roles: decoded.roles || decoded.role || null, // your app can put custom claims
      raw: decoded,
    };
    return next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Route placeholders. Each route file will be implemented under ./routes
// Example: import authRoutes from './routes/auth.js'; app.use('/api/auth', authRoutes);
// We'll add the concrete route modules in follow-up steps.
import { Router } from 'express';

const placeholderRouter = Router();
placeholderRouter.get('/', (req, res) => res.json({ status: 'KalaSetu backend up', timestamp: Date.now() }));

app.use('/api', placeholderRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

// Start server if this file is executed directly (not imported)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`KalaSetu backend listening on port ${PORT}`);
});

export default app;
