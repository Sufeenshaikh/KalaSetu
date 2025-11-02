import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getProductById } from '../services/firestoreService';
import { createActivity } from '../services/firestoreService';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'kalasetu_favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load favorites from localStorage on mount
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, [favoriteIds]);

  const toggleFavorite = async (productId: string) => {
    const isCurrentlyFavorite = favoriteIds.includes(productId);
    
    setFavoriteIds(prevIds => {
      if (prevIds.includes(productId)) {
        return prevIds.filter(id => id !== productId);
      } else {
        return [...prevIds, productId];
      }
    });
    
    // Create activity event when product is liked (not when unliked)
    if (!isCurrentlyFavorite) {
      try {
        // Get product to find artisanId
        const product = await getProductById(productId);
        if (product && product.artisanId) {
          await createActivity('like', product.artisanId, productId, product.title);
        }
      } catch (error) {
        console.warn('Failed to create like activity:', error);
        // Continue even if activity creation fails
      }
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favoriteIds.includes(productId);
  };
  
  const favoritesCount = favoriteIds.length;

  const value = { favoriteIds, isFavorite, toggleFavorite, favoritesCount };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};