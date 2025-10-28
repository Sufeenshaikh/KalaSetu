import type { Product, Artisan } from '../types';
// By using a TypeScript file, we gain better type-safety and editor support.
import { products as productsData } from '../data/products';
import { artisans } from '../data/dummyData';
import type { ActivityEvent } from '../data/activityFeed';
import { mockActivity } from '../data/activityFeed';

// Create a mutable, shallow copy of products for this session's mock API.
// This prevents mutations from affecting the original module data.
const products: Product[] = [...productsData];

// Simulating an async API call
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getFeaturedProducts = async (): Promise<Product[]> => {
  await delay(500);
  return products.slice(0, 6);
};

export const getAllProducts = async (): Promise<Product[]> => {
    await delay(500);
    return products;
}

export const getProductById = async (id: string): Promise<Product | undefined> => {
  await delay(500);
  return products.find(p => p.id === id);
};

export const getProductsByArtisanId = async (artisanId: string): Promise<Product[]> => {
    await delay(500);
    return products.filter(p => p.artisanId === artisanId);
};

export const addProduct = async (productData: Omit<Product, 'id' | 'artisanName'>): Promise<Product> => {
    await delay(500);
    const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...productData,
        artisanName: artisans.find(a => a.id === productData.artisanId)?.name || 'Unknown Artisan',
        images: productData.images.length > 0 ? productData.images : ['https://picsum.photos/seed/newcraft/600/600'], // Add a default image if none are provided
    };
    products.unshift(newProduct); // Add to the beginning of the array for immediate visibility
    return newProduct;
}

export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id'| 'artisanId' | 'artisanName'>>): Promise<Product | undefined> => {
    await delay(500);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        products[productIndex] = { ...products[productIndex], ...productData };
        return products[productIndex];
    }
    return undefined;
}

export const deleteProduct = async (productId: string): Promise<void> => {
    await delay(500);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        products.splice(productIndex, 1);
    }
}


export const getArtisanById = async (id:string): Promise<Artisan | undefined> => {
    await delay(500);
    return artisans.find(a => a.id === id);
}

export const updateArtisan = async (artisanId: string, artisanData: Partial<Omit<Artisan, 'id'>>): Promise<Artisan | undefined> => {
    await delay(500);
    const artisanIndex = artisans.findIndex(a => a.id === artisanId);
    if (artisanIndex > -1) {
        // Update existing artisan
        const updatedArtisan = { ...artisans[artisanIndex], ...artisanData };
        artisans[artisanIndex] = updatedArtisan;
        return updatedArtisan;
    } else {
        // Create new artisan if not found
        const newArtisan: Artisan = {
            id: artisanId,
            name: artisanData.name || 'Unnamed Artisan',
            region: artisanData.region || '',
            bio: artisanData.bio || '',
            story: artisanData.story || '',
            image: artisanData.image || '',
        };
        artisans.push(newArtisan);
        return newArtisan;
    }
};

export const getFeaturedArtisan = async (): Promise<Artisan | undefined> => {
  await delay(500);
  return artisans[0];
};

export const getActivityByArtisanId = async (artisanId: string): Promise<ActivityEvent[]> => {
    await delay(500);
    return mockActivity.filter(a => a.artisanId === artisanId);
};