import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';
import { getAllProducts } from '../services/firestoreService';
import { useFavorites } from '../context/FavoritesContext';
import type { Product } from '../types';

const FavoritesPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds } = useFavorites();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const products = await getAllProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const favoriteProducts = allProducts.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="container mx-auto px-6 py-12 min-h-screen">
      <BackButton />
      <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-secondary">My Favorites</h1>
          <p className="text-lg text-text-secondary mt-2">Your collection of cherished crafts.</p>
      </div>
      
      {loading ? (
        <Spinner />
      ) : favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoriteProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-secondary">No Favorites Yet</h3>
            <p className="text-text-secondary mt-2">Click the heart on any product to save it here.</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;