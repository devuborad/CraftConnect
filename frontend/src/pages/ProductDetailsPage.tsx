import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/products';
import type { Product } from '../types';
import { 
  Sparkles, 
  MapPin, 
  ShoppingBag, 
  ShoppingCart,
  Share2, 
  Heart, 
  Globe, 
  ArrowLeft,
  MessageCircle,
  Zap
} from 'lucide-react';
import { BulkInquiryModal } from '../components/marketplace/BulkInquiryModal';
import { BuyNowModal } from '../components/marketplace/BuyNowModal';
import { RolePromptModal } from '../components/common/RolePromptModal';
import { useApp } from '../context/AppContext';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, showToast, savedProductIds, toggleSaveProduct, cartItems, addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'hi' | 'gu'>('en');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'CART' | 'BULK' | null>(null);

  useEffect(() => {
    if (id) {
      productService.getProductById(id).then((res) => {
        if (res) setProduct(res);
      });
    }
  }, [id]);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-semibold">Loading craft listing...</p>
      </div>
    );
  }

  const isSaved = savedProductIds.includes(product.id);
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'Share this craft product with buyers', 'success');
  };

  const handleRoleSwitchSuccess = () => {
    if (pendingAction === 'CART') {
      addToCart(product, 1);
    } else if (pendingAction === 'BULK') {
      setShowInquiryModal(true);
    }
    setPendingAction(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Link */}
      <Link to="/marketplace" className="inline-flex items-center space-x-1 text-xs font-bold text-stone-600 hover:text-[#C85A32]">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-100">
            <img
              src={product.originalImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.isAiEnhanced && (
              <div className="absolute top-4 left-4 bg-amber-900/85 backdrop-blur text-amber-200 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 flex items-center space-x-1.5 shadow">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI IMAGE STUDIO VERIFIED</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listing & Pricing Details */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full">
                {product.category} • {product.craftType}
              </span>
              <button
                onClick={handleShare}
                className="text-stone-500 hover:text-stone-900 p-2 rounded-full hover:bg-stone-100 transition-colors"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 leading-snug">
              {product.title}
            </h1>

            <p className="text-xs text-stone-500 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Handcrafted in {product.origin}</span>
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Artisan Direct Fair Price</span>
              <span className="font-display font-extrabold text-3xl text-[#4A2E1B]">₹{product.price.toLocaleString('en-IN')}</span>
            </div>

            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                89% AI Fair Pricing Confidence
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  if (role !== 'BUYER') {
                    setPendingAction('CART');
                    setShowRoleModal(true);
                  } else {
                    addToCart(product, 1);
                  }
                }}
                className={`py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 border ${
                  inCartQty > 0
                    ? 'bg-amber-100 text-[#4A2E1B] border-amber-300 font-extrabold'
                    : 'bg-stone-900 hover:bg-black text-white border-transparent'
                }`}
              >
                <ShoppingCart className={`w-4 h-4 ${inCartQty > 0 ? 'text-[#C85A32]' : 'text-amber-300'}`} />
                <span>{inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart (+1)'}</span>
              </button>

              {/* Buy Now Button */}
              <button
                onClick={() => {
                  if (role !== 'BUYER') {
                    setPendingAction('CART');
                    setShowRoleModal(true);
                  } else if (product) {
                    if (inCartQty === 0) {
                      addToCart(product, 1);
                    }
                    navigate('/cart', { state: { autoCheckout: true } });
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 border border-amber-500/40"
              >
                <Zap className="w-4 h-4 fill-stone-950 text-stone-950" />
                <span>Buy Now</span>
              </button>

              {/* Wholesale Bulk Order Button */}
              <button
                onClick={() => {
                  if (role !== 'BUYER') {
                    setPendingAction('BULK');
                    setShowRoleModal(true);
                  } else {
                    setShowInquiryModal(true);
                  }
                }}
                className="bg-[#C85A32] hover:bg-[#b04b27] text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Bulk Order</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/artisan/${product.artisanId}`}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-xl font-semibold text-xs text-center flex items-center justify-center space-x-1.5"
              >
                <MessageCircle className="w-4 h-4 text-[#4A2E1B]" />
                <span>Contact Artisan</span>
              </Link>

              <button
                onClick={() => toggleSaveProduct(product.id)}
                className={`p-3 rounded-xl border transition-all ${
                  isSaved ? 'bg-red-500 text-white border-red-500' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Artisan Card Preview */}
          <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 flex items-center space-x-3">
            <img
              src={product.artisanAvatar}
              alt={product.artisanName}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
            />
            <div className="flex-1">
              <p className="text-xs text-stone-500 font-semibold">Crafted by Master Artisan</p>
              <h4 className="font-bold text-stone-900 text-sm">{product.artisanName}</h4>
              <p className="text-[11px] text-stone-500">{product.artisanLocation}</p>
            </div>
            <Link
              to={`/artisan/${product.artisanId}`}
              className="text-xs text-[#C85A32] font-bold hover:underline"
            >
              View Profile
            </Link>
          </div>

          {/* Multilingual Description Box */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-900">
                <Globe className="w-4 h-4 text-[#C85A32]" />
                <span>Craft Description & Story</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveLangTab('en')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    activeLangTab === 'en' ? 'bg-[#4A2E1B] text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setActiveLangTab('hi')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    activeLangTab === 'hi' ? 'bg-[#4A2E1B] text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  HI
                </button>
                <button
                  onClick={() => setActiveLangTab('gu')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    activeLangTab === 'gu' ? 'bg-[#4A2E1B] text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  GU
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              {activeLangTab === 'en' && product.descriptionEn}
              {activeLangTab === 'hi' && (product.descriptionHi || product.descriptionEn)}
              {activeLangTab === 'gu' && (product.descriptionGu || product.descriptionEn)}
            </p>
          </div>

        </div>
      </div>

      {showInquiryModal && (
        <BulkInquiryModal product={product} onClose={() => setShowInquiryModal(false)} />
      )}

      {showBuyNowModal && (
        <BuyNowModal product={product} onClose={() => setShowBuyNowModal(false)} />
      )}

      <RolePromptModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSuccess={handleRoleSwitchSuccess}
        actionName={pendingAction === 'CART' ? 'Add to Cart (+1)' : 'Wholesale Bulk Order'}
      />
    </div>
  );
};
