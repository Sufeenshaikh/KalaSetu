import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };

// Collection references
export const collections = {
  users: db.collection('users'),
  artisans: db.collection('artisans'),
  products: db.collection('products'),
  orders: db.collection('orders'),
  reviews: db.collection('reviews'),
};

// Utility functions
export const createDocument = async (collection: string, data: any) => {
  const docRef = await collections[collection].add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

export const updateDocument = async (collection: string, id: string, data: any) => {
  await collections[collection].doc(id).update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteDocument = async (collection: string, id: string) => {
  await collections[collection].doc(id).delete();
};

export const getDocument = async (collection: string, id: string) => {
  const doc = await collections[collection].doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};