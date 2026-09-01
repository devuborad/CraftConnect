import React, { useState } from 'react';
import { X, Zap, ShieldCheck, Truck, CreditCard, QrCode, Building2, CheckCircle2, ArrowRight, Lock, MapPin } from 'lucide-react';
import type { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface BuyNowModalProps {
  product: Product;
  onClose: () => void;
}

type PaymentOption = 'UPI' | 'CARD' | 'NETBANKING' | 'COD';

export const BuyNowModal: React.FC<BuyNowModalProps> = ({ product, onClose }) => {
  const { showToast, addNotification, userName, currentUser } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  const [fullName, setFullName] = useState(userName || 'Valued Buyer');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [address, setAddress] = useState('Flat 402, Craft Haven Apartments, Bandra West');
  const [city, setCity] = useState('Mumbai');
  const [pincode, setPincode] = useState('400050');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculations
  const itemTotal = product.price * quantity;
  const shippingFee = itemTotal >= 3000 ? 0 : 150;
  const grandTotal = itemTotal + shippingFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedOrderId = `CC-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedOrderId);
      setIsSubmitting(false);
      setOrderComplete(true);

      // Trigger Notifications
      addNotification({
        targetRole: 'BUYER',
        title: `Instant Purchase Confirmed! ⚡ (${generatedOrderId})`,
        message: `Your order for ${quantity}x "${product.title}" has been placed directly with artisan ${product.artisanName}. Total: ₹${grandTotal.toLocaleString('en-IN')}`,
        type: 'order',
        link: '/buyer/dashboard'
      });

      addNotification({
        targetRole: 'ARTISAN',
        title: `New Direct Buy Now Order! 🎉 (${generatedOrderId})`,
        message: `${fullName} bought ${quantity}x "${product.title}". Total payout: ₹${itemTotal.toLocaleString('en-IN')}`,
        type: 'order',
        link: '/artisan/dashboard'
      });

      showToast(`Order Placed Successfully! 🎉`, `Order ${generatedOrderId} confirmed with ${product.artisanName}`, 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4A2E1B] via-[#6E3C1E] to-[#C85A32] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <Zap className="w-3 h-3 fill-stone-950" />
            <span>Instant Express Checkout</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Direct Artisan Purchase
          </h2>
          <p className="text-xs text-amber-100/90 font-medium">
            100% Fair Trade Payout directly to artisan {product.artisanName}
          </p>
        </div>

        {orderComplete ? (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Received & Order Verified
              </span>
              <h3 className="font-display font-extrabold text-2xl text-stone-900">
                Thank you for your order, {fullName}!
              </h3>
              <p className="text-xs text-stone-600">
                Order Reference ID: <strong className="text-[#4A2E1B]">{orderId}</strong>
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between font-medium text-stone-700">
                <span>Item:</span>
                <span className="font-bold text-stone-900">{product.title} (x{quantity})</span>
              </div>
              <div className="flex justify-between font-medium text-stone-700">
                <span>Artisan:</span>
                <span className="font-bold text-[#C85A32]">{product.artisanName}</span>
              </div>
              <div className="flex justify-between font-medium text-stone-700">
                <span>Total Paid:</span>
                <span className="font-extrabold text-stone-900">₹{grandTotal.toLocaleString('en-IN')} ({paymentOption})</span>
              </div>
              <div className="flex justify-between font-medium text-stone-700">
                <span>Delivery Address:</span>
                <span className="font-medium text-stone-800 text-right">{address}, {city} ({pincode})</span>
              </div>
              <div className="flex justify-between text-[#4A2E1B] font-bold pt-2 border-t border-stone-200">
                <span>Estimated Delivery:</span>
                <span>3 - 5 Business Days</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={onClose}
                className="bg-[#4A2E1B] hover:bg-[#362113] text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-lg transition-all"
              >
                Done & Return to Product
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-6">
            
            {/* Product Card Overview */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img
                  src={product.enhancedImage || product.originalImage}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-xl border border-amber-900/10 shadow-xs"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">{product.title}</h4>
                  <p className="text-xs text-stone-500">Master Artisan: <strong className="text-[#C85A32]">{product.artisanName}</strong></p>
                  <p className="text-xs font-black text-[#4A2E1B] mt-0.5">₹{product.price.toLocaleString('en-IN')} / unit</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-stone-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xs font-black text-[#4A2E1B] px-2 min-w-5 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 bg-[#4A2E1B] text-white hover:bg-[#362113] font-bold rounded-lg text-xs flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Delivery Address & Contact */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#4A2E1B]">
                <MapPin className="w-4 h-4 text-[#C85A32]" />
                <span>Delivery Address & Recipient</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">City / Town</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#4A2E1B]">
                <CreditCard className="w-4 h-4 text-[#C85A32]" />
                <span>Select Payment Method</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentOption('UPI')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentOption === 'UPI'
                      ? 'bg-amber-50 border-2 border-[#C85A32] text-[#4A2E1B] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#C85A32]" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('CARD')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentOption === 'CARD'
                      ? 'bg-amber-50 border-2 border-[#C85A32] text-[#4A2E1B] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#C85A32]" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('NETBANKING')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentOption === 'NETBANKING'
                      ? 'bg-amber-50 border-2 border-[#C85A32] text-[#4A2E1B] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#C85A32]" />
                  <span>NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('COD')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentOption === 'COD'
                      ? 'bg-amber-50 border-2 border-[#C85A32] text-[#4A2E1B] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#C85A32]" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Payment Details Container */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                {paymentOption === 'UPI' && (
                  <div className="space-y-2">
                    <label className="block text-stone-700 font-bold">UPI ID (Google Pay / PhonePe / Paytm)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                      required
                    />
                    <p className="text-[11px] text-stone-500">Instant approval via UPI app push request.</p>
                  </div>
                )}

                {paymentOption === 'CARD' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentOption === 'NETBANKING' && (
                  <div className="space-y-2">
                    <label className="block text-stone-700 font-bold">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentOption === 'COD' && (
                  <div className="p-2 text-emerald-800 font-medium text-xs flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pay ₹{grandTotal.toLocaleString('en-IN')} in cash upon delivery to your doorstep.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary Footer & Place Order Button */}
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Price ({quantity} item{quantity > 1 ? 's' : ''}):</span>
                  <span className="font-bold text-stone-900">₹{itemTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Artisanal Express Shipping:</span>
                  <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1 border-t border-stone-200">
                  <span>Total Amount Payable:</span>
                  <span className="text-base text-[#4A2E1B]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-200" />
                    <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
