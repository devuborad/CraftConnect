import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ArrowRight, 
  Sparkles, 
  ShoppingCart, 
  CreditCard,
  Clock,
  Package,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageSquare,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from '../services/mockData';
import { inquiryService } from '../services/inquiries';
import type { BulkInquiry } from '../types';
import { ProductCard } from '../components/marketplace/ProductCard';

export const BuyerDashboardPage: React.FC = () => {
  const { savedProductIds, cartCount, cartSubtotal, userName, currentUser, showToast } = useApp();
  const [buyerInquiries, setBuyerInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [recounterInputId, setRecounterInputId] = useState<string | null>(null);
  const [recounterPrice, setRecounterPrice] = useState<number>(0);
  const [recounterMessage, setRecounterMessage] = useState<string>('');

  const savedProducts = MOCK_PRODUCTS.filter((p) => savedProductIds.includes(p.id));

  const loadBuyerInquiries = async () => {
    setLoading(true);
    const all = await inquiryService.getInquiries();
    setBuyerInquiries(all);
    setLoading(false);
  };

  useEffect(() => {
    loadBuyerInquiries();

    // Listen for real-time order/inquiry status updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'craft_live_inquiries_orders' || !e.key) {
        loadBuyerInquiries();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', loadBuyerInquiries);
    const interval = setInterval(loadBuyerInquiries, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', loadBuyerInquiries);
      clearInterval(interval);
    };
  }, []);

  const handleBuyerAcceptCounter = async (inq: BulkInquiry) => {
    const finalPrice = inq.counterPrice || inq.targetPrice;
    await inquiryService.updateStatus(inq.id, 'ACCEPTED', finalPrice, 'Buyer accepted artisan counter offer');
    showToast('Counter Offer Accepted! 🎉', `Order confirmed at ₹${finalPrice}/unit. Artisan notified.`, 'success');
    loadBuyerInquiries();
  };

  const handleBuyerDeclineCounter = async (inq: BulkInquiry) => {
    await inquiryService.updateStatus(inq.id, 'DECLINED', undefined, 'Buyer declined counter offer');
    showToast('Offer Declined', 'Inquiry archived.', 'info');
    loadBuyerInquiries();
  };

  const handleBuyerSubmitRecounter = async (inq: BulkInquiry) => {
    if (!recounterPrice || recounterPrice <= 0) {
      showToast('Enter valid counter price', 'Please provide a valid price per unit', 'warning');
      return;
    }
    await inquiryService.updateStatus(inq.id, 'COUNTERED', recounterPrice, recounterMessage || `Buyer counter price: ₹${recounterPrice}`);
    showToast('Counter offer sent to Artisan 💬', `Proposed ₹${recounterPrice}/unit. Artisan notified live.`, 'success');
    setRecounterInputId(null);
    setRecounterMessage('');
    loadBuyerInquiries();
  };

  const renderStatusBadge = (inquiry: BulkInquiry) => {
    switch (inquiry.status) {
      case 'NEW':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center space-x-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>⏳ Please Wait — Under Artisan Review</span>
          </span>
        );
      case 'COUNTERED':
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center space-x-1.5 shadow-xs">
            <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
            <span>💬 Counter Offer: ₹{inquiry.counterPrice?.toLocaleString('en-IN')} / unit</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center space-x-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
            <span>✅ Accepted by Artisan — Preparing Order</span>
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center space-x-1.5 shadow-xs">
            <Truck className="w-3.5 h-3.5 text-indigo-700" />
            <span>🚚 Order Dispatched — In Transit</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center space-x-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>🎉 Order Completed & Delivered</span>
          </span>
        );
      case 'DECLINED':
        return (
          <span className="bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Offer Declined</span>
          </span>
        );
      default:
        return (
          <span className="bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold px-3 py-1.5 rounded-full">
            {inquiry.status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 ios-fade-up">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A2E1B] via-[#6E3C1E] to-[#C85A32] text-white p-6 sm:p-8 shadow-xl border border-amber-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-5">
          {/* Buyer Avatar */}
          <div className="relative shrink-0">
            {currentUser?.avatar || currentUser?.profileImage ? (
              <img
                src={currentUser.avatar || currentUser.profileImage}
                alt={userName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center text-2xl font-bold uppercase border-2 border-amber-300 shadow-md">
                {userName?.charAt(0) || 'B'}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-stone-950 text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                BOUTIQUE BUYER DASHBOARD
              </span>
              {currentUser?.city && (
                <span className="bg-white/20 text-amber-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                  📍 {currentUser.city}
                </span>
              )}
            </div>
            
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white drop-shadow-sm">
              Welcome back, {userName}
            </h1>
            
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium tracking-wide">
              {currentUser?.businessName ? `${currentUser.businessName} • ` : ''}Direct Rural Artisan Sourcing Portal
            </p>
          </div>
        </div>

        {/* Quick Profile Link */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            to="/buyer/profile"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-xs transition-all backdrop-blur-xs cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Buyer Profile</span>
          </Link>
        </div>
      </div>

      {/* Cart Overview Widget */}
      <div className="glass-card bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 ios-fade-up ios-delay-1">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center shrink-0 shadow-xs">
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
          className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow transition-all shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>Open Sourcing Cart & Checkout →</span>
        </Link>
      </div>

      {/* My Active Sourcing Orders & Bulk Inquiries Tracking Portal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
            <Inbox className="w-5 h-5 text-[#C85A32]" />
            <span>My Active Sourcing Orders & Inquiries ({buyerInquiries.length})</span>
          </h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            🟢 Real-time Bi-Directional Sync
          </span>
        </div>

        {buyerInquiries.length > 0 ? (
          <div className="space-y-4">
            {buyerInquiries.map((inq) => {
              const total = inq.totalAmount || (inq.quantity * (inq.counterPrice || inq.targetPrice));

              return (
                <div
                  key={inq.id}
                  className="bg-white p-5 rounded-3xl border-2 border-stone-200 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={inq.productImage}
                        alt={inq.productTitle}
                        className="w-14 h-14 rounded-2xl object-cover border border-amber-200 shrink-0"
                      />
                      <div>
                        <span className="bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                          {inq.type === 'DIRECT_ORDER' ? 'Direct Retail Order' : 'Wholesale Bulk Inquiry'}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-0.5">{inq.productTitle}</h4>
                        <p className="text-xs text-stone-500">Artisan: {inq.artisanName}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      {renderStatusBadge(inq)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Quantity</span>
                      <span className="font-extrabold text-stone-900">{inq.quantity} units</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Target Price / Unit</span>
                      <span className="font-extrabold text-stone-900">₹{inq.targetPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Monetary Value</span>
                      <span className="font-black text-[#C85A32] text-sm">₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Delivery Location</span>
                      <span className="font-semibold text-stone-700 truncate block">{inq.deliveryLocation}</span>
                    </div>
                  </div>

                  {/* Buyer Response Actions when Artisan Countered */}
                  {inq.status === 'COUNTERED' && (
                    <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-purple-950 text-xs sm:text-sm block">
                            💬 Artisan Counter Offer: ₹{inq.counterPrice?.toLocaleString('en-IN')} / unit
                          </span>
                          <p className="text-[11px] text-purple-800 font-medium">
                            Total Revised Value: ₹{((inq.counterPrice || inq.targetPrice) * inq.quantity).toLocaleString('en-IN')} for {inq.quantity} units
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleBuyerAcceptCounter(inq)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Counter Offer (₹{inq.counterPrice?.toLocaleString('en-IN')})</span>
                          </button>

                          <button
                            onClick={() => {
                              setRecounterInputId(recounterInputId === inq.id ? null : inq.id);
                              setRecounterPrice(inq.counterPrice || inq.targetPrice);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Propose Revised Price</span>
                          </button>

                          <button
                            onClick={() => handleBuyerDeclineCounter(inq)}
                            className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                          >
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>

                      {/* Inline Re-counter Form */}
                      {recounterInputId === inq.id && (
                        <div className="pt-3 border-t border-purple-200 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-extrabold text-purple-900 uppercase block mb-1">
                                Your Revised Target Price (₹ / unit)
                              </label>
                              <input
                                type="number"
                                value={recounterPrice}
                                onChange={(e) => setRecounterPrice(parseFloat(e.target.value) || 0)}
                                className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold text-stone-900"
                                placeholder="e.g. 1850"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold text-purple-900 uppercase block mb-1">
                                Optional Buyer Note to Artisan
                              </label>
                              <input
                                type="text"
                                value={recounterMessage}
                                onChange={(e) => setRecounterMessage(e.target.value)}
                                className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-medium text-stone-900"
                                placeholder="e.g. Can we split shipping cost if ordering 30 units?"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setRecounterInputId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-purple-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleBuyerSubmitRecounter(inq)}
                              className="bg-purple-700 text-white font-extrabold px-4 py-1.5 rounded-lg text-xs hover:bg-purple-800"
                            >
                              Send Counter Offer →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {inq.message && (
                    <div className="bg-amber-50/60 p-3 rounded-2xl text-xs text-stone-700 border border-amber-200/80">
                      <span className="font-bold text-stone-900">Order Note / Message:</span> "{inq.message}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 text-xs text-stone-500 space-y-2">
            <p className="font-bold text-stone-700">No active sourcing orders or inquiries yet.</p>
            <p>Browse authentic craft products on the marketplace to request quotes or order directly from rural master artisans!</p>
          </div>
        )}
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
