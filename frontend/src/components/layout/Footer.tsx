import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Mic, 
  Calculator, 
  Globe, 
  ShoppingBag, 
  Package, 
  HeartHandshake, 
  Shield 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { t, role } = useApp();

  return (
    <footer className="bg-[#181513] text-stone-300 pt-16 pb-12 border-t border-stone-800 relative overflow-hidden">
      {/* Decorative background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-900/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block transition-transform hover:scale-105 group">
              <img 
                src="/logo.png" 
                alt="CraftConnect" 
                className="h-10 sm:h-12 w-auto object-contain brightness-110 drop-shadow-md" 
              />
            </Link>
            <p className="text-sm text-stone-300 leading-relaxed max-w-sm">
              {t('footer.mission')}
            </p>
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-amber-300 bg-stone-900/90 px-3.5 py-2 rounded-xl border border-stone-700/60 shadow-sm w-fit">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('footer.voiceBadge')}</span>
            </div>
          </div>

          {/* Artisan Platform Links */}
          <div>
            <h4 className="font-display font-bold text-white text-base sm:text-lg mb-4 tracking-wide">
              {t('footer.artisanPlatform')}
            </h4>
            <ul className="space-y-3 text-sm text-stone-300">
              <li>
                <Link 
                  to="/artisan/products/new" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Add Product & AI Studio</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/artisan/dashboard" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <Mic className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Voice Speech-to-Text Catalogue</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/artisan/dashboard" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <Calculator className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>AI Fair Price Assistant</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/language" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <Globe className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Language Selection</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Buyers & Retailers */}
          <div>
            <h4 className="font-display font-bold text-white text-base sm:text-lg mb-4 tracking-wide">
              Buyers & Retailers
            </h4>
            <ul className="space-y-3 text-sm text-stone-300">
              <li>
                <Link 
                  to="/marketplace" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Discover Handmade India</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/buyer/dashboard" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <Package className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Bulk Order Inquiries</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Direct Artisan Impact</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-2.5 hover:text-amber-400 transition-colors group"
                >
                  <Shield className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Admin Moderation Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-stone-400 gap-4">
          {role !== 'BUYER' ? (
            <div className="flex items-center space-x-1.5">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 inline shrink-0" />
              <span>for Rural Indian Artisans • Hackathon Edition</span>
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-stone-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Direct Artisan Payments</span>
            </span>
            <Link to="/about" className="hover:underline hover:text-amber-300 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:underline hover:text-amber-300 transition-colors">Terms of Platform</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
