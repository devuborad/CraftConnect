import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles, ShoppingCart, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from '../services/mockData';
import { ProductCard } from '../components/marketplace/ProductCard';

export const BuyerDashboardPage: React.FC = () => {
  const { savedProductIds, cartCount, cartSubtotal } = useApp();
  const savedProducts = MOCK_PRODUCTS.filter((p) => savedProductIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="glass-card bg-gradient-to-r from-[#4A2E1B] to-[#C85A32] text-white p-8 rounded-3xl shadow-xl space-y-2">
        <span className="bg-amber-400 text-stone-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
          BOUTIQUE BUYER DASHBOARD
        </span>
        <h1 className="font-display font-extrabold text-3xl text-white">
          Welcome back, Anita 👋
        </h1>
        <p className="text-xs text-amber-100">
          Heritage Craft Boutique • Direct Rural Artisan Sourcing Portal
        </p>
      </div>

      {/* Cart Overview Widget */}
      <div className="glass-card bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Active Sourcing Cart ({cartCount} {cartCount === 1 ? 'Item' : 'Items'})
            </h3>
            <p className="text-xs text-stone-500">
              {cartCount > 0
                ? `Cart Subtotal: ₹${cartSubtotal.toLocaleString('en-IN')} (Direct Artisan Price)`
                : 'Your sourcing basket is currently empty'}
            </p>
          </div>
        </div>

        <Link
          to="/cart"
          className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow transition-all shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>Open Sourcing Cart & Checkout →</span>
        </Link>
      </div>

      {/* Saved Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>Saved Artisan Crafts ({savedProducts.length})</span>
          </h2>
          <Link to="/marketplace" className="text-xs font-bold text-[#C85A32] hover:underline">
            Browse More on Marketplace →
          </Link>
        </div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 text-xs text-stone-500">
            No saved products yet. Explore the marketplace to bookmark authentic Indian crafts!
          </div>
        )}
      </div>

      {/* Recommended Artisans */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#C85A32]" />
          <span>Recommended Master Artisans</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_ARTISANS.slice(0, 3).map((artisan) => (
            <div key={artisan.id} className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{artisan.name}</h4>
                  <p className="text-xs text-stone-500">{artisan.craftType}</p>
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2 italic font-serif">
                "{artisan.story}"
              </p>

              <Link
                to={`/artisan/${artisan.id}`}
                className="w-full bg-[#FAF7F2] hover:bg-stone-200 text-stone-900 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 border border-stone-200"
              >
                <span>View Full Profile & Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
