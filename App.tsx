import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ExplorePage from './pages/ExplorePage'; // Import the new ExplorePage
import ProductDetailPage from './pages/ProductDetailPage';
import ForArtisansPage from './pages/ForArtisansPage';
import AboutUsPage from './pages/AboutUsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminBulkDescriptionGenerator from './pages/AdminBulkDescriptionGenerator';
import ArtisanApplicationPage from './pages/ArtisanApplicationPage'; // Import the new page
import ArtisanDashboardPage from './pages/ArtisanDashboardPage'; // Import the new artisan dashboard
import FavoritesPage from './pages/FavoritesPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import ChatbotWidget from './components/ChatbotWidget';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <LanguageProvider>
            <HashRouter>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/explore" element={<ExplorePage />} /> {/* Add the new route */}
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/for-artisans" element={<ForArtisansPage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/artisan-application" element={<ArtisanApplicationPage />} /> {/* Add new route */}
                    <Route path="/artisan-dashboard" element={<ArtisanDashboardPage />} /> {/* New artisan dashboard */}
                    <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
                    <Route path="/admin/bulk-description-generator" element={<AdminBulkDescriptionGenerator />} />
                  </Routes>
                </main>
                <Footer />
                <ChatbotWidget />
              </div>
            </HashRouter>
          </LanguageProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;