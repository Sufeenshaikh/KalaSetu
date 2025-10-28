import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getArtisanById } from '../services/firestoreService';
import type { Artisan, Product } from '../types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

// Share Icons
const WhatsAppIcon = () => <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current"><path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.044-.53-.044-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.52-1.29.37-.775.37-1.447.25-1.594-.12-.147-.37-.215-.746-.215z M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 29C8.82 29 3 23.18 3 16S8.82 3 16 3s13 5.82 13 13-5.82 13-13 13z"></path></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path></svg>;


const CheckoutSuccessPage: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/shop');
            return;
        }

        const featuredProduct = cartItems[0];
        setProduct(featuredProduct);

        const fetchArtisanAndClearCart = async () => {
            setLoading(true);
            try {
                const fetchedArtisan = await getArtisanById(featuredProduct.artisanId);
                if (fetchedArtisan) {
                    setArtisan(fetchedArtisan);
                }
            } catch (e) {
                console.error("Failed to fetch artisan:", e);
            } finally {
                setLoading(false);
                clearCart();
            }
        };

        fetchArtisanAndClearCart();
    }, []);

    if (loading) return <div className="py-20"><Spinner /></div>;
    if (!product || !artisan) return <div className="text-center py-20 text-2xl">Could not load order details.</div>;

    const daysOfLivelihood = Number((product.price / 500).toFixed(1));
    const shareText = `I just supported an Indian artisan on KalaSetu! My purchase of a "${product.title}" helped provide livelihood for artisans. You can support them too! #KalaSetu #SupportArtisans #Handmade`;
    const encodedShareText = encodeURIComponent(shareText);
    const appUrl = encodeURIComponent(window.location.origin);

    return (
        <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-secondary">Thank You!</h1>
            <p className="text-lg text-text-secondary mt-2 mb-12">Your order has been placed successfully.</p>
            
            <div className="max-w-4xl mx-auto bg-surface rounded-lg shadow-xl overflow-hidden my-8 flex flex-col md:flex-row">
                {/* Left side: Product Image */}
                <div className="md:w-1/2 bg-gray-100">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/600'} alt={product.title} className="w-full h-full object-cover" />
                </div>

                {/* Right side: Content */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center text-left">
                    <h2 className="text-3xl font-heading font-bold text-secondary">Your Impact</h2>
                    <p className="text-lg text-text-primary mt-4 leading-relaxed">
                        By purchasing the <span className="font-bold">{product.title}</span>, you supported approximately <span className="font-bold text-primary">{daysOfLivelihood} days</span> of livelihood for <span className="font-bold">{artisan.name}</span> from {artisan.region}.
                    </p>

                    {/* Artisan Thumbnail */}
                    <div className="mt-6 flex items-center">
                        <img src={artisan.image} alt={artisan.name} className="w-16 h-16 rounded-full object-cover border-2 border-accent" />
                        <div className="ml-4">
                            <p className="font-bold text-secondary">{artisan.name}</p>
                            <p className="text-sm text-text-secondary">{artisan.region}</p>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="mt-8">
                        <h3 className="font-bold text-secondary text-center">Share Your Support</h3>
                        <div className="flex justify-center space-x-6 mt-4">
                            <a href={`https://wa.me/?text=${encodedShareText}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-500 transition-colors" aria-label="Share your impact on WhatsApp">
                                <WhatsAppIcon />
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedShareText}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Share your impact on Facebook">
                                <FacebookIcon />
                            </a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors" aria-label="Share your impact on Instagram">
                                <InstagramIcon />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Link to="/shop">
                <Button variant="outline">Continue Shopping</Button>
            </Link>
        </div>
    );
};

export default CheckoutSuccessPage;