import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { Heart, Sparkles, MapPin, Eye, ShoppingBag, ShoppingCart, Zap, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { productService } from '../../services/products';
import { RolePromptModal } from '../common/RolePromptModal';
import { BulkInquiryModal } from './BulkInquiryModal';
import { BuyNowModal } from './BuyNowModal';
import { ModalPortal } from '../common/ModalPortal';

interface ProductCardProps {
  product: Product;
  onBulkInquiry?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBulkInquiry }) => {
  const navigate = useNavigate();
  const { role, currentUser, savedProductIds, toggleSaveProduct, cartItems, addToCart, language, t, showToast } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingAction, setPendingAction] = useState<'CART' | 'BULK' | null>(null);
  const [imgError, setImgError] = useState(false);

  const isSaved = savedProductIds.includes(product.id);
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isBuyer = role === 'BUYER';

  const isOwner = Boolean(
    currentUser &&
    (role === 'ARTISAN' || role === 'ADMIN') &&
    (product.artisanId === currentUser.id ||
      (product.artisanId === 'artisan-1' && (currentUser.id === 'user-artisan-1' || currentUser.id === 'artisan-1' || currentUser.id === 'usr-dev-artisan-001')) ||
      (currentUser.name && product.artisanName?.toLowerCase().includes(currentUser.name.toLowerCase())))
  );

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

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (role !== 'BUYER') {
      setPendingAction('CART');
      setShowRoleModal(true);
    } else {
      if (inCartQty === 0) {
        addToCart(product, 1);
      }
      navigate('/cart', { state: { autoCheckout: true } });
    }
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

  // Dynamic language fields
  const displayTitle = language === 'gu' 
    ? (product.titleGujarati || product.title)
    : language === 'hi'
    ? (product.titleHindi || product.title)
    : product.title;

  const displayDescription = language === 'gu'
    ? (product.descriptionGu || product.descriptionEn)
    : language === 'hi'
    ? (product.descriptionHi || product.descriptionEn)
    : product.descriptionEn;

  return (
    <>
      <div className="glass-card bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-amber-900/20 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full w-full">
        
        {/* Full Uncropped Photo Display Image Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-100/90 shrink-0 flex items-center justify-center p-2">
          <img
            src={imgError ? fallbackImage : product.originalImage}
            alt={displayTitle}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
          />

          {/* AI Enhanced Badge */}
          {product.isAiEnhanced && (
            <div className={`absolute ${isOwner ? 'top-12' : 'top-3'} left-3 bg-amber-900/85 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1 shadow-sm z-10`}>
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{t('card.verified')}</span>
            </div>
          )}

          {/* Owner Quick Remove Button */}
          {isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="absolute top-3 left-3 p-2 rounded-full backdrop-blur-md bg-white/90 text-stone-600 hover:text-white hover:bg-red-600 transition-all z-20 shadow-md cursor-pointer"
              title="Remove this product from the marketplace"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
                {displayTitle}
              </h3>
            </Link>

            {/* Description preview */}
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>

          {/* Bottom Area: Two Row Layout for 100% Full Visibility */}
          <div className="pt-3 border-t border-stone-100 space-y-2.5 mt-auto">
            
            {/* Row 1: Direct Artisan Price & Stock Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] text-stone-400 uppercase tracking-wider font-bold block leading-none mb-1">
                  {t('card.directPrice')}
                </span>
                <span className="font-display font-extrabold text-xl text-[#4A2E1B] leading-none">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>

              {product.stock === 0 ? (
                <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2.5 py-0.5 rounded-full border border-red-300">
                  Out of Stock ⚠️
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {product.stock !== undefined ? product.stock : 10} units
                </span>
              )}
            </div>

            {/* Action Buttons Section */}
            <div className="space-y-2 w-full pt-2">
              
              {/* Row 1: View Product Details */}
              <Link
                to={`/product/${product.id}`}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border border-stone-200/80 transition-colors shadow-xs"
                title="View Product Details"
              >
                <Eye className="w-3.5 h-3.5 text-[#4A2E1B]" />
                <span>View Details</span>
              </Link>

              {product.stock === 0 ? (
                <button
                  disabled
                  className="w-full bg-stone-100 text-stone-500 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 border border-stone-300 cursor-not-allowed"
                >
                  <span>Out of Stock ⚠️ (Restocking Soon)</span>
                </button>
              ) : (
                /* Row 2: 3 Action Buttons (Cart, Buy Now, Bulk Order) */
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  {/* Button 1: Add to Cart */}
                  <button
                    onClick={handleAddToCartClick}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs border ${
                      inCartQty > 0
                        ? 'bg-amber-100 text-[#4A2E1B] border-amber-300 font-extrabold'
                        : 'bg-amber-50 text-[#4A2E1B] hover:bg-[#4A2E1B] hover:text-white border-amber-200'
                    }`}
                    title={inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart (+1)'}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{inCartQty > 0 ? `(${inCartQty})` : '+1'}</span>
                  </button>

                  {/* Button 2: Buy Now */}
                  <button
                    onClick={handleBuyNowClick}
                    className="py-2 px-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 border border-amber-500/40 text-xs font-black flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs"
                    title="Instant Express Buy Now"
                  >
                    <Zap className="w-3.5 h-3.5 fill-stone-950 text-stone-950 shrink-0" />
                    <span>Buy</span>
                  </button>

                  {/* Button 3: Bulk Order */}
                  <button
                    onClick={handleBulkOrderClick}
                    className="py-2 px-1 rounded-xl bg-[#C85A32] hover:bg-[#b04b27] text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition-all active:scale-95"
                    title="Wholesale Bulk Order Inquiry"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Bulk</span>
                  </button>
                </div>
              )}

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

      {/* Buy Now Instant Checkout Modal */}
      {showBuyNowModal && (
        <BuyNowModal
          product={product}
          onClose={() => setShowBuyNowModal(false)}
        />
      )}

      {/* Owner Remove Product Confirmation Modal */}
      {showDeleteConfirm && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-stone-900">Remove from Marketplace</h3>
                  <p className="text-xs text-stone-500">Unlist this craft product</p>
                </div>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center space-x-3">
                <img
                  src={product.enhancedImage || product.originalImage}
                  alt={product.title}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-stone-900 truncate">{product.title}</p>
                  <p className="text-xs font-semibold text-[#C85A32]">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to remove <strong className="text-stone-900">"{product.title}"</strong> from the market? Buyers will no longer be able to purchase or send inquiries for it.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleting(true);
                    try {
                      await productService.deleteProduct(product.id);
                      showToast('Product Removed 🗑️', `"${product.title}" unlisted from marketplace.`, 'info');
                      setShowDeleteConfirm(false);
                    } catch (err: any) {
                      showToast('Error', err.message || 'Failed to remove product', 'error');
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? 'Removing...' : 'Yes, Remove Product'}</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};
