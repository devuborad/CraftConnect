import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inquiryService } from '../services/inquiries';
import type { BulkInquiry } from '../types';
import { 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  Inbox, 
  Plus,
  Building2,
  Package,
  History,
  Archive
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ArtisanInquiriesPage: React.FC = () => {
  const { showToast, addNotification, currentUser, userName } = useApp();
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [counterInputId, setCounterInputId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'ACCEPTED' | 'DISPATCHED'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadInquiries = async () => {
    setLoading(true);
    const res = await inquiryService.getActiveInquiriesByArtisan(currentUser?.id, currentUser?.name);
    // Strictly filter ONLY active wholesale inquiries
    const wholesaleOnly = res.filter((i) => i.type !== 'DIRECT_ORDER');
    setInquiries(wholesaleOnly);
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
  }, [currentUser]);

  const handleAction = async (id: string, action: 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'DISPATCHED', cPrice?: number) => {
    const targetInq = inquiries.find((item) => item.id === id);
    await inquiryService.updateStatus(id, action, cPrice);
    
    // If dispatched or declined, remove from active list and archive into history
    if (action === 'DISPATCHED' || action === 'DECLINED') {
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    } else {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: action, counterPrice: cPrice } : item))
      );
    }
    setCounterInputId(null);

    // Notify Buyer dynamically
    if (targetInq) {
      if (action === 'ACCEPTED') {
        addNotification({
          targetRole: 'BUYER',
          title: 'Wholesale Quote Accepted 🎉',
          message: `${targetInq.artisanName} accepted your bulk quote for "${targetInq.productTitle}".`,
          type: 'order',
          link: '/buyer/dashboard'
        });
      } else if (action === 'COUNTERED') {
        addNotification({
          targetRole: 'BUYER',
          title: 'Counter Offer Received 💬',
          message: `${targetInq.artisanName} sent counter quote ₹${cPrice} for "${targetInq.productTitle}".`,
          type: 'inquiry',
          link: '/buyer/dashboard'
        });
      } else if (action === 'DISPATCHED') {
        addNotification({
          targetRole: 'BUYER',
          title: 'Wholesale Batch Dispatched! 🚚',
          message: `${targetInq.artisanName} has dispatched your lot for "${targetInq.productTitle}".`,
          type: 'order',
          link: '/buyer/dashboard'
        });
      }
    }

    if (action === 'DISPATCHED') {
      showToast(`Batch Dispatched & Moved to History 📜`, 'Completed deal archived in History Archive.', 'success');
    } else {
      showToast(`Inquiry #${id.slice(-4)} ${action.toLowerCase()}!`, 'Buyer notified in real-time.', 'success');
    }
  };

  // Quick simulate helper
  const handleSimulateInquiry = async () => {
    const newInq = await inquiryService.sendInquiry({
      type: 'BULK_INQUIRY',
      productId: 'prod-1',
      productTitle: 'Handwoven Patola Double Ikkat Saree',
      productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      buyerName: 'Pooja Singhania',
      buyerCompany: 'Vogue Heritage Boutique Mumbai',
      buyerPhone: '+91 98200 88776',
      buyerEmail: 'pooja@voguecrafts.in',
      artisanId: currentUser?.id || 'artisan-me',
      artisanName: userName,
      quantity: 25,
      targetPrice: 2800,
      totalAmount: 70000,
      message: 'We would like to source a regular wholesale batch for our premium boutique studio in Mumbai.',
      deliveryLocation: 'Bandra West, Mumbai, Maharashtra',
      status: 'NEW'
    });

    setInquiries((prev) => [newInq, ...prev]);
    showToast(`New Wholesale Inquiry Received! ✨`, `From ${newInq.buyerName} (${newInq.buyerCompany})`, 'success');
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter === 'ALL') return true;
    return inq.status === statusFilter;
  });

  const totalWholesaleValue = inquiries.reduce(
    (acc, curr) => acc + (curr.totalAmount || curr.quantity * curr.targetPrice),
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/artisan/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-600 hover:text-[#C85A32] mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Studio Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center font-bold shadow-xs">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
              Active Wholesale Inquiries
            </h1>
            <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
              {inquiries.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review and negotiate active bulk quotes. Completed deals automatically archive into your History.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={handleSimulateInquiry}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Test Wholesale Quote</span>
          </button>
        </div>
      </div>

      {/* Wholesale Inquiries Container Box */}
      <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-sm overflow-hidden flex flex-col">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-900/10 p-5 border-b-2 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-extrabold text-xl text-stone-900">
                  Bulk Wholesale Inquiries Area
                </h2>
                <span className="bg-[#C85A32] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {inquiries.length} Requests
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Showing ONLY bulk B2B boutique quote requests & custom batch orders</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-500 font-bold uppercase block">Total Wholesale Value</span>
            <span className="font-display font-extrabold text-lg text-[#4A2E1B]">
              ₹{totalWholesaleValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="p-4 bg-amber-50/40 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-stone-500 mr-1">Filter:</span>
            {(['ALL', 'NEW', 'ACCEPTED', 'DISPATCHED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-amber-100/60 border border-amber-200'
                }`}
              >
                {st} ({st === 'ALL' ? inquiries.length : inquiries.filter(i => i.status === st).length})
              </button>
            ))}
          </div>

          <span className="text-xs text-stone-500 font-semibold">
            {filteredInquiries.length} {filteredInquiries.length === 1 ? 'inquiry' : 'inquiries'} in view
          </span>
        </div>

        {/* Wholesale Inquiries List Area */}
        <div className="p-6 space-y-4">
          {filteredInquiries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl p-5 border-2 border-amber-200 hover:border-amber-400 shadow-sm space-y-4 transition-all"
                >
                  {/* Product & Buyer Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={inq.productImage}
                        alt={inq.productTitle}
                        className="w-16 h-16 rounded-2xl object-cover border border-amber-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                            <Inbox className="w-3 h-3" />
                            <span>WHOLESALE INQUIRY</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                              inq.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inq.status === 'COUNTERED'
                                ? 'bg-amber-100 text-amber-800'
                                : inq.status === 'DISPATCHED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-stone-900 text-sm mt-1 line-clamp-1">{inq.productTitle}</h3>
                        <p className="text-xs text-stone-600 font-medium">
                          Boutique: <strong className="text-stone-900">{inq.buyerName}</strong> {inq.buyerCompany ? `(${inq.buyerCompany})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-[#4A2E1B] block">
                        ₹{(inq.totalAmount || inq.quantity * inq.targetPrice).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#C85A32] font-bold">{inq.quantity} units batch</span>
                    </div>
                  </div>

                  {/* Wholesale Pricing Breakdown */}
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-stone-200 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Target Price / Unit</span>
                      <span className="font-extrabold text-[#C85A32] text-sm">₹{inq.targetPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Contact Phone</span>
                      <a href={`tel:${inq.buyerPhone}`} className="font-bold text-[#4A2E1B] hover:underline truncate block">
                        {inq.buyerPhone}
                      </a>
                    </div>
                    <div className="col-span-2 text-stone-600 text-xs truncate flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                      <span className="truncate">{inq.deliveryLocation}</span>
                    </div>
                  </div>

                  {/* Buyer Notes */}
                  {inq.message && (
                    <p className="text-xs text-stone-700 italic bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                      "{inq.message}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{inq.createdAt}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      {inq.status === 'NEW' && (
                        <>
                          <button
                            onClick={() => handleAction(inq.id, 'ACCEPTED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Accept Offer
                          </button>
                          <button
                            onClick={() => {
                              setCounterInputId(inq.id);
                              setCounterPrice(inq.targetPrice + 150);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Counter
                          </button>
                          <button
                            onClick={() => handleAction(inq.id, 'DECLINED')}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {inq.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleAction(inq.id, 'DISPATCHED')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch Lot</span>
                        </button>
                      )}

                      {inq.status === 'DISPATCHED' && (
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dispatched</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Counter Price Form */}
                  {counterInputId === inq.id && (
                    <div className="flex items-center space-x-2 bg-amber-50 p-2.5 rounded-xl border border-amber-300 animate-in fade-in">
                      <span className="text-xs font-bold text-stone-700">Counter Price (₹):</span>
                      <input
                        type="number"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(Number(e.target.value))}
                        className="w-24 bg-white border border-stone-300 rounded px-2 py-1 text-xs font-bold text-stone-900"
                      />
                      <button
                        onClick={() => handleAction(inq.id, 'COUNTERED', counterPrice)}
                        className="bg-[#C85A32] text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-amber-50/20 rounded-3xl p-12 text-center space-y-3 border-2 border-dashed border-amber-300/80">
              <Inbox className="w-12 h-12 text-amber-400 mx-auto" />
              <h4 className="font-bold text-stone-800 text-base">No bulk wholesale inquiries found</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                When boutique owners and wholesale buyers request bulk quotes for your craft items, they will strictly appear in this wholesale area.
              </p>
              <button
                onClick={handleSimulateInquiry}
                className="bg-[#C85A32] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#b04b27] transition-all cursor-pointer"
              >
                + Generate Sample Wholesale Quote
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
