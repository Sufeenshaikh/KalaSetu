import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
      };
    }
  }
}

export interface Product {
  id: string;
  title: string;
  category: string;
  region: string;
  price: number;
  description: string;
  images: string[];
  artisanId: string;
  artisanName?: string; // Denormalized for convenience
  likes: number;
}

export interface Artisan {
  id: string;
  name: string;
  region: string;
  bio: string;
  story: string;
  image: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'buyer' | 'artisan';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  timestamp: number;
}