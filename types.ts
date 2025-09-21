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
