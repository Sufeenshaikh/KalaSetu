import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { getAllProducts } from '../services/firestoreService';
import type { Product } from '../types';
import BackButton from '../components/BackButton';

const ExplorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products for explore page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-12 min-h-screen">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading font-bold text-secondary">Explore All Crafts</h1>
        <p className="text-lg text-text-secondary mt-2">Discover the full collection of handcrafted treasures from across India.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-12 max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search by craft name or region (e.g., 'Scarf' or 'Rajasthan')..."
          className="w-full px-5 py-3 text-lg border-2 border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search for crafts by name or region"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-secondary">No Crafts Found</h3>
              <p className="text-text-secondary mt-2">Your search for "{searchTerm}" did not match any products.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExplorePage;
