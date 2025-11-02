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
import { products as dummyProducts } from '../data/products';
import { artisans as dummyArtisans } from '../data/dummyData';
import { mockActivity } from '../data/activityFeed';

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
  let products: Product[] = [];
  
  // First, load local products
  try {
    const localProductsData = localStorage.getItem('local_products');
    if (localProductsData) {
      const localProducts = JSON.parse(localProductsData);
      if (Array.isArray(localProducts)) {
        // Convert local products to Product format
        products = localProducts.map((p: any) => ({
          id: p.id,
          title: p.title || '',
          category: p.category || '',
          region: p.region || '',
          price: p.price || 0,
          description: p.description || '',
          images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
          artisanId: p.artisanId || '',
          artisanName: p.artisanName || 'Unknown Artisan',
          likes: p.likes || 0,
          ...(p.createdAt && { createdAt: p.createdAt }),
          ...(p.updatedAt && { updatedAt: p.updatedAt }),
        })) as Product[];
      }
    }
  } catch (localError) {
    console.warn('Failed to load local products:', localError);
  }
  
  // Try to load from Firebase
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(6));
    
    // Try with timeout
    const firebasePromise = getDocs(q);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase query timeout')), 3000)
    );
    
    const querySnapshot = await Promise.race([firebasePromise, timeoutPromise]) as any;
    
    // Merge Firebase products (avoid duplicates)
    const existingIds = new Set(products.map(p => p.id));
    querySnapshot.forEach((doc: any) => {
      const product = docToProduct(doc.data(), doc.id);
      if (!existingIds.has(product.id)) {
        products.push(product);
        existingIds.add(product.id);
      }
    });
  } catch (error: any) {
    console.warn('Firebase query failed or timed out, using local products:', error?.message || error);
  }
  
  // Fallback to dummy data if no products at all
  if (products.length === 0) {
    console.warn('No products found, using dummy data');
    products = [...dummyProducts];
  }
  
  // Sort by creation date (descending) and take first 6
  // For local products without createdAt, use a recent timestamp
  products.sort((a, b) => {
    const aTime = (a as any).createdAt?.toMillis?.() || (a as any).createdAt || Date.now();
    const bTime = (b as any).createdAt?.toMillis?.() || (b as any).createdAt || Date.now();
    return bTime - aTime;
  });
  
  // Remove duplicates and return first 6
  const uniqueProducts = Array.from(
    new Map(products.map(p => [p.id, p])).values()
  );
  
  return uniqueProducts.slice(0, 6);
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

// Helper function to apply filters to products array
const applyFiltersToProducts = (products: Product[], filters?: ProductFilters): Product[] => {
  let filtered = [...products];
  
  if (filters?.category && filters.category !== 'All') {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  if (filters?.region && filters.region !== 'All') {
    filtered = filtered.filter(p => p.region === filters.region);
  }
  if (filters?.artisanId) {
    filtered = filtered.filter(p => p.artisanId === filters.artisanId);
  }
  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }
  
  // Apply client-side search if searchTerm is provided
  if (filters?.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.region.toLowerCase().includes(searchLower) ||
      product.artisanName?.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

export const getAllProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  let products: Product[] = [];
  
  // First, load local products from localStorage (always fast and reliable)
  try {
    const localProductsData = localStorage.getItem('local_products');
    if (localProductsData) {
      const localProducts = JSON.parse(localProductsData);
      if (Array.isArray(localProducts)) {
        // Convert local products to Product format, handling createdAt/updatedAt
        products = localProducts.map((p: any) => ({
          id: p.id,
          title: p.title || '',
          category: p.category || '',
          region: p.region || '',
          price: p.price || 0,
          description: p.description || '',
          images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
          artisanId: p.artisanId || '',
          artisanName: p.artisanName || 'Unknown Artisan',
          likes: p.likes || 0,
          // Preserve createdAt/updatedAt if they exist (as numbers)
          ...(p.createdAt && { createdAt: p.createdAt }),
          ...(p.updatedAt && { updatedAt: p.updatedAt }),
        })) as Product[];
        console.log(`Loaded ${products.length} products from localStorage:`, products);
      }
    }
  } catch (localError) {
    console.warn('Failed to load local products:', localError);
  }
  
  // Try to load from Firebase (may fail or timeout)
  try {
    const productsRef = collection(db, 'products');
    let q: any = query(productsRef);
    
    // Only apply Firebase filters that won't cause query errors
    // For complex filters, we'll do client-side filtering
    if (filters?.artisanId) {
      q = query(q, where('artisanId', '==', filters.artisanId));
    }
    
    // Apply sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    try {
      q = query(q, orderBy(sortBy, sortOrder));
    } catch (orderError) {
      // If orderBy fails (e.g., field doesn't exist), just use basic query
      console.warn('Failed to apply sorting, using basic query:', orderError);
    }
    
    // Apply pagination if specified
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }
    
    // Try Firebase query with timeout
    const firebasePromise = getDocs(q);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase query timeout')), 3000)
    );
    
    const querySnapshot = await Promise.race([firebasePromise, timeoutPromise]) as any;
    
    // Merge Firebase products with local products (avoid duplicates)
    const existingIds = new Set(products.map(p => p.id));
    querySnapshot.forEach((doc: any) => {
      const product = docToProduct(doc.data(), doc.id);
      // Only add if not already in local products
      if (!existingIds.has(product.id)) {
        products.push(product);
        existingIds.add(product.id);
      }
    });
    console.log(`Loaded products from Firebase, total now: ${products.length}`);
  } catch (error: any) {
    // Firebase failed or timed out - that's okay, we have local products
    console.warn('Firebase query failed or timed out, using local products only:', error?.message || error);
  }
  
  // If no products at all, use dummy data as fallback
  if (products.length === 0) {
    console.warn('No products found, using dummy data');
    products = [...dummyProducts];
  }
  
  // Apply all filters to the combined product list (client-side)
  products = applyFiltersToProducts(products, filters);
  
  // Remove duplicates based on ID
  const uniqueProducts = Array.from(
    new Map(products.map(p => [p.id, p])).values()
  );
  
  return uniqueProducts;
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
  // First check localStorage for local products
  try {
    const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
    const localProduct = localProducts.find((p: Product) => p.id === id);
    if (localProduct) {
      return localProduct as Product;
    }
  } catch (localError) {
    console.warn('Failed to check local products:', localError);
  }
  
  // Then try Firebase
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return docToProduct(productSnap.data(), productSnap.id);
    }
  } catch (error) {
    console.error('Error getting product from Firebase:', error);
  }
  
  // Fallback to dummy data
  return dummyProducts.find(p => p.id === id);
};

/**
 * Get all products by a specific artisan
 */
export const getProductsByArtisanId = async (artisanId: string): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('artisanId', '==', artisanId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    let products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(docToProduct(doc.data(), doc.id));
    });
    
    // Also load local products from localStorage for this artisan
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      const artisanLocalProducts = localProducts.filter((p: Product) => p.artisanId === artisanId);
      products = [...products, ...artisanLocalProducts];
    } catch (localError) {
      console.warn('Failed to load local products:', localError);
    }
    
    // Fallback to dummy data if Firebase returns empty
    if (products.length === 0) {
      console.warn('No products found in Firebase for artisan, using dummy data');
      return dummyProducts.filter(p => p.artisanId === artisanId);
    }
    
    return products;
  } catch (error) {
    console.error('Error getting products by artisan ID:', error);
    // Also try to load from localStorage on error
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      const artisanLocalProducts = localProducts.filter((p: Product) => p.artisanId === artisanId);
      if (artisanLocalProducts.length > 0) {
        return artisanLocalProducts;
      }
    } catch (localError) {
      console.warn('Failed to load local products:', localError);
    }
    // Return dummy data on error
    return dummyProducts.filter(p => p.artisanId === artisanId);
  }
};

/**
 * Add a new product to Firestore
 */
export const addProduct = async (productData: Omit<Product, 'id' | 'artisanName'>): Promise<Product> => {
  // Get artisan name if artisanId is provided
  let artisanName = 'Unknown Artisan';
  if (productData.artisanId) {
    try {
      const artisan = await getArtisanById(productData.artisanId);
      if (artisan) {
        artisanName = artisan.name;
      }
    } catch (error) {
      console.warn('Failed to get artisan name, using default');
    }
  }
  
  // Prepare product data
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
  
  // Create local product first (always works)
  // Convert Timestamp to number for localStorage (JSON can't store Timestamp objects)
  const tempId = `local-${Date.now()}`;
  const now = Date.now();
  const localProduct: Product & { createdAt?: number; updatedAt?: number } = {
    id: tempId,
    title: productToAdd.title,
    category: productToAdd.category,
    region: productToAdd.region,
    price: productToAdd.price,
    description: productToAdd.description,
    images: productToAdd.images,
    artisanId: productToAdd.artisanId,
    artisanName: productToAdd.artisanName,
    likes: productToAdd.likes,
    createdAt: now, // Store as number for localStorage
    updatedAt: now,
  };
  
  // Save to localStorage immediately (fast, always works)
  try {
    const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
    localProducts.push(localProduct);
    localStorage.setItem('local_products', JSON.stringify(localProducts));
    console.log('Product saved to localStorage with temp ID:', tempId, localProduct);
    
    // Dispatch custom event to notify other components (like shop page)
    window.dispatchEvent(new CustomEvent('productSaved', { detail: localProduct }));
  } catch (localError) {
    console.error('Failed to save product to localStorage:', localError);
    // Even if localStorage fails, return the product object
  }
  
  // Try to save to Firebase with timeout (don't wait too long) - do this async without blocking
  // Start Firebase save in background, but don't wait for it
  const firebaseSavePromise = (async () => {
    try {
      const firebasePromise = (async () => {
        const productsRef = collection(db, 'products');
        const docRef = await addDoc(productsRef, productToAdd);
        return docRef.id;
      })();
      
      // Add timeout to Firebase operation (3 seconds - faster timeout)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase save timeout')), 3000)
      );
      
      // Race between Firebase and timeout
      const firebaseId = await Promise.race([firebasePromise, timeoutPromise]) as string;
      
      // If Firebase succeeded, update local product with Firebase ID
      if (firebaseId) {
        localProduct.id = firebaseId;
        // Update localStorage with Firebase ID
        try {
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          // Find the product by temp ID
          const productIndex = localProducts.findIndex((p: Product) => p.id === tempId);
          if (productIndex !== -1) {
            localProducts[productIndex] = localProduct;
            localStorage.setItem('local_products', JSON.stringify(localProducts));
            console.log('Product ID updated in localStorage with Firebase ID:', firebaseId);
          }
        } catch (updateError) {
          console.warn('Failed to update localStorage with Firebase ID:', updateError);
        }
      }
    } catch (error: any) {
      // Firebase save failed or timed out - that's okay, we already saved locally
      console.warn('Product saved locally only (Firebase unavailable or timed out):', error?.message || error);
      // Don't throw error - just continue with local product
    }
  })();
  
  // Don't wait for Firebase - just return immediately with local product
  // Firebase save will happen in background
  firebaseSavePromise.catch(() => {
    // Already handled in the promise
  });
  
  // Always return success immediately (product is saved locally at minimum)
  return localProduct;
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
      // Try to update in localStorage if it's a local product
      try {
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        const productIndex = localProducts.findIndex((p: Product) => p.id === productId);
        if (productIndex !== -1) {
          localProducts[productIndex] = { ...localProducts[productIndex], ...productData };
          localStorage.setItem('local_products', JSON.stringify(localProducts));
          return localProducts[productIndex];
        }
      } catch (localError) {
        console.warn('Failed to update product in localStorage:', localError);
      }
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
    
    // Also update in localStorage
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      const productIndex = localProducts.findIndex((p: Product) => p.id === productId);
      if (productIndex !== -1) {
        localProducts[productIndex] = { ...localProducts[productIndex], ...productData };
        localStorage.setItem('local_products', JSON.stringify(localProducts));
      }
    } catch (localError) {
      console.warn('Failed to update product in localStorage:', localError);
    }
    
    // Return updated product
    const updatedSnap = await getDoc(productRef);
    return docToProduct(updatedSnap.data()!, updatedSnap.id);
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    // Try to update in localStorage as fallback
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      const productIndex = localProducts.findIndex((p: Product) => p.id === productId);
      if (productIndex !== -1) {
        localProducts[productIndex] = { ...localProducts[productIndex], ...productData };
        localStorage.setItem('local_products', JSON.stringify(localProducts));
        console.warn('Product updated locally due to Firebase error');
        return localProducts[productIndex];
      }
    } catch (localError) {
      console.error('Failed to update product locally:', localError);
    }
    
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
    
    // Fallback to dummy data
    return dummyArtisans.find(a => a.id === id);
  } catch (error) {
    console.error('Error getting artisan by ID:', error);
    // Fallback to dummy data on error
    return dummyArtisans.find(a => a.id === id);
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
      
      // Also save to localStorage
      try {
        const localArtisans = JSON.parse(localStorage.getItem('local_artisans') || '{}');
        localArtisans[artisanId] = { id: artisanId, ...artisanSnap.data(), ...updateData };
        localStorage.setItem('local_artisans', JSON.stringify(localArtisans));
      } catch (localError) {
        console.warn('Failed to save artisan to localStorage:', localError);
      }
      
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
      
      // Also save to localStorage
      try {
        const localArtisans = JSON.parse(localStorage.getItem('local_artisans') || '{}');
        localArtisans[artisanId] = { id: artisanId, ...newArtisan };
        localStorage.setItem('local_artisans', JSON.stringify(localArtisans));
      } catch (localError) {
        console.warn('Failed to save artisan to localStorage:', localError);
      }
      
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
        
        // Also save to localStorage
        try {
          const localArtisans = JSON.parse(localStorage.getItem('local_artisans') || '{}');
          localArtisans[artisanId] = { id: artisanId, ...newArtisan };
          localStorage.setItem('local_artisans', JSON.stringify(localArtisans));
        } catch (localError) {
          console.warn('Failed to save artisan to localStorage:', localError);
        }
        
        return {
          id: artisanId,
          ...newArtisan,
        } as Artisan;
      } catch (createError) {
        console.error('Error creating artisan:', createError);
        
        // Still save locally for MVP
        const localArtisan = {
          id: artisanId,
          name: artisanData.name || 'Unnamed Artisan',
          region: artisanData.region || '',
          bio: artisanData.bio || '',
          story: artisanData.story || '',
          image: artisanData.image || '',
        };
        
        try {
          const localArtisans = JSON.parse(localStorage.getItem('local_artisans') || '{}');
          localArtisans[artisanId] = localArtisan;
          localStorage.setItem('local_artisans', JSON.stringify(localArtisans));
          console.warn('Artisan saved locally due to Firebase error');
          return localArtisan as Artisan;
        } catch (localError) {
          return undefined;
        }
      }
    }
    
    console.error('Error updating artisan:', error);
    
    // Save locally as fallback
    try {
      const localArtisans = JSON.parse(localStorage.getItem('local_artisans') || '{}');
      const existing = localArtisans[artisanId] || { id: artisanId };
      localArtisans[artisanId] = { ...existing, ...artisanData };
      localStorage.setItem('local_artisans', JSON.stringify(localArtisans));
      console.warn('Artisan saved locally due to Firebase error');
      return localArtisans[artisanId] as Artisan;
    } catch (localError) {
      return undefined;
    }
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
 * Create an activity event (like or order)
 */
export const createActivity = async (
  type: 'like' | 'order',
  artisanId: string,
  productId: string,
  productTitle: string
): Promise<void> => {
  const activity: ActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    artisanId,
    productTitle,
    timestamp: String(Date.now()),
  };
  
  // Save to localStorage immediately
  try {
    const activities = JSON.parse(localStorage.getItem('local_activities') || '[]');
    activities.push(activity);
    // Keep only last 50 activities per artisan to avoid localStorage bloat
    const artisanActivities = activities
      .filter((a: ActivityEvent) => a.artisanId === artisanId)
      .sort((a: ActivityEvent, b: ActivityEvent) => {
        const aTime = parseInt(a.timestamp) || 0;
        const bTime = parseInt(b.timestamp) || 0;
        return bTime - aTime;
      })
      .slice(0, 50);
    
    // Merge with other artisans' activities
    const otherActivities = activities.filter((a: ActivityEvent) => a.artisanId !== artisanId);
    const allActivities = [...otherActivities, ...artisanActivities];
    localStorage.setItem('local_activities', JSON.stringify(allActivities));
    console.log('Activity saved to localStorage:', activity);
    
    // Dispatch event to notify activity feed
    window.dispatchEvent(new CustomEvent('activityAdded', { detail: activity }));
  } catch (error) {
    console.error('Failed to save activity to localStorage:', error);
  }
  
  // Try to save to Firebase in background
  try {
    const activitiesRef = collection(db, 'activities');
    await addDoc(activitiesRef, {
      type,
      artisanId,
      productId,
      productTitle,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    console.log('Activity saved to Firebase');
  } catch (error: any) {
    console.warn('Failed to save activity to Firebase:', error?.message || error);
    // That's okay, it's saved locally
  }
};

/**
 * Get activity events for an artisan
 */
export const getActivityByArtisanId = async (artisanId: string): Promise<ActivityEvent[]> => {
  let activities: ActivityEvent[] = [];
  
  // First, load from localStorage
  try {
    const localActivitiesData = localStorage.getItem('local_activities');
    if (localActivitiesData) {
      const localActivities = JSON.parse(localActivitiesData);
      if (Array.isArray(localActivities)) {
        const artisanActivities = localActivities
          .filter((a: ActivityEvent) => a.artisanId === artisanId)
          .sort((a: ActivityEvent, b: ActivityEvent) => {
            const aTime = parseInt(a.timestamp) || 0;
            const bTime = parseInt(b.timestamp) || 0;
            return bTime - aTime; // Most recent first
          });
        activities = [...artisanActivities];
        console.log(`Loaded ${activities.length} activities from localStorage for artisan ${artisanId}`);
      }
    }
  } catch (localError) {
    console.warn('Failed to load local activities:', localError);
  }
  
  // Try to load from Firebase (may fail or timeout)
  try {
    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('artisanId', '==', artisanId), orderBy('timestamp', 'desc'));
    
    // Try with timeout
    const firebasePromise = getDocs(q);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase query timeout')), 3000)
    );
    
    const querySnapshot = await Promise.race([firebasePromise, timeoutPromise]) as any;
    
    // Merge Firebase activities (avoid duplicates)
    const existingIds = new Set(activities.map(a => a.id));
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      const timestamp = convertTimestamp(data.timestamp) || Date.now();
      const activity: ActivityEvent = {
        id: doc.id,
        artisanId: data.artisanId,
        type: data.type,
        productTitle: data.productTitle || 'Product',
        timestamp: typeof timestamp === 'number' ? String(timestamp) : String(Date.now()),
      };
      
      if (!existingIds.has(activity.id)) {
        activities.push(activity);
        existingIds.add(activity.id);
      }
    });
    
    // Sort by timestamp (most recent first)
    activities.sort((a, b) => {
      const aTime = parseInt(a.timestamp) || 0;
      const bTime = parseInt(b.timestamp) || 0;
      return bTime - aTime;
    });
    
    console.log(`Loaded activities from Firebase, total now: ${activities.length}`);
  } catch (error: any) {
    console.warn('Firebase query failed or timed out, using local activities:', error?.message || error);
  }
  
  // Fallback to dummy data if no activities at all
  if (activities.length === 0) {
    console.warn('No activities found, using dummy data');
    // If artisanId contains 'artisan' or matches mock data, show those
    // Otherwise, create generic activities for this artisan
    const hasMatchingMock = mockActivity.some(a => a.artisanId === artisanId);
    if (hasMatchingMock) {
      return mockActivity.filter(a => a.artisanId === artisanId);
    }
    // Create some generic activities for any artisan
    const now = Date.now();
    const dummyActivities: ActivityEvent[] = [
      {
        id: 'act-dummy-1',
        type: 'like',
        productTitle: 'Hand-Block Printed Scarf',
        timestamp: String(now - 2 * 60 * 60 * 1000), // 2 hours ago
        artisanId: artisanId,
      },
      {
        id: 'act-dummy-2',
        type: 'order',
        productTitle: 'Terracotta Clay Pot',
        timestamp: String(now - 5 * 60 * 60 * 1000), // 5 hours ago
        artisanId: artisanId,
      },
      {
        id: 'act-dummy-3',
        type: 'like',
        productTitle: 'Madhubani Painted Wall Art',
        timestamp: String(now - 24 * 60 * 60 * 1000), // 1 day ago
        artisanId: artisanId,
      },
    ];
    return dummyActivities;
  }
  
  return activities;
};
