import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import CartDrawer from './CartDrawer';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const ShoppingBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);


const Header: React.FC = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t } = useLanguage();

  const navLinkClasses = "text-text-primary hover:text-primary transition-colors duration-300";

  return (
    <>
      <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <NavLink to="/" className="text-3xl font-heading font-bold text-secondary">
            KalaSetu
          </NavLink>
          <div className="hidden md:flex items-center space-x-8 font-medium">
            <NavLink to="/" className={({isActive}) => isActive ? navLinkClasses + ' text-primary' : navLinkClasses} >{t('home')}</NavLink>
            <NavLink to="/shop" className={({isActive}) => isActive ? navLinkClasses + ' text-primary' : navLinkClasses}>{t('shop')}</NavLink>
            <NavLink to="/for-artisans" className={({isActive}) => isActive ? navLinkClasses + ' text-primary' : navLinkClasses}>{t('forArtisans')}</NavLink>
            <NavLink to="/about" className={({isActive}) => isActive ? navLinkClasses + ' text-primary' : navLinkClasses}>{t('aboutUs')}</NavLink>
            {user && user.role === 'artisan' && (
                <NavLink to="/profile" className={({isActive}) => isActive ? navLinkClasses + ' text-primary' : navLinkClasses}>{t('myProfile')}</NavLink>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <NavLink to="/favorites" className="relative text-text-primary hover:text-primary transition-colors duration-300" aria-label={`View favorites, ${favoritesCount} items`}>
              <HeartIcon />
              {favoritesCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-hidden="true">{favoritesCount}</span>}
            </NavLink>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-text-primary hover:text-primary transition-colors duration-300"
              aria-label={`Open shopping cart, ${cartCount} items`}
            >
               <ShoppingBagIcon />
               {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-hidden="true">{cartCount}</span>}
            </button>
            <NavLink to={user ? "/profile" : "/login"} className="text-text-primary hover:text-primary transition-colors duration-300" aria-label={user ? 'View user profile' : 'Login'}>
              <UserIcon />
            </NavLink>
          </div>
        </nav>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;