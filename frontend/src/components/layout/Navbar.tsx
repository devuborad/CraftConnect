import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../services/mockData';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { ModalPortal } from '../common/ModalPortal';
import { 
  Globe, 
  ShoppingBag, 
  ShoppingCart,
  LayoutDashboard, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut,
  User,
  BarChart3,
  Shield,
  Home,
  Store,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, role, language, setLanguage, setRole, cartCount, t, userName } = useApp();
  const [showLangModal, setShowLangModal] = useState(false);
  useBodyScrollLock(showLangModal);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[2];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-3 z-40 px-4 sm:px-6 lg:px-8 transition-all pointer-events-none">
        <div className="max-w-7xl mx-auto glass-nav rounded-2xl sm:rounded-full px-4 sm:px-7 h-16 sm:h-18 flex items-center justify-between pointer-events-auto transition-all shadow-xl hover:bg-white/30">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <img 
              src="/logo.png" 
              alt="CraftConnect" 
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation Links (Aesthetic Glassy Pill Segmented Bar) */}
          <div className="hidden md:flex items-center space-x-2">
            <nav className="p-1.5 rounded-full bg-white/40 backdrop-blur-xl border border-white/70 shadow-xs flex items-center space-x-1 text-xs font-semibold">
              <Link 
                to="/" 
                className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-white text-[#C85A32] shadow-sm font-bold border border-amber-900/10' 
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('nav.home')}</span>
              </Link>

              <Link 
                to="/marketplace" 
                className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                  isActive('/marketplace') 
                    ? 'bg-white text-[#C85A32] shadow-sm font-bold border border-amber-900/10' 
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('nav.marketplace')}</span>
              </Link>

              {role !== 'BUYER' && (
                <Link 
                  to="/about" 
                  className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                    isActive('/about') 
                      ? 'bg-white text-[#C85A32] shadow-sm font-bold border border-amber-900/10' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('nav.howItWorks')}</span>
                </Link>
              )}

              {role === 'ARTISAN' && (
                <Link 
                  to="/artisan/dashboard" 
                  className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                    isActive('/artisan/dashboard') 
                      ? 'bg-white text-[#C85A32] shadow-sm font-bold border border-amber-900/10' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t('nav.artisanDashboard')}</span>
                </Link>
              )}

              {role === 'BUYER' && (
                <>
                  <Link 
                    to="/buyer/dashboard" 
                    className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                      isActive('/buyer/dashboard') 
                        ? 'bg-white text-[#C85A32] shadow-sm font-bold border border-amber-900/10' 
                        : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('nav.buyerDashboard')}</span>
                  </Link>
                  <Link 
                    to="/buyer/profile" 
                    className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                      isActive('/buyer/profile') 
                        ? 'bg-white text-[#C85A32] shadow-sm font-bold border border-amber-900/10' 
                        : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>
                </>
              )}

              {role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={`px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 ${
                    isActive('/admin') 
                      ? 'bg-stone-900 text-white shadow-sm font-bold' 
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t('nav.adminPanel')}</span>
                </Link>
              )}
            </nav>

            {role === 'ARTISAN' && (
              <Link 
                to="/artisan/products/new" 
                className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all transform active:scale-95 ml-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('nav.addProduct')}</span>
              </Link>
            )}
          </div>

          {/* Right Action Tools (Cart Button for Buyers, Live Notifications, Language, Role Badge) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Live Notifications Bell Icon */}
            <NotificationDropdown />

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

            {/* Role Badge & Live User Profile Link */}
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
              <div className="flex items-center space-x-2 bg-stone-100 p-1 pr-2 rounded-2xl border border-stone-200">
                <Link
                  to={role === 'ARTISAN' ? '/artisan/profile' : role === 'BUYER' ? '/buyer/dashboard' : '/admin'}
                  className="flex items-center space-x-1.5 hover:opacity-85 transition-opacity"
                  title="Click to view & edit your profile"
                >
                  <img
                    src={currentUser?.avatar || currentUser?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                    alt={userName}
                    className="w-7 h-7 rounded-xl object-cover border border-amber-300 shadow-xs"
                  />
                  <span className="text-[11px] font-extrabold text-[#4A2E1B] max-w-[90px] truncate hidden lg:inline">
                    {currentUser?.name || userName}
                  </span>
                </Link>

                <span className="text-[10px] font-extrabold text-[#4A2E1B] px-2 py-0.5 rounded-lg bg-white shadow-xs hidden sm:inline">
                  {role === 'BUYER' && 'Buyer'}
                  {role === 'ARTISAN' && 'Artisan'}
                  {role === 'ADMIN' && 'Admin'}
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

          {/* Mobile hamburger menu toggle & Notification Icon */}
          <div className="flex md:hidden items-center space-x-2">
            <NotificationDropdown />
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
        <div className="md:hidden glass-card fixed inset-x-4 top-22 z-40 p-5 space-y-4 rounded-3xl border border-stone-200/80 shadow-2xl ios-scale-in origin-top">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-stone-800 py-1 hover:text-[#C85A32] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-stone-800 py-1 hover:text-[#C85A32] transition-colors"
          >
            Marketplace
          </Link>
          {role !== 'BUYER' && (
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-stone-800 py-1 hover:text-[#C85A32] transition-colors"
            >
              How It Works
            </Link>
          )}
          {role === 'BUYER' && (
            <>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#C85A32] py-1"
              >
                My Cart ({cartCount})
              </Link>
              <Link
                to="/buyer/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-stone-800 py-1 hover:text-[#C85A32] transition-colors"
              >
                My Profile
              </Link>
            </>
          )}

          {role === 'ARTISAN' && (
            <div className="pt-2 border-t border-stone-200/80 space-y-2">
              <Link
                to="/artisan/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-sm font-semibold text-[#4A2E1B]"
              >
                <BarChart3 className="w-4 h-4 text-[#C85A32]" />
                <span>Artisan Dashboard</span>
              </Link>
              <Link
                to="/artisan/products/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-[#C85A32] text-white py-2.5 rounded-xl font-semibold text-sm shadow-md active:scale-95 transition-transform"
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
                className="flex items-center space-x-2 text-sm font-semibold text-[#4A2E1B]"
              >
                <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
                <span>Buyer Dashboard</span>
              </Link>
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="pt-2 border-t border-stone-200/80">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-sm font-semibold text-stone-900"
              >
                <Shield className="w-4 h-4 text-[#C85A32]" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <ModalPortal>
          <div 
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] flex items-center justify-center p-3 sm:p-6 bg-stone-900/30 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLangModal(false);
            }}
          >
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-900/10 overscroll-contain animate-in zoom-in-95 duration-200 my-auto">
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
        </ModalPortal>
      )}
    </>
  );
};
