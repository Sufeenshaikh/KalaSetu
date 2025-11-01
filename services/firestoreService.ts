import type { Product, Artisan } from '../types';
import type { ActivityEvent } from '../data/activityFeed';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Convert Firestore timestamp to number or keep as is
 */
const convertTimestamp = (value: any): any => {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (value && typeof value === 'object' && value.seconds) {
    return value.seconds * 1000;
  }
  return value;
};

/**
 * Convert Firestore document to Product
 */
const docToProduct = (docData: DocumentData, id: string): Product => {
  const data = docData;
  return {
    id: id,
    title: data.title || '',
    category: data.category || '',
    region: data.region || '',
    price: data.price || 0,
    description: data.description || '',
    images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
    artisanId: data.artisanId || '',
    artisanName: data.artisanName || '',
    likes: data.likes || 0,
  };
};

/**
 * Convert Firestore document to Artisan
 */
const docToArtisan = (docData: DocumentData, id: string): Artisan => {
  const data = docData;
  return {
    id: id,
    name: data.name || '',
    region: data.region || '',
    bio: data.bio || '',
    story: data.story || '',
    image: data.image || '',
  };
};

/**
 * Get featured products (first 6 products, ordered by creation date)
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(6));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(docToProduct(doc.data(), doc.id));
    });
    
    return products;
  } catch (error) {
    console.error('Error getting featured products:', error);
    return [];
  }
};

/**
 * Get all products with optional filtering, pagination, and search
 */
export interface ProductFilters {
  searchTerm?: string;
  category?: string;
  region?: string;
  artisanId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export const getAllProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    let q: any = query(productsRef);
    
    // Apply filters
    if (filters?.category && filters.category !== 'All') {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.region && filters.region !== 'All') {
      q = query(q, where('region', '==', filters.region));
    }
    if (filters?.artisanId) {
      q = query(q, where('artisanId', '==', filters.artisanId));
    }
    if (filters?.minPrice !== undefined) {
      q = query(q, where('price', '>=', filters.minPrice));
    }
    if (filters?.maxPrice !== undefined) {
      q = query(q, where('price', '<=', filters.maxPrice));
    }
    
    // Apply sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    q = query(q, orderBy(sortBy, sortOrder));
    
    // Apply pagination if specified
    if (filters?.limit) {
      const page = filters.page || 1;
      const offset = (page - 1) * filters.limit;
      if (offset > 0) {
        // Firestore doesn't support offset directly, so we'd need to use cursor-based pagination
        // For now, we'll just apply limit
      }
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    let products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(docToProduct(doc.data(), doc.id));
    });
    
    // Apply client-side search if searchTerm is provided
    // Note: Firestore doesn't support full-text search natively
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.region.toLowerCase().includes(searchLower) ||
        product.artisanName?.toLowerCase().includes(searchLower)
      );
    }
    
    return products;
  } catch (error) {
    console.error('Error getting all products:', error);
    return [];
  }
};

/**
 * Get all products with pagination
 */
export const getProductsPaginated = async (filters?: ProductFilters): Promise<PaginatedProducts> => {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    
    // Get all products with filters (without pagination limit)
    const allProducts = await getAllProducts({
      ...filters,
      limit: undefined,
      page: undefined,
    });
    
    // Apply pagination manually
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      total: allProducts.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(allProducts.length / limit),
      hasMore: endIndex < allProducts.length,
    };
  } catch (error) {
    console.error('Error getting paginated products:', error);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: filters?.limit || 20,
      totalPages: 0,
      hasMore: false,
    };
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return docToProduct(productSnap.data(), productSnap.id);
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return undefined;
  }
};

/**
 * Get all products by a specific artisan
 */
export const getProductsByArtisanId = async (artisanId: string): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('artisanId', '==', artisanId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(docToProduct(doc.data(), doc.id));
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products by artisan ID:', error);
    return [];
  }
};

/**
 * Add a new product to Firestore
 */
export const addProduct = async (productData: Omit<Product, 'id' | 'artisanName'>): Promise<Product> => {
  try {
    // Get artisan name if artisanId is provided
    let artisanName = 'Unknown Artisan';
    if (productData.artisanId) {
      const artisan = await getArtisanById(productData.artisanId);
      if (artisan) {
        artisanName = artisan.name;
      }
    }
    
    // Prepare product data for Firestore
    const productToAdd = {
      title: productData.title,
      category: productData.category,
      region: productData.region,
      price: productData.price,
      description: productData.description,
      images: productData.images.length > 0 
        ? productData.images 
        : ['https://picsum.photos/seed/newcraft/600/600'],
      artisanId: productData.artisanId,
      artisanName: artisanName,
      likes: productData.likes || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, productToAdd);
    
    return {
      id: docRef.id,
      ...productToAdd,
    } as Product;
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (
  productId: string, 
  productData: Partial<Omit<Product, 'id' | 'artisanId' | 'artisanName'>>
): Promise<Product | undefined> => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return undefined;
    }
    
    // Update artisanName if artisanId exists and artisanName is not provided
    const updateData: any = {
      ...productData,
      updatedAt: Timestamp.now(),
    };
    
    // If images array is being updated, ensure it's an array
    if (updateData.images !== undefined && !Array.isArray(updateData.images)) {
      updateData.images = [updateData.images];
    }
    
    await updateDoc(productRef, updateData);
    
    // Return updated product
    const updatedSnap = await getDoc(productRef);
    return docToProduct(updatedSnap.data()!, updatedSnap.id);
  } catch (error) {
    console.error('Error updating product:', error);
    return undefined;
  }
};

/**
 * Delete a product from Firestore
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get an artisan by ID
 */
export const getArtisanById = async (id: string): Promise<Artisan | undefined> => {
  try {
    // First try to get from artisans collection
    const artisanRef = doc(db, 'artisans', id);
    const artisanSnap = await getDoc(artisanRef);
    
    if (artisanSnap.exists()) {
      return docToArtisan(artisanSnap.data(), artisanSnap.id);
    }
    
    // If not found in artisans collection, check users collection
    // (artisans might be stored in users collection with role='artisan')
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role === 'artisan') {
        // Convert user document to artisan format
        return {
          id: userSnap.id,
          name: userData.displayName || userData.name || '',
          region: userData.region || '',
          bio: userData.bio || '',
          story: userData.story || '',
          image: userData.image || userData.photoURL || '',
        };
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error getting artisan by ID:', error);
    return undefined;
  }
};

/**
 * Update or create an artisan profile
 */
export const updateArtisan = async (
  artisanId: string, 
  artisanData: Partial<Omit<Artisan, 'id'>>
): Promise<Artisan | undefined> => {
  try {
    // Try to update in artisans collection first
    const artisanRef = doc(db, 'artisans', artisanId);
    const artisanSnap = await getDoc(artisanRef);
    
    if (artisanSnap.exists()) {
      // Update existing artisan
      const updateData = {
        ...artisanData,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(artisanRef, updateData);
      
      const updatedSnap = await getDoc(artisanRef);
      return docToArtisan(updatedSnap.data()!, updatedSnap.id);
    } else {
      // Create new artisan document
      const newArtisan = {
        name: artisanData.name || 'Unnamed Artisan',
        region: artisanData.region || '',
        bio: artisanData.bio || '',
        story: artisanData.story || '',
        image: artisanData.image || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Use setDoc to create a new document
      await setDoc(artisanRef, newArtisan);
      
      return {
        id: artisanId,
        ...newArtisan,
      } as Artisan;
    }
  } catch (error: any) {
    // If updateDoc failed because document doesn't exist, create it
    if (error?.code === 'not-found' || error?.code === 5) {
      try {
        const artisanRef = doc(db, 'artisans', artisanId);
        const newArtisan = {
          name: artisanData.name || 'Unnamed Artisan',
          region: artisanData.region || '',
          bio: artisanData.bio || '',
          story: artisanData.story || '',
          image: artisanData.image || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        
        await setDoc(artisanRef, newArtisan);
        
        return {
          id: artisanId,
          ...newArtisan,
        } as Artisan;
      } catch (createError) {
        console.error('Error creating artisan:', createError);
        return undefined;
      }
    }
    
    console.error('Error updating artisan:', error);
    return undefined;
  }
};

/**
 * Get featured artisan (first artisan, ordered by creation date)
 */
export const getFeaturedArtisan = async (): Promise<Artisan | undefined> => {
  try {
    const artisansRef = collection(db, 'artisans');
    const q = query(artisansRef, orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return docToArtisan(doc.data(), doc.id);
    }
    
    // If no artisans found, try to get from users collection
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('role', '==', 'artisan'), limit(1));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        name: userData.displayName || userData.name || '',
        region: userData.region || '',
        bio: userData.bio || '',
        story: userData.story || '',
        image: userData.image || userData.photoURL || '',
      };
    }
    
    return undefined;
  } catch (error) {
    console.error('Error getting featured artisan:', error);
    return undefined;
  }
};

/**
 * Get activity events for an artisan
 */
export const getActivityByArtisanId = async (artisanId: string): Promise<ActivityEvent[]> => {
  try {
    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('artisanId', '==', artisanId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const activities: ActivityEvent[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        artisanId: data.artisanId,
        type: data.type,
        description: data.description,
        timestamp: convertTimestamp(data.timestamp) || Date.now(),
        productId: data.productId || null,
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting activity by artisan ID:', error);
    // Return empty array if activities collection doesn't exist or has no data
    return [];
  }
};
