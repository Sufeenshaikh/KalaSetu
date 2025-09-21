
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const decreaseQuantity = (productId: string) => {
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === productId);
        // If item quantity is more than 1, decrement it
        if (existingItem && existingItem.quantity > 1) {
            return prevItems.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            );
        }
        // If quantity is 1 or item doesn't exist, remove it from the cart
        return prevItems.filter(item => item.id !== productId);
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value = { cartItems, addToCart, decreaseQuantity, removeFromCart, clearCart, cartCount, cartTotal };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
