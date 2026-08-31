import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../services/mockData';
import { 
  Globe, 
  Sparkles, 
  ShoppingBag, 
  ShoppingCart,
  LayoutDashboard, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, language, setLanguage, setRole, cartCount, t } = useApp();
  const [showLangModal, setShowLangModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[2];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-3 z-40 px-4 sm:px-6 lg:px-8 transition-all pointer-events-none">
        <div className="max-w-7xl mx-auto glass-nav rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between pointer-events-auto transition-all shadow-lg">
          
          {/* Logo Concept: Craft + Thread + Connection */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A2E1B] to-[#C85A32] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <circle cx="12" cy="12" r="3" className="fill-amber-400/30 stroke-amber-300" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-[#4A2E1B]">
                  CraftConnect
                </span>
                <span className="bg-amber-100 text-[#C85A32] border border-amber-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase flex items-center space-x-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI</span>
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide">{t('nav.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-stone-700">
            <Link 
              to="/" 
              className={`hover:text-[#C85A32] transition-colors ${isActive('/') ? 'text-[#C85A32] font-semibold' : ''}`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/marketplace" 
              className={`hover:text-[#C85A32] transition-colors ${isActive('/marketplace') ? 'text-[#C85A32] font-semibold' : ''}`}
            >
              {t('nav.marketplace')}
            </Link>
            <Link 
              to="/about" 
              className={`hover:text-[#C85A32] transition-colors ${isActive('/about') ? 'text-[#C85A32] font-semibold' : ''}`}
            >
              {t('nav.howItWorks')}
            </Link>

            {role === 'ARTISAN' && (
              <>
                <Link 
                  to="/artisan/dashboard" 
                  className={`hover:text-[#C85A32] flex items-center space-x-1.5 ${isActive('/artisan/dashboard') ? 'text-[#C85A32] font-semibold' : ''}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('nav.artisanDashboard')}</span>
                </Link>
                <Link 
                  to="/artisan/products/new" 
                  className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('nav.addProduct')}</span>
                </Link>
              </>
            )}

            {role === 'BUYER' && (
              <Link 
                to="/buyer/dashboard" 
                className={`hover:text-[#C85A32] flex items-center space-x-1.5 ${isActive('/buyer/dashboard') ? 'text-[#C85A32] font-semibold' : ''}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('nav.buyerDashboard')}</span>
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link 
                to="/admin" 
                className="bg-stone-900 text-stone-100 hover:bg-stone-800 px-3.5 py-2 rounded-xl text-xs font-semibold"
              >
                {t('nav.adminPanel')}
              </Link>
            )}
          </nav>

          {/* Right Action Tools (Cart Button for Buyers, Language, Role Badge) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Icon Button - ONLY VISIBLE FOR BUYERS */}
            {role === 'BUYER' && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-stone-700 hover:text-[#C85A32] hover:bg-amber-50 transition-all border border-stone-200/80 bg-white shadow-xs"
                title="View Sourcing Cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#4A2E1B]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C85A32] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Language Selector Pill */}
            <button
              onClick={() => setShowLangModal(true)}
              className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-stone-800 hover:border-[#C85A32] flex items-center space-x-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{activeLangObj.nativeName}</span>
            </button>

            {/* Role Badge & Switcher */}
            {role === 'GUEST' ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-stone-700 hover:text-[#4A2E1B] px-3 py-2"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="bg-[#4A2E1B] hover:bg-[#382213] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  {t('nav.startSelling')}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                <span className="text-[11px] font-extrabold text-[#4A2E1B] px-2.5 py-1 rounded-xl bg-white shadow-xs">
                  {role === 'BUYER' && '🛍️ Buyer Account'}
                  {role === 'ARTISAN' && '🎨 Artisan Account'}
                  {role === 'ADMIN' && '🛡️ Admin Account'}
                </span>

                <button
                  onClick={() => {
                    setRole('GUEST');
                    navigate('/');
                  }}
                  title="Sign out / Switch account"
                  className="text-stone-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setShowLangModal(true)}
              className="glass-pill px-2.5 py-1 rounded-full text-xs font-medium text-stone-700 flex items-center space-x-1"
            >
              <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{activeLangObj.code.toUpperCase()}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-200/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card fixed inset-x-4 top-22 z-40 p-5 space-y-4 rounded-3xl border border-stone-200/80 shadow-2xl animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-stone-800 py-1"
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-stone-800 py-1"
          >
            Marketplace
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-stone-800 py-1"
          >
            How It Works
          </Link>
          {role === 'BUYER' && (
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#C85A32] py-1 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-[#C85A32]" />
                <span>Sourcing Cart</span>
              </span>
              {cartCount > 0 && (
                <span className="bg-[#C85A32] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {role === 'ARTISAN' && (
            <div className="pt-2 border-t border-stone-200/80 space-y-2">
              <Link
                to="/artisan/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-[#4A2E1B]"
              >
                📊 Artisan Dashboard
              </Link>
              <Link
                to="/artisan/products/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-[#C85A32] text-white py-2.5 rounded-xl font-semibold text-sm shadow"
              >
                + Add New Product
              </Link>
            </div>
          )}

          {role === 'BUYER' && (
            <div className="pt-2 border-t border-stone-200/80">
              <Link
                to="/buyer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-[#4A2E1B]"
              >
                🛍️ Buyer Dashboard
              </Link>
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="pt-2 border-t border-stone-200/80">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-stone-900"
              >
                🛡️ Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-900/10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-display font-bold text-lg text-stone-900">Choose Language / ભાષા પસંદ કરો</h3>
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-5">
              Select your preferred language for voice assistant, AI cataloguing, and interface navigation.
            </p>

            <div className="space-y-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangModal(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    language === lang.code
                      ? 'border-[#C85A32] bg-amber-50/60 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-lg text-stone-900">{lang.nativeName}</h4>
                    <p className="text-xs text-stone-500">{lang.name}</p>
                  </div>
                  {language === lang.code && (
                    <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
