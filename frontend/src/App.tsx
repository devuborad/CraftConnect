import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CraftMateAssistant } from './components/ai/CraftMateAssistant';
import { Toast } from './components/common/Toast';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ArtisanProfilePage } from './pages/ArtisanProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LanguagePage } from './pages/LanguagePage';
import { ArtisanDashboardPage } from './pages/ArtisanDashboardPage';
import { ArtisanAnalyticsPage } from './pages/ArtisanAnalyticsPage';
import { ArtisanCatalogueAnalyticsPage } from './pages/ArtisanCatalogueAnalyticsPage';
import { AddProductWizardPage } from './pages/AddProductWizardPage';
import { ArtisanInquiriesPage } from './pages/ArtisanInquiriesPage';
import { ArtisanOrdersPage } from './pages/ArtisanOrdersPage';
import { ArtisanHistoryPage } from './pages/ArtisanHistoryPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerProfilePage } from './pages/BuyerProfilePage';
import { CartPage } from './pages/CartPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Smooth Scroll to Top on every page navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Animated Route Switcher with iOS Page Transition Physics
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="ios-fade-up">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/artisan/:id" element={<ArtisanProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/language" element={<LanguagePage />} />
        
        {/* Artisan Routes */}
        <Route path="/artisan/dashboard" element={<ArtisanDashboardPage />} />
        <Route path="/artisan/analytics" element={<ArtisanAnalyticsPage />} />
        <Route path="/artisan/catalogue-analytics" element={<ArtisanCatalogueAnalyticsPage />} />
        <Route path="/artisan/profile" element={<ArtisanProfilePage />} />
        <Route path="/artisan/products" element={<ArtisanDashboardPage />} />
        <Route path="/artisan/products/new" element={<AddProductWizardPage />} />
        <Route path="/artisan/inquiries" element={<ArtisanInquiriesPage />} />
        <Route path="/artisan/orders" element={<ArtisanOrdersPage />} />
        <Route path="/artisan/history" element={<ArtisanHistoryPage />} />
        
        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={<BuyerDashboardPage />} />
        <Route path="/buyer/profile" element={<BuyerProfilePage />} />
        <Route path="/buyer/cart" element={<CartPage />} />
        <Route path="/buyer/inquiries" element={<BuyerDashboardPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/*" element={<AdminDashboardPage />} />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans bg-[#FAF7F2] text-stone-950 antialiased selection:bg-amber-200 selection:text-amber-900">
          <Navbar />
          <Toast />

          <main className="flex-1">
            <AnimatedRoutes />
          </main>

          <CraftMateAssistant />
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
