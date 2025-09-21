import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';
import { getProductById, getArtisanById } from '../services/firestoreService';
import type { Product, Artisan, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import StarRating from '../components/StarRating';

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-colors duration-300 ${filled ? 'text-red-500 fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [displayStory, setDisplayStory] = useState('');

  // State for reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedProduct = await getProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setMainImage(fetchedProduct.images?.[0] || 'https://via.placeholder.com/600');
          const fetchedArtisan = await getArtisanById(fetchedProduct.artisanId);
          if (fetchedArtisan) {
              setArtisan(fetchedArtisan);
              setDisplayStory(fetchedArtisan.story);
          }
          // Load reviews from localStorage
          const storedReviews = localStorage.getItem(`reviews_${id}`);
          if (storedReviews) {
              setReviews(JSON.parse(storedReviews));
          }
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  
  const handleReviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;
      if (newReviewRating === 0 || newReviewText.trim() === '') {
          setReviewError('Please provide a rating and a review text.');
          return;
      }
      
      const newReview: Review = {
          id: `rev-${Date.now()}`,
          productId: product.id,
          author: 'Anonymous User', // Using a placeholder as auth is mocked
          rating: newReviewRating,
          text: newReviewText,
          timestamp: Date.now(),
      };

      const updatedReviews = [...reviews, newReview].sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updatedReviews));
      setReviews(updatedReviews);
      
      // Reset form
      setNewReviewText('');
      setNewReviewRating(0);
      setReviewError('');
  };


  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!product) return <div className="text-center py-20 text-2xl">Product not found.</div>;
  
  const isLiked = isFavorite(product.id);

  return (
    <>
      <div className="container mx-auto px-6 py-12">
        <BackButton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-surface rounded-lg shadow-lg overflow-hidden mb-4">
              <img src={mainImage} alt={`Main view of ${product.title}`} className="w-full h-[500px] object-cover" />
            </div>
            <div className="flex space-x-4">
              {product.images.map((img, index) => (
                <button key={index} onClick={() => setMainImage(img)} aria-label={`View image ${index + 1} of ${product.title}`} className={`w-24 h-24 rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} alt={`Thumbnail ${index + 1} for ${product.title}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary">{product.title}</h1>
            <div className="flex items-center justify-between mt-2">
              {artisan && (
                  <Link to="#" className="text-lg text-text-secondary hover:text-primary transition-colors block">by {artisan.name}</Link>
              )}
              <span className="text-md text-text-secondary flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {product.likes} Likes
              </span>
            </div>
            <p className="text-4xl text-primary font-bold my-6">₹{product.price}</p>
            <div className="flex flex-col">
              <div className="flex items-center space-x-4">
                <Button onClick={() => addToCart(product)} className="w-full md:w-auto text-lg" aria-label={`Add ${product.title} to cart`}>Add to Cart</Button>
                <Button variant="outline" onClick={() => toggleFavorite(product.id)} className="w-full md:w-auto text-lg flex items-center justify-center" aria-label={isLiked ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}>
                  <HeartIcon filled={isLiked} />
                  {isLiked ? 'Favorited' : 'Favorite'}
                </Button>
              </div>
            </div>
            
            <div className="mt-12 space-y-8">
              <div>
                  <h3 className="text-2xl font-heading font-bold text-secondary border-b-2 border-accent pb-2 mb-4">About the Craft</h3>
                  <p className="text-text-secondary leading-relaxed">{product.description}</p>
              </div>
              {artisan && (
              <div>
                  <div className="border-b-2 border-accent pb-2 mb-4">
                      <h3 className="text-2xl font-heading font-bold text-secondary">The Story from the Creator</h3>
                  </div>
                  <p className="text-text-secondary leading-relaxed">{displayStory}</p>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 pt-12 border-t border-accent/30">
            <h3 className="text-3xl font-heading font-bold text-secondary mb-8">Customer Reviews</h3>
            
            {/* Review Submission Form */}
            <div className="bg-surface p-8 rounded-lg shadow-md mb-12">
                <h4 className="text-2xl font-heading font-bold text-secondary mb-4">Write a Review</h4>
                <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                        <label id="rating-label" className="block text-sm font-medium text-text-primary mb-2">Your Rating</label>
                        <StarRating rating={newReviewRating} onRatingChange={setNewReviewRating} />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="review-text" className="block text-sm font-medium text-text-primary mb-2">Your Review</label>
                        <textarea
                            id="review-text"
                            rows={4}
                            className="w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary focus:border-primary"
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            aria-label="Your review text"
                        ></textarea>
                    </div>
                    {reviewError && <p className="text-red-500 text-sm mb-4">{reviewError}</p>}
                    <Button type="submit">Submit Review</Button>
                </form>
            </div>

            {/* Display Existing Reviews */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-text-primary">{review.author}</p>
                              <StarRating rating={review.rating} readOnly />
                            </div>
                            <p className="text-sm text-text-secondary mb-3">
                                {new Date(review.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-text-secondary leading-relaxed">{review.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-text-secondary py-6 text-center">No reviews yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;