import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const toggleFavorite = (productId: string) => {
    setFavoriteIds(prevIds => {
      if (prevIds.includes(productId)) {
        return prevIds.filter(id => id !== productId);
      } else {
        return [...prevIds, productId];
      }
    });
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