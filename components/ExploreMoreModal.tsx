
import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../services/firestoreService';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import Spinner from './Spinner';

interface ExploreMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ExploreMoreModal: React.FC<ExploreMoreModalProps> = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent scrolling on the body when the modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLoading(true);
      getAllProducts()
        .then(allProducts => {
          setProducts(allProducts);
          setLoading(false);
        })
        .catch(err => {
            console.error("Failed to fetch all products:", err);
            setLoading(false);
        });
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset body scroll
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-modal-title"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <div 
        className="bg-background rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <header className="p-6 border-b border-accent/30 flex justify-between items-center flex-shrink-0">
          <h2 id="explore-modal-title" className="text-3xl font-heading font-bold text-secondary">Explore All Crafts</h2>
          <button 
            onClick={onClose} 
            className="text-text-secondary hover:text-primary transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExploreMoreModal;
