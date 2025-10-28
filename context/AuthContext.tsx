import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, pass: string, role: 'buyer' | 'artisan') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication
  useState(() => {
    // Simulate checking for an existing session
    setTimeout(() => {
        setLoading(false);
    }, 1000);
  });

  const login = async (email: string, pass: string) => {
    console.log("Logging in with", email, pass);
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    // NOTE: Defaulting to an artisan user for demonstration purposes.
    setUser({
        uid: 'artisan-1',
        email: email,
        displayName: 'Rina Devi',
        role: 'artisan'
    });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const signup = async (email: string, pass: string, role: 'buyer' | 'artisan') => {
    console.log(`Signing up as ${role} with`, email, pass);
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
     setUser({
        uid: `mock-user-${Date.now()}`,
        email: email,
        displayName: 'New User',
        role: role
    });
    setLoading(false);
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