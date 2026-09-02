import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/common/ModalPortal';
import { inquiryService } from '../services/inquiries';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Truck,
  ArrowRight
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cartItems, updateCartQuantity, removeFromCart, clearCart, cartSubtotal, cartCount, showToast, role, setRole, userName, currentUser } = useApp();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  useBodyScrollLock(showCheckoutModal);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.autoCheckout) {
      setShowCheckoutModal(true);
    }
  }, [location.state]);

  // Form State initialized with logged-in user name
  const [buyerName, setBuyerName] = useState(userName);
  const [companyName, setCompanyName] = useState(currentUser?.businessName || 'Heritage Craft Boutique');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98200 11223');
  const [address, setAddress] = useState('402, Craft Tower, Bandra West');

  useEffect(() => {
    if (userName) {
      setBuyerName(userName);
    }
  }, [userName]);
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400050');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'RAZORPAY'>('UPI');

  // Calculations
  const shippingFee = cartSubtotal > 3000 || cartItems.length === 0 ? 0 : 250;
  const bulkDiscount = cartCount >= 5 ? Math.round(cartSubtotal * 0.1) : 0;
  const grandTotal = cartSubtotal + shippingFee - bulkDiscount;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      // Record direct order for each artisan in the cart
      cartItems.forEach(({ product, quantity }) => {
        inquiryService.recordDirectOrder({
          product,
          quantity,
          buyerName,
          buyerCompany: companyName,
          buyerEmail: currentUser?.email || 'buyer@craftconnect.in',
          buyerPhone: phone,
          deliveryAddress: address,
          city,
          state,
          pincode,
          paymentMethod,
          totalAmount: product.price * quantity,
        });
      });

      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
      showToast('Order Placed Successfully! 🎉', 'Direct connection with artisans initialized.', 'success');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 ios-fade-up">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-600 hover:text-[#C85A32] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Sourcing Marketplace</span>
        </Link>

        {role !== 'BUYER' && (
          <button
            onClick={() => setRole('BUYER')}
            className="text-xs text-[#C85A32] font-semibold hover:underline"
          >
            Switch to Buyer Account Mode
          </button>
        )}
      </div>

      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full uppercase shadow-xs">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>DIRECT ARTISAN CRAFT BASKET</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight">
          Your Sourcing Cart ({cartCount} {cartCount === 1 ? 'Item' : 'Items'})
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
          Review your selected handmade artisan items, manage quantities, and complete direct fair-trade purchases.
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Item List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map(({ product, quantity }, idx) => (
              <div
                key={product.id}
                className={`glass-card bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300 ios-fade-up ${idx < 3 ? `ios-delay-${idx + 1}` : ''}`}
              >
                {/* Product Thumbnail */}
                <Link to={`/product/${product.id}`} className="shrink-0">
                  <img
                    src={product.originalImage}
                    alt={product.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-amber-200 hover:scale-105 transition-transform duration-300 shadow-xs"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-50 text-[#C85A32] text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                      {product.craftType}
                    </span>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-display font-bold text-base text-stone-900 hover:text-[#C85A32] transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Artisan Info */}
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-stone-600">
                    <img
                      src={product.artisanAvatar}
                      alt={product.artisanName}
                      className="w-5 h-5 rounded-full object-cover border border-amber-300"
                    />
                    <span className="font-semibold text-stone-800">{product.artisanName}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#C85A32]" />
                      <span>{product.artisanLocation}</span>
                    </span>
                  </div>

                  {/* Quantity & Unit Price Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-stone-500 font-medium">Quantity:</span>
                      <div className="flex items-center bg-stone-100 border border-stone-300 rounded-xl p-0.5">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 bg-white text-stone-700 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-900">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 bg-[#4A2E1B] text-white hover:bg-[#362113] rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">
                        ₹{product.price.toLocaleString('en-IN')} / unit
                      </span>
                      <span className="font-display font-extrabold text-lg text-[#4A2E1B]">
                        ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Wholesale Tier Notice */}
            <div className="bg-amber-50/80 p-4 rounded-3xl border border-amber-200 flex items-center space-x-3 text-xs text-[#4A2E1B]">
              <Sparkles className="w-5 h-5 text-[#C85A32] shrink-0" />
              <div>
                <span className="font-bold">Wholesale Bulk Sourcing Offer: </span>
                {cartCount >= 5 ? (
                  <span className="text-emerald-700 font-extrabold">
                    🎉 10% Wholesale Bulk Discount applied to your cart!
                  </span>
                ) : (
                  <span>
                    Add {5 - cartCount} more {5 - cartCount === 1 ? 'item' : 'items'} to unlock an extra <strong>10% instant wholesale discount</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sourcing Summary Card */}
          <div className="lg:col-span-4 space-y-4 sticky top-24">
            <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-5">
              <h2 className="font-display font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
                Direct Order Summary
              </h2>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Direct Artisan Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5 text-stone-400" />
                    <span>Safe Craft Logistics & Freight</span>
                  </span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Wholesale Bulk Discount (10%)</span>
                    <span>- ₹{bulkDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-sm text-stone-900 block">Total Payable</span>
                    <span className="text-[10px] text-stone-400">Includes direct artisan remuneration</span>
                  </div>
                  <span className="font-display font-extrabold text-2xl text-[#4A2E1B]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!currentUser || role === 'GUEST') {
                    showToast('Sign In Required 🔐', 'Please sign in or create a buyer account to place your order.', 'warning');
                    navigate('/login', { state: { role: 'BUYER', redirect: '/cart' } });
                    return;
                  }
                  setShowCheckoutModal(true);
                }}
                className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-98 border border-amber-500/40"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Direct Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="bg-[#FAF7F2] p-3 rounded-2xl text-[11px] text-stone-600 flex items-center space-x-2 border border-stone-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>CraftConnect Fair-Trade Guarantee ensures 100% money reaches rural craft artisans.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="bg-white rounded-3xl p-16 text-center space-y-5 border border-stone-200 max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 bg-amber-100 text-[#C85A32] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-2xl text-stone-900">Your Craft Basket is Empty</h3>
            <p className="text-xs text-stone-500">
              You haven't added any authentic Indian artisan creations to your cart yet.
            </p>
          </div>

          <button
            onClick={() => navigate('/marketplace')}
            className="bg-[#4A2E1B] hover:bg-[#362113] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <span>Explore Handcrafted Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <ModalPortal>
          <div 
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] flex items-center justify-center p-3 sm:p-6 bg-stone-900/30 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCheckoutModal(false);
            }}
          >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative max-h-[88vh] overflow-y-auto overscroll-contain animate-in zoom-in-95 duration-200 my-auto space-y-5">
            {!orderComplete ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-[#C85A32]" />
                    <h3 className="font-display font-bold text-lg text-stone-900">
                      Direct Artisan Checkout
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold block">TOTAL ORDER VALUE</span>
                      <span className="font-bold text-base text-[#4A2E1B]">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-[10px] bg-[#4A2E1B] text-white px-2 py-1 rounded-full font-semibold">
                      {cartCount} Craft Items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Buyer Name</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Boutique / Company</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Select Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                          paymentMethod === 'UPI'
                            ? 'border-[#C85A32] bg-amber-50 text-[#C85A32]'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        ⚡ UPI / GPay
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('RAZORPAY')}
                        className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                          paymentMethod === 'RAZORPAY'
                            ? 'border-[#C85A32] bg-amber-50 text-[#C85A32]'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        💳 Card / NetBanking
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                          paymentMethod === 'COD'
                            ? 'border-[#C85A32] bg-amber-50 text-[#C85A32]'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        📦 Pay on Delivery
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98"
                  >
                    {isSubmitting ? 'Confirming Order with Artisan...' : 'Confirm Order & Pay'}
                  </button>
                </form>
              </>
            ) : (
              /* Order Success Screen */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-2xl text-stone-900">Order Confirmed!</h3>
                  <p className="text-xs text-stone-600">
                    Thank you, <span className="font-bold text-stone-900">{buyerName}</span>. Your direct artisan order has been received.
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 text-xs text-stone-700 text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Order Reference:</span>
                    <span className="font-mono font-bold text-stone-900">#CC-ART-9842</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Delivery Address:</span>
                    <span className="font-semibold text-stone-800">{city}, {state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dispatch Timeline:</span>
                    <span className="font-semibold text-emerald-700">3-5 Days (Handcrafted Dispatch)</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderComplete(false);
                      navigate('/buyer/dashboard');
                    }}
                    className="w-full bg-[#4A2E1B] hover:bg-[#362113] text-white py-3 rounded-xl font-bold text-xs shadow"
                  >
                    View Buyer Dashboard & Tracking
                  </button>

                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderComplete(false);
                      navigate('/marketplace');
                    }}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold text-xs"
                  >
                    Return to Marketplace
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalPortal>
    )}
  </div>
  );
};
