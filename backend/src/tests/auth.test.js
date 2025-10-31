import { auth, firestore } from '../config/firebase-auth.js';

// Test creating a user with a role
const testAuth = async () => {
  try {
    // 1. Create a test user
    const userEmail = 'test@kalasetu.com';
    const userPassword = 'testPassword123';
    
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: userEmail,
        password: userPassword,
        displayName: 'Test User'
      });
      console.log('Created test user:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(userEmail);
        console.log('Using existing test user:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // 2. Set custom claims (role)
    await auth.setCustomUserClaims(userRecord.uid, { role: 'artisan' });
    console.log('Set custom claims for user');

    // 3. Create a test document in Firestore
    await firestore.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userEmail,
      displayName: 'Test User',
      role: 'artisan',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created Firestore document for user');

    // 4. Verify the role was set
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log('User role:', updatedUser.customClaims?.role);

    return {
      success: true,
      uid: userRecord.uid,
      email: userEmail
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test
testAuth().then(result => {
  console.log('Test result:', result);
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});