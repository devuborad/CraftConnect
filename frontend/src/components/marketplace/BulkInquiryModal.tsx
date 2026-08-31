import React, { useState } from 'react';
import type { Product } from '../../types';
import { X, Send, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { inquiryService } from '../../services/inquiries';
import { useApp } from '../../context/AppContext';

interface BulkInquiryModalProps {
  product: Product;
  onClose: () => void;
}

export const BulkInquiryModal: React.FC<BulkInquiryModalProps> = ({ product, onClose }) => {
  const { showToast, addNotification, userName, currentUser } = useApp();
  const [quantity, setQuantity] = useState(25);
  const [targetPrice, setTargetPrice] = useState(product.price * 0.9);
  const [buyerName, setBuyerName] = useState(userName);
  const [company, setCompany] = useState(currentUser?.businessName || 'Heritage Craft Boutique');
  const [email, setEmail] = useState(currentUser?.email || 'anita@heritagecrafts.in');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98200 11223');
  const [deliveryLocation, setDeliveryLocation] = useState('Bandra West, Mumbai, Maharashtra');
  const [message, setMessage] = useState(
    `Namaste ${product.artisanName}! We are impressed by your authentic ${product.craftType}. We would like to order a wholesale batch for our retail collection.`
  );

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await inquiryService.sendInquiry({
      productId: product.id,
      productTitle: product.title,
      productImage: product.originalImage,
      buyerName,
      buyerCompany: company,
      buyerEmail: email,
      buyerPhone: phone,
      artisanId: product.artisanId,
      artisanName: product.artisanName,
      quantity,
      targetPrice,
      message,
      deliveryLocation
    });

    // Send Live Notifications
    addNotification({
      targetRole: 'BUYER',
      title: 'Bulk Inquiry Sent 📦',
      message: `Your inquiry for ${quantity}x "${product.title}" was submitted to ${product.artisanName}.`,
      type: 'inquiry',
      link: '/buyer/dashboard'
    });

    addNotification({
      targetRole: 'ARTISAN',
      title: 'New Sourcing Quote Request ✉️',
      message: `${buyerName} (${company}) requested quote for ${quantity}x "${product.title}".`,
      type: 'inquiry',
      link: '/artisan/inquiries'
    });

    setLoading(false);
    setSubmitted(true);
    showToast('Inquiry sent successfully!', `Sent to ${product.artisanName}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-stone-100">
              <img
                src={product.originalImage}
                alt={product.title}
                className="w-16 h-16 rounded-2xl object-cover border border-amber-200"
              />
              <div>
                <span className="bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded">
                  BULK INQUIRY FORM
                </span>
                <h3 className="font-display font-bold text-base text-stone-900 line-clamp-1 mt-0.5">
                  {product.title}
                </h3>
                <p className="text-xs text-stone-500">
                  Artisan: <span className="font-semibold text-stone-800">{product.artisanName}</span> ({product.artisanLocation})
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Target Quantity (Units)</label>
                  <input
                    type="number"
                    min="5"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Target Unit Price (₹)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Your Name / Retailer</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Boutique / Store Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
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
                  <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Delivery Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    required
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Custom Order Note / Requirements</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center space-x-2 text-[11px] text-[#4A2E1B]">
                <ShieldCheck className="w-5 h-5 text-[#C85A32] shrink-0" />
                <span>CraftConnect AI protects both artisan pricing dignity and buyer order delivery standards.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98"
              >
                {loading ? (
                  <span>Sending Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Bulk Inquiry to {product.artisanName}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display font-bold text-xl text-stone-900">Inquiry Sent!</h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              Your bulk order inquiry for <span className="font-semibold">{product.title}</span> has been sent directly to <span className="font-semibold">{product.artisanName}</span>.
            </p>
            <p className="text-xs text-stone-500">
              The artisan will receive a notification in their Artisan Dashboard inbox.
            </p>
            <button
              onClick={onClose}
              className="bg-[#4A2E1B] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow"
            >
              Done & Return to Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
