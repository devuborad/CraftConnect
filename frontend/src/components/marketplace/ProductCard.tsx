import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { Heart, Sparkles, MapPin, Eye, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  onBulkInquiry?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBulkInquiry }) => {
  const { savedProductIds, toggleSaveProduct, language, t } = useApp();
  const isSaved = savedProductIds.includes(product.id);

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
    <div className="glass-card bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-amber-900/20 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Image Header with Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={product.originalImage}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* AI Enhanced Badge */}
        {product.isAiEnhanced && (
          <div className="absolute top-3 left-3 bg-amber-900/80 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1 shadow">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{t('card.verified')}</span>
          </div>
        )}

        {/* Save/Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaveProduct(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 text-stone-600 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Craft Type Tag */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#4A2E1B] text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-amber-900/10">
          {product.craftType}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Artisan Info */}
          <div className="flex items-center space-x-2.5 mb-2.5">
            <img
              src={product.artisanAvatar}
              alt={product.artisanName}
              className="w-7 h-7 rounded-full object-cover border border-amber-300"
            />
            <div className="text-xs overflow-hidden">
              <p className="font-semibold text-stone-900 truncate">{product.artisanName}</p>
              <p className="text-[10px] text-stone-500 flex items-center space-x-1 truncate">
                <MapPin className="w-2.5 h-2.5 text-[#C85A32]" />
                <span>{product.artisanLocation}</span>
              </p>
            </div>
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-display font-bold text-base text-stone-900 group-hover:text-[#C85A32] transition-colors line-clamp-2 leading-snug">
              {displayTitle}
            </h3>
          </Link>

          {/* Description preview */}
          <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Bottom Actions & Price */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">{t('card.directPrice')}</span>
            <span className="font-bold text-lg text-[#4A2E1B]">₹{product.price.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/product/${product.id}`}
              className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
              title="View Product Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={() => onBulkInquiry && onBulkInquiry(product)}
              className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('card.bulkOrder')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
