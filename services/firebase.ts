
// Frontend Firebase initialization using provided web config
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBEh_w4QwH0a8Ht7o_5mc3L3WXp0oDRNhE",
  authDomain: "kalasetu-e55c4.firebaseapp.com",
  projectId: "kalasetu-e55c4",
  storageBucket: "kalasetu-e55c4.firebasestorage.app",
  messagingSenderId: "834060824789",
  appId: "1:834060824789:web:4156176653ec3603d1725c",
  measurementId: "G-ETCXHR73C0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Optionally, lazy-load analytics in environments where window is available
export async function initAnalytics() {
  if (typeof window === 'undefined') return null;
  try {
    const { getAnalytics } = await import('firebase/analytics');
    return getAnalytics(app);
  } catch (e) {
    // analytics import may fail in SSR or non-browser environments
    return null;
  }
}
