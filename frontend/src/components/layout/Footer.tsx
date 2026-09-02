import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { t, role } = useApp();

  return (
    <footer className="bg-[#1C1917] text-stone-300 pt-16 pb-12 border-t border-stone-800 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-900/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block bg-white/95 px-3 py-1.5 rounded-xl shadow-md hover:bg-white transition-all group">
              <img src="/logo.png" alt="CraftConnect" className="h-7 w-auto object-contain group-hover:scale-102 transition-transform" />
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('footer.mission')}
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-400/90 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('footer.voiceBadge')}</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">{t('footer.artisanPlatform')}</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link to="/artisan/products/new" className="hover:text-amber-400 transition-colors">
                  📷 Add Product & AI Studio
                </Link>
              </li>
              <li>
                <Link to="/artisan/dashboard" className="hover:text-amber-400 transition-colors">
                  🎤 Voice Speech-to-Text Catalogue
                </Link>
              </li>
              <li>
                <Link to="/artisan/dashboard" className="hover:text-amber-400 transition-colors">
                  💰 AI Fair Price Assistant
                </Link>
              </li>
              <li>
                <Link to="/language" className="hover:text-amber-400 transition-colors">
                  🌐 Language Selection
                </Link>
              </li>
            </ul>
          </div>

          {/* Buyers & Marketplace */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Buyers & Retailers</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link to="/marketplace" className="hover:text-amber-400 transition-colors">
                  🛍️ Discover Handmade India
                </Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="hover:text-amber-400 transition-colors">
                  📦 Bulk Order Inquiries
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  🤝 Direct Artisan Impact
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors">
                  🛡️ Admin Moderation Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          {role !== 'BUYER' ? (
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
              <span>for Rural Indian Artisans • Hackathon Edition</span>
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1 text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Direct Artisan Payments</span>
            </span>
            <Link to="/about" className="hover:underline">Privacy Policy</Link>
            <Link to="/about" className="hover:underline">Terms of Platform</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
