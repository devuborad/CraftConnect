import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { Heart, Sparkles, MapPin, Eye, ShoppingBag, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RolePromptModal } from '../common/RolePromptModal';
import { BulkInquiryModal } from './BulkInquiryModal';

interface ProductCardProps {
  product: Product;
  onBulkInquiry?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBulkInquiry }) => {
  const { role, savedProductIds, toggleSaveProduct, cartItems, addToCart, updateCartQuantity } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'CART' | 'BULK' | null>(null);
  const [imgError, setImgError] = useState(false);

  const isSaved = savedProductIds.includes(product.id);
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isBuyer = role === 'BUYER';

  const fallbackImage = 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&q=80&w=600';

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBuyer) {
      setPendingAction('CART');
      setShowRoleModal(true);
      return;
    }
    addToCart(product, 1);
  };

  const handleBulkOrderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBuyer) {
      setPendingAction('BULK');
      setShowRoleModal(true);
      return;
    }
    if (onBulkInquiry) {
      onBulkInquiry(product);
    } else {
      setShowBulkModal(true);
    }
  };

  const handleRoleSwitchSuccess = () => {
    if (pendingAction === 'CART') {
      addToCart(product, 1);
    } else if (pendingAction === 'BULK') {
      if (onBulkInquiry) {
        onBulkInquiry(product);
      } else {
        setShowBulkModal(true);
      }
    }
    setPendingAction(null);
  };

  return (
    <>
      <div className="glass-card bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-amber-900/20 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full w-full">
        
        {/* Fixed Height Image Header */}
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100 shrink-0">
          <img
            src={imgError ? fallbackImage : product.originalImage}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* AI Enhanced Badge */}
          {product.isAiEnhanced && (
            <div className="absolute top-3 left-3 bg-amber-900/85 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1 shadow-sm z-10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>AI VERIFIED</span>
            </div>
          )}

          {/* Save/Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveProduct(product.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
              isSaved
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/85 text-stone-600 hover:text-red-500 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Craft'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>

          {/* Craft Type Badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#4A2E1B] text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-900/10 shadow-xs z-10">
            {product.craftType}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            {/* Artisan Avatar & Location */}
            <div className="flex items-center space-x-2.5">
              <img
                src={product.artisanAvatar}
                alt={product.artisanName}
                className="w-7 h-7 rounded-full object-cover border border-amber-300 shrink-0"
              />
              <div className="text-xs overflow-hidden leading-tight">
                <p className="font-semibold text-stone-900 truncate">{product.artisanName}</p>
                <p className="text-[10px] text-stone-500 flex items-center space-x-1 truncate">
                  <MapPin className="w-2.5 h-2.5 text-[#C85A32] shrink-0" />
                  <span className="truncate">{product.artisanLocation}</span>
                </p>
              </div>
            </div>

            {/* Title */}
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#C85A32] transition-colors line-clamp-2 leading-snug">
                {product.title}
              </h3>
            </Link>

            {/* Description preview */}
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {product.descriptionEn}
            </p>
          </div>

          {/* Bottom Area: Two Row Layout for 100% Full Visibility */}
          <div className="pt-3 border-t border-stone-100 space-y-2.5 mt-auto">
            
            {/* Row 1: Direct Artisan Price */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] text-stone-400 uppercase tracking-wider font-bold block leading-none mb-1">
                  DIRECT ARTISAN PRICE
                </span>
                <span className="font-display font-extrabold text-xl text-[#4A2E1B] leading-none">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>

              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                100% Fair Price
              </span>
            </div>

            {/* Row 2: All 3 Action Buttons Placed BELOW (Down) Price Section */}
            <div className="flex items-center space-x-2 w-full pt-1">
              
              {/* Button 1: View Product Details (Eye Icon) */}
              <Link
                to={`/product/${product.id}`}
                className="p-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center justify-center border border-stone-200/80 shrink-0"
                title="View Product Details"
              >
                <Eye className="w-4 h-4" />
              </Link>

              {/* Button 2: Add to Cart (+1 or Quantity Counter) */}
              {inCartQty > 0 ? (
                <div className="flex items-center bg-amber-50 border border-amber-300 rounded-xl p-1 space-x-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateCartQuantity(product.id, inCartQty - 1);
                    }}
                    className="w-6 h-6 rounded-lg bg-white text-stone-700 hover:bg-stone-200 flex items-center justify-center font-bold text-xs shadow-xs"
                    title="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-extrabold text-[#4A2E1B] px-1 min-w-4 text-center">
                    {inCartQty}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product, 1);
                    }}
                    className="w-6 h-6 rounded-lg bg-[#4A2E1B] text-white hover:bg-[#362113] flex items-center justify-center font-bold text-xs shadow-xs"
                    title="Add More (+1)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCartClick}
                  className="px-3 py-2 rounded-xl bg-amber-50 text-[#4A2E1B] hover:bg-[#4A2E1B] hover:text-white border border-amber-200 text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-xs shrink-0"
                  title="Add to Buyer Cart (+1)"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>+1</span>
                </button>
              )}

              {/* Button 3: Bulk Order Button (Terracotta styled, flex-1 for complete visibility) */}
              <button
                onClick={handleBulkOrderClick}
                className="flex-1 bg-[#C85A32] hover:bg-[#b04b27] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-95 whitespace-nowrap min-w-0"
                title="Wholesale Bulk Order Inquiry"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Bulk Order</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Role Switch Prompt Modal */}
      <RolePromptModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSuccess={handleRoleSwitchSuccess}
        actionName="Wholesale Bulk Order Inquiry"
      />

      {/* Internal Bulk Inquiry Modal */}
      {showBulkModal && (
        <BulkInquiryModal
          product={product}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </>
  );
};
