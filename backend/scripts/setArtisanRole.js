/**
 * setArtisanRole.js
 * 
 * This script grants the 'artisan' custom claim to a specific Firebase user.
 * Run this script once after creating a test user to grant them artisan permissions.
 * 
 * Usage:
 *   1. Replace REPLACE_WITH_YOUR_TEST_USER_UID_HERE with your actual user UID
 *   2. Make sure you have a .env file with Firebase Admin credentials
 *   3. Run: node backend/scripts/setArtisanRole.js
 * 
 * After running this script:
 *   - The user must log out and log back in on the frontend for the claim to take effect
 *   - The user will now have artisan permissions (can create products, update profile, etc.)
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('❌ Error: Firebase Admin credentials not found in .env file');
  console.error('Please ensure you have set:');
  console.error('  - FIREBASE_PROJECT_ID');
  console.error('  - FIREBASE_CLIENT_EMAIL');
  console.error('  - FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

try {
  // Initialize Firebase Admin (only if not already initialized)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  }
} catch (error) {
  if (error.code === 'app/already-initialized') {
    // App already initialized, that's fine
  } else {
    console.error('❌ Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

/**
 * Set artisan role for a user
 */
async function setArtisanRole(userUID) {
  try {
    // Set custom claim
    await admin.auth().setCustomUserClaims(userUID, { role: 'artisan' });
    
    // Also update the user document in Firestore
    const userRef = admin.firestore().collection('users').doc(userUID);
    await userRef.set(
      { role: 'artisan' },
      { merge: true }
    );
    
    console.log(`✅ Successfully granted 'artisan' role to user: ${userUID}`);
    console.log('\n📝 IMPORTANT:');
    console.log('   The user must LOG OUT and LOG BACK IN on the frontend');
    console.log('   for the custom claim to take effect.');
    console.log('   Custom claims are only applied to ID tokens when they are issued.');
    
    return true;
  } catch (error) {
    console.error(`❌ Error setting artisan role for user ${userUID}:`, error);
    return false;
  }
}

// Main execution
async function main() {
  // ⚠️ REPLACE THIS WITH YOUR ACTUAL TEST USER UID
  const TEST_USER_UID = 'REPLACE_WITH_YOUR_TEST_USER_UID_HERE';
  
  if (TEST_USER_UID === 'REPLACE_WITH_YOUR_TEST_USER_UID_HERE') {
    console.error('❌ Error: Please replace REPLACE_WITH_YOUR_TEST_USER_UID_HERE with your actual user UID');
    console.error('\nTo find your user UID:');
    console.error('  1. Create a test user account on the frontend');
    console.error('  2. Check the Firebase Console > Authentication > Users');
    console.error('  3. Copy the User UID');
    console.error('  4. Update this script and run it again');
    process.exit(1);
  }
  
  console.log('🔄 Setting artisan role for user:', TEST_USER_UID);
  const success = await setArtisanRole(TEST_USER_UID);
  
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

