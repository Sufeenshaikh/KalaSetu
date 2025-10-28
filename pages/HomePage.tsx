import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { getFeaturedProducts, getFeaturedArtisan } from '../services/firestoreService';
import type { Product, Artisan } from '../types';
import ArtisanStoryModal from '../components/ArtisanStoryModal';
import { useLanguage } from '../context/LanguageContext';

const EmpowermentIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-accent/20 text-primary rounded-full h-16 w-16 flex items-center justify-center mb-4">
        {children}
    </div>
);

const RegionCard = ({ name, image }: { name: string; image: string }) => (
    <Link to={`/shop?region=${name}`} className="relative group rounded-lg overflow-hidden shadow-lg h-64 block">
        <img src={image} alt={`Crafts from ${name}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
            <h3 className="text-white text-3xl font-heading font-bold drop-shadow-md">{name}</h3>
        </div>
    </Link>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);


const HomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [loading, setLoading] = useState(true);
    const scrollContainer = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const { t } = useLanguage();

    const regions = [
        { name: 'Rajasthan', image: 'https://digpu.com/wp-content/uploads/2019/02/Fabriclore-Collaborates-With-Hatheli-Sansthan-Empowering-More-Than-350-Women-Artisans-in-Rajasthan.jpg' },
        { name: 'Uttar Pradesh', image: 'https://curlytales.com/wp-content/uploads/2021/08/zfueawcyiy-1516629206-1.jpg' },
        { name: 'Kerala', image: 'https://blogmedia.testbook.com/blog/wp-content/uploads/2023/04/kathakali-papier-mache-masks-d8663174.jpg' },
        { name: 'Karnataka', image: 'https://miradorlife.com/wp-content/uploads/2021/08/header-6.png' },
        { name: 'Gujarat', image: 'https://www.sotc.in/blog/wp-content/uploads/2023/06/Gujarat-market-1.jpg' },
        { name: 'Kashmir', image: 'https://thumbs.dreamstime.com/b/pahalgam-kashmir-india-february-life-kashmir-village-kashmir-valley-near-pahalgam-life-kashmir-village-kashmir-valley-near-224432526.jpg' },
        { name: 'West Bengal', image: 'https://live.staticflickr.com/8392/8536563859_cc65984c25_b.jpg' },
        { name: 'Assam', image: 'https://www.ujudebug.com/wp-content/uploads/2021/07/DQ_LAT0VAAAEnx2.jpeg' },
    ];

    const checkScrollability = () => {
        if (scrollContainer.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
            // Using a tolerance of 1px to avoid floating point issues
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 1);
        }
    };
    
    const scrollRegions = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = scrollContainer.current.clientWidth * 0.8;
            scrollContainer.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [fetchedProducts, fetchedArtisan] = await Promise.all([
                    getFeaturedProducts(),
                    getFeaturedArtisan(),
                ]);
                setProducts(fetchedProducts);
                setArtisan(fetchedArtisan as Artisan);
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const container = scrollContainer.current;
        if (container) {
            checkScrollability();
            container.addEventListener('scroll', checkScrollability);
            window.addEventListener('resize', checkScrollability);

            return () => {
                container.removeEventListener('scroll', checkScrollability);
                window.removeEventListener('resize', checkScrollability);
            };
        }
    }, [loading]);

    return (
        <div className="space-y-24 pb-24">
            {/* Hero Section */}
            <section className="relative h-[95vh] min-h-[800px] flex flex-col justify-center items-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <img src="https://images.pexels.com/photos/15815326/pexels-photo-15815326.jpeg?cs=srgb&dl=pexels-swastikarora-15815326.jpg&fm=jpg" alt="Artisan at work, creating a handcrafted piece" className="absolute inset-0 w-full h-full object-cover " />

                {/* Main Hero Content */}
                <div className="container mx-auto px-6 relative z-20 text-center">
                    <div className="animate-fade-in-up">
                      <h1 className="text-5xl md:text-7xl font-heading font-bold drop-shadow-lg">KalaSetu: A Bridge for India’s Artisans</h1>
                      <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">Connecting heritage craftsmanship with the modern world.</p>
                      <Link to="/explore">
                          <Button className="mt-8 text-lg px-8 py-4">{t('discoverCrafts')}</Button>
                      </Link>
                    </div>
                </div>
                
                {/* Artisan CTA */}
                <div className="absolute bottom-16 left-0 right-0 z-20 px-6 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-md">Are you an artisan?</h3>
                    <p className="mt-2 text-accent text-xl lg:text-2xl drop-shadow">Join our community to reach a global audience.</p>
                    <Link to="/for-artisans" className="mt-6 inline-block">
                        <Button variant="primary" className="text-lg px-8 py-3 transform hover:scale-105 transition-transform">Sell With Us</Button>
                    </Link>
                </div>
            </section>

            {/* Featured Crafts */}
            <section className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-heading font-bold text-secondary">{t('featuredCrafts')}</h2>
                    <p className="text-lg text-text-secondary mt-2">Discover the most popular crafts of the week</p>
                </div>
                {loading ? <Spinner /> : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/explore">
                                <Button variant="outline">
                                    Explore More Crafts
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </section>
            
            {/* Shop by Region */}
            <section className="container mx-auto px-6">
                <h2 className="text-4xl font-heading text-center font-bold text-secondary mb-12">Shop by Region</h2>
                <div className="relative">
                    <button 
                        onClick={() => scrollRegions('left')} 
                        className="absolute top-1/2 -left-4 -translate-y-1/2 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-0 disabled:cursor-not-allowed"
                        aria-label="Scroll left"
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <div ref={scrollContainer} className="flex overflow-x-auto space-x-8 py-4 scroll-smooth scrollbar-hide">
                        {regions.map(region => (
                           <div key={region.name} className="w-72 flex-shrink-0">
                                <RegionCard name={region.name} image={region.image} />
                           </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => scrollRegions('right')} 
                        className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-0 disabled:cursor-not-allowed"
                        aria-label="Scroll right"
                        disabled={!canScrollRight}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </section>

            {/* How We Empower */}
            <section className="bg-surface py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-heading font-bold text-secondary mb-12">How We Empower Artisans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <EmpowermentIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></EmpowermentIcon>
                            <h3 className="text-2xl font-heading font-bold text-secondary mb-2">Fair Price</h3>
                            <p className="text-text-secondary">We ensure artisans are paid fairly for their incredible skill and hard work, fostering economic stability.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <EmpowermentIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.884 5.063l.132.131M16.116 5.063l-.132.131M12 20.944A8.966 8.966 0 0012 21a8.966 8.966 0 000-18.056V2.944a8.966 8.966 0 010 18.056z" /></svg></EmpowermentIcon>
                            <h3 className="text-2xl font-heading font-bold text-secondary mb-2">Global Reach</h3>
                            <p className="text-text-secondary">Our platform provides a global stage for artisans to showcase their craft to a diverse audience.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <EmpowermentIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></EmpowermentIcon>
                            <h3 className="text-2xl font-heading font-bold text-secondary mb-2">Storytelling</h3>
                            <p className="text-text-secondary">We help tell the unique story behind each artisan and their craft, preserving cultural heritage.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Featured Artisan Story */}
            {artisan && (
                <section className="container mx-auto px-6">
                    <div className="bg-surface rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row items-center">
                        <img src={artisan.image} alt={artisan.name} className="w-full md:w-1/3 h-96 object-cover" />
                        <div className="p-8 md:p-12 flex-1">
                            <h3 className="text-sm uppercase text-text-secondary tracking-widest">Featured Artisan</h3>
                            <h2 className="text-4xl font-heading font-bold text-secondary mt-2 mb-4">{artisan.name}</h2>
                            <blockquote className="text-xl text-text-primary italic border-l-4 border-primary pl-4">
                                "{artisan.bio}"
                            </blockquote>
                            <p className="mt-4 text-text-secondary">{artisan.story.substring(0, 150)}...</p>
                            <Button onClick={() => setIsStoryModalOpen(true)} className="mt-6" variant="outline">Read Her Story</Button>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="container mx-auto px-6">
                <div className="bg-accent rounded-lg p-12 text-center text-secondary shadow-lg">
                    <h2 className="text-4xl font-heading font-bold mb-4">Are You an Artisan?</h2>
                    <p className="text-xl mb-6">Join our community and share your craft with the world.</p>
                    <Link to="/for-artisans">
                        <Button variant="secondary">Sell With Us</Button>
                    </Link>
                </div>
            </section>

            <ArtisanStoryModal 
                isOpen={isStoryModalOpen} 
                onClose={() => setIsStoryModalOpen(false)} 
                artisan={artisan} 
            />
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default HomePage;