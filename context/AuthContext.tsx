import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, role: 'buyer' | 'artisan') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.displayName || '',
              role: userData.role || 'buyer',
              photoURL: userData.photoURL || firebaseUser.photoURL || null,
            });
          } else {
            // New user without profile, create default profile
            const defaultRole = 'buyer';
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'New User',
              role: defaultRole,
              createdAt: new Date().toISOString(),
            });
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'New User',
              role: defaultRole,
              photoURL: firebaseUser.photoURL || null,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to basic user info if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'buyer',
            photoURL: firebaseUser.photoURL || null,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const signup = async (email: string, pass: string, role: 'buyer' | 'artisan') => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        displayName: 'New User',
        role: role,
        createdAt: new Date().toISOString(),
      });
      
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const value = { user, loading, login, logout, signup };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};