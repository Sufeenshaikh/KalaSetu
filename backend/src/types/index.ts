// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'artisan' | 'customer' | 'admin';
  profileImage?: string;
  contactInfo?: {
    phone: string;
    address: string;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Artisan {
  userId: string;
  bio: string;
  craftType: string[];
  experience: number;
  stories: ArtisanStory[];
  rating: number;
  totalReviews: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface ArtisanStory {
  title: string;
  content: string;
  images: string[];
  createdAt: FirebaseFirestore.Timestamp;
}

// Product types
export interface Product {
  artisanId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  inStock: number;
  rating: number;
  totalReviews: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Review {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: FirebaseFirestore.Timestamp;
}

// Order types
export interface Order {
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// File Upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}