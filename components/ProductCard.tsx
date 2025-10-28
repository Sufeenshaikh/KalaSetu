import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useFavorites } from '../context/FavoritesContext';

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${filled ? 'text-red-500 fill-current' : 'text-white'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block" aria-label={`View details for ${product.title}`}>
        <div className="relative overflow-hidden h-64">
            <img src={product.images?.[0] || 'https://via.placeholder.com/600'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={handleFavoriteClick}
              className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white hover:bg-primary transition-colors duration-300"
              aria-label={isLiked ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
            >
              <HeartIcon filled={isLiked} />
            </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-text-primary truncate" aria-hidden="true">{product.title}</h3>
          <p className="text-sm text-text-secondary mt-1" aria-hidden="true">by {product.artisanName}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-lg font-bold text-primary" aria-hidden="true">₹{product.price}</p>
            <div className="flex items-center text-sm text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span aria-hidden="true">{product.likes}</span>
              <span className="sr-only">{product.likes} likes</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0">
          <Link to={`/product/${product.id}`} className="w-full text-center block bg-secondary text-white py-2 rounded-md hover:bg-opacity-90 transition-colors">
              View Details
          </Link>
      </div>
    </div>
  );
};

export default ProductCard;