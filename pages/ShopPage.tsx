import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { getAllProducts, type ProductFilters } from '../services/firestoreService';
import type { Product } from '../types';
import BackButton from '../components/BackButton';
import VoiceSearch from '../components/VoiceSearch';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(6);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000); // Start with higher default
  const [priceRange, setPriceRange] = useState(10000); // Start with higher default

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Don't apply filters in getAllProducts - we'll filter client-side for better control
      // This ensures local products are always included
      const fetchedProducts = await getAllProducts();
      console.log('Shop page loaded products (before filtering):', fetchedProducts.length, fetchedProducts);
      setProducts(fetchedProducts);
      
      // Update maxPrice based on actual products
      if (fetchedProducts.length > 0) {
        const newMax = Math.max(...fetchedProducts.map(p => p.price || 0));
        const roundedMax = Math.ceil(newMax / 10) * 10; // Round up to nearest 10
        if (roundedMax > maxPrice) {
          setMaxPrice(roundedMax);
          // Only update priceRange if it's still at the old max
          if (priceRange === maxPrice || priceRange < roundedMax) {
            setPriceRange(roundedMax);
          }
        }
      }
      setLoading(false);
    };
    fetchProducts();
    
    // Listen for storage events to refresh when products are added in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'local_products') {
        fetchProducts();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event when product is saved in same tab
    const handleProductSaved = () => {
      fetchProducts();
    };
    window.addEventListener('productSaved', handleProductSaved);
    
    // Poll localStorage periodically to catch products added in same tab (as fallback)
    let lastProductCount = JSON.parse(localStorage.getItem('local_products') || '[]').length;
    const interval = setInterval(() => {
      const currentCount = JSON.parse(localStorage.getItem('local_products') || '[]').length;
      if (currentCount > lastProductCount) {
        lastProductCount = currentCount;
        fetchProducts();
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('productSaved', handleProductSaved);
      clearInterval(interval);
    };
  }, [category, region, priceRange, searchTerm]);

  const handleVoiceSearch = (query: string) => {
      const lowerQuery = query.toLowerCase();
      
      // Reset filters first
      setSearchTerm('');
      setCategory('All');
      setRegion('All');
      setPriceRange(maxPrice);
      
      // Parse price
      const priceMatch = lowerQuery.match(/(?:under|less than|below)\s*₹?(\d+)/);
      if (priceMatch && priceMatch[1]) {
          const price = parseInt(priceMatch[1], 10);
          setPriceRange(Math.min(price, maxPrice));
      }
      
      // Parse keywords for search term
      let keywords = lowerQuery;
      if (priceMatch) {
          keywords = keywords.replace(priceMatch[0], ''); // remove the price part
      }
      keywords = keywords.replace(/show me|find|search for|paintings/g, '').trim();
      setSearchTerm(keywords);
  };
  
  const filteredProducts = products
    .filter(p => {
      // Search filter - only apply if search term exists
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (p.title && p.title.toLowerCase().includes(searchLower)) || 
          (p.description && p.description.toLowerCase().includes(searchLower)) ||
          (p.category && p.category.toLowerCase().includes(searchLower)) ||
          (p.artisanName && p.artisanName.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      return true;
    })
    .filter(p => {
      // Category filter
      if (category !== "All") {
        return p.category && p.category === category;
      }
      return true;
    })
    .filter(p => {
      // Region filter
      if (region !== "All") {
        return p.region && p.region === region;
      }
      return true;
    })
    .filter(p => {
      // Price filter
      const price = p.price || 0;
      return price <= priceRange;
    });
  
  console.log('Filtered products:', filteredProducts.length, 'out of', products.length, {
    category,
    region,
    priceRange,
    searchTerm,
    filters: {
      category: category !== 'All',
      region: region !== 'All',
      priceRange,
      searchTerm: searchTerm.trim()
    }
  });

  const loadMore = () => {
    setVisibleProducts(prev => prev + 6);
  };
  
  const uniqueCategories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const uniqueRegions = ["All", ...Array.from(new Set(products.map(p => p.region)))];

  return (
    <div className="container mx-auto px-6 py-12">
      <BackButton />
      <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-secondary">Our Collection</h1>
          <p className="text-lg text-text-secondary mt-2">Discover handcrafted treasures from across India.</p>
      </div>
      <div className="mb-8 flex justify-center">
          <VoiceSearch onSearch={handleVoiceSearch} />
      </div>
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <div className="bg-surface p-6 rounded-lg shadow-md sticky top-28">
            <h3 className="text-2xl font-heading font-bold text-secondary mb-6">Filters</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-text-primary">Search</label>
                <input type="text" id="search" placeholder="Search for crafts..." value={searchTerm} aria-label="Search by product name" className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-primary">Category</label>
                <select id="category" value={category} aria-label="Filter by category" className="mt-1 block w-full border border-gray-600 bg-secondary text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" onChange={e => setCategory(e.target.value)}>
                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-text-primary">Region</label>
                <select id="region" value={region} aria-label="Filter by region" className="mt-1 block w-full border border-gray-600 bg-secondary text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" onChange={e => setRegion(e.target.value)}>
                  {uniqueRegions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-text-primary">Price</label>
                <input type="range" id="price" min="0" max={maxPrice} step="10" value={priceRange} aria-label={`Filter by price, up to ₹${priceRange}`} className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" onChange={e => setPriceRange(Number(e.target.value))} />
                <div className="flex justify-between text-sm text-text-secondary mt-1">
                  <span>₹0</span>
                  <span>₹{priceRange}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:w-3/4">
          {loading ? <Spinner /> : (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.slice(0, visibleProducts).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-bold text-secondary">No Products Found</h3>
                    <p className="text-text-secondary mt-2">Try adjusting your filters.</p>
                </div>
              )}
              {visibleProducts < filteredProducts.length && (
                <div className="text-center mt-12">
                  <button onClick={loadMore} className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors">
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopPage;