import admin from 'firebase-admin';
import crypto from 'crypto';

// In-memory fallbacks when Firebase Admin is not configured
const inMemoryCache = new Map();
const inMemoryUsage = new Map();

const getFirestore = () => {
  try {
    if (admin && admin.firestore) return admin.firestore();
  } catch (e) {
    return null;
  }
  return null;
};

function makeKey(type, params) {
  const payload = JSON.stringify({ type, params });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export async function getCachedContent(type, params) {
  const key = makeKey(type, params);
  const db = getFirestore();
  if (db) {
    const doc = await db.collection('aiContent').doc(key).get();
    if (doc.exists) {
      const data = doc.data();
      if (!data.expiresAt || data.expiresAt.toDate() > new Date()) {
        return data.content;
      }
      // expired
      await db.collection('aiContent').doc(key).delete().catch(() => {});
      return null;
    }
    return null;
  }

  // fallback
  const entry = inMemoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return entry.content;
}

export async function setCachedContent(type, params, content, ttlSeconds = 60 * 60 * 24 * 7) {
  const key = makeKey(type, params);
  const db = getFirestore();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  if (db) {
    await db.collection('aiContent').doc(key).set({
      type,
      contentKey: key,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt
    });
    return key;
  }
  inMemoryCache.set(key, { content, expiresAt: expiresAt.getTime() });
  return key;
}

// Simple per-user daily quota using Firestore or in-memory
export async function incrementUsage(userId, limitPerDay = 5) {
  if (!userId) return { allowed: false, remaining: 0 };
  const db = getFirestore();
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const docId = `${userId}_${dayKey}`;
  if (db) {
    const ref = db.collection('aiUsage').doc(docId);
    const res = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      let count = 0;
      if (snap.exists) {
        count = snap.data().count || 0;
      }
      if (count >= limitPerDay) {
        return { allowed: false, remaining: 0 };
      }
      tx.set(ref, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return { allowed: true, remaining: limitPerDay - (count + 1) };
    });
    return res;
  }

  // in-memory fallback
  const key = docId;
  const entry = inMemoryUsage.get(key) || { count: 0 };
  if (entry.count >= limitPerDay) return { allowed: false, remaining: 0 };
  entry.count += 1;
  inMemoryUsage.set(key, entry);
  return { allowed: true, remaining: limitPerDay - entry.count };
}

export default {
  getCachedContent,
  setCachedContent,
  incrementUsage,
};
