import React, { useState, useEffect } from 'react';
import { inquiryService } from '../services/inquiries';
import type { BulkInquiry } from '../types';
import { Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ArtisanInquiriesPage: React.FC = () => {
  const { showToast, addNotification } = useApp();
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [counterInputId, setCounterInputId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);

  useEffect(() => {
    inquiryService.getInquiries().then((res) => setInquiries(res));
  }, []);

  const handleAction = async (id: string, action: 'ACCEPTED' | 'COUNTERED' | 'DECLINED', cPrice?: number) => {
    const targetInq = inquiries.find((item) => item.id === id);
    await inquiryService.updateStatus(id, action, cPrice);
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action, counterPrice: cPrice } : item))
    );
    setCounterInputId(null);

    // Notify Buyer dynamically
    if (targetInq) {
      if (action === 'ACCEPTED') {
        addNotification({
          targetRole: 'BUYER',
          title: 'Inquiry Accepted 🎉',
          message: `${targetInq.artisanName} accepted your order for "${targetInq.productTitle}".`,
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
      }
    }

    showToast(`Inquiry ${action.toLowerCase()}!`, 'Buyer notified via SMS and email', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-stone-900">
          Bulk Order Inquiries Inbox
        </h1>
        <p className="text-xs text-stone-500">
          Direct wholesale inquiries received from boutique owners, store buyers, and export houses.
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="glass-card bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <img
                  src={inq.productImage}
                  alt={inq.productTitle}
                  className="w-14 h-14 rounded-2xl object-cover border border-amber-200"
                />
                <div>
                  <span className="bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded">
                    NEW WHOLESALE INQUIRY
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm mt-0.5">{inq.productTitle}</h3>
                  <p className="text-xs text-stone-500">
                    Buyer: <strong className="text-stone-800">{inq.buyerName}</strong> ({inq.buyerCompany})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    inq.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inq.status === 'COUNTERED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  STATUS: {inq.status}
                </span>
                <p className="text-[10px] text-stone-400 mt-1 flex items-center justify-end space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Received {inq.createdAt}</span>
                </p>
              </div>
            </div>

            {/* Quantity & Target Price */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Requested Batch</span>
                <p className="font-extrabold text-stone-900 mt-0.5">{inq.quantity} units</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Buyer Target Price</span>
                <p className="font-extrabold text-[#4A2E1B] mt-0.5">₹{inq.targetPrice.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Total Deal Value</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">
                  ₹{(inq.quantity * inq.targetPrice).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Destination</span>
                <p className="font-bold text-stone-800 mt-0.5 truncate">{inq.deliveryLocation}</p>
              </div>
            </div>

            {/* Buyer Message */}
            <p className="text-xs text-stone-700 italic bg-stone-50 p-4 rounded-2xl border border-stone-200">
              "{inq.message}"
            </p>

            {/* Actions */}
            {inq.status === 'NEW' && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction(inq.id, 'ACCEPTED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow"
                  >
                    Accept Order Offer
                  </button>

                  <button
                    onClick={() => {
                      setCounterInputId(inq.id);
                      setCounterPrice(inq.targetPrice + 100);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-5 py-2 rounded-xl text-xs font-bold shadow"
                  >
                    Send Counter Offer
                  </button>

                  <button
                    onClick={() => handleAction(inq.id, 'DECLINED')}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Decline
                  </button>
                </div>

                {counterInputId === inq.id && (
                  <div className="flex items-center space-x-2 bg-amber-50 p-2 rounded-xl border border-amber-300">
                    <span className="text-xs font-bold text-stone-700">Counter ₹:</span>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      className="w-24 bg-white border border-stone-300 rounded px-2 py-1 text-xs font-bold"
                    />
                    <button
                      onClick={() => handleAction(inq.id, 'COUNTERED', counterPrice)}
                      className="bg-[#C85A32] text-white px-3 py-1 rounded text-xs font-bold"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
