import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { AddProductWizardPage } from './pages/AddProductWizardPage';
import { ArtisanInquiriesPage } from './pages/ArtisanInquiriesPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerProfilePage } from './pages/BuyerProfilePage';
import { CartPage } from './pages/CartPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans bg-[#FAF7F2] text-stone-950 antialiased selection:bg-amber-200 selection:text-amber-900">
          <Navbar />
          <Toast />

          <main className="flex-1">
            <Routes>
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
              <Route path="/artisan/products" element={<ArtisanDashboardPage />} />
              <Route path="/artisan/products/new" element={<AddProductWizardPage />} />
              <Route path="/artisan/inquiries" element={<ArtisanInquiriesPage />} />
              
              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<BuyerDashboardPage />} />
              <Route path="/buyer/profile" element={<BuyerProfilePage />} />
              <Route path="/buyer/cart" element={<CartPage />} />
              <Route path="/buyer/inquiries" element={<BuyerDashboardPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/*" element={<AdminDashboardPage />} />
            </Routes>
          </main>

          <CraftMateAssistant />
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
