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
  Plus,
  Zap,
  CreditCard,
  Building2,
  Package,
  ShoppingBag,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ArtisanOrdersPage: React.FC = () => {
  const { showToast, addNotification, currentUser, userName } = useApp();
  const [orders, setOrders] = useState<BulkInquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'ACCEPTED' | 'DISPATCHED'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const res = await inquiryService.getActiveInquiriesByArtisan(currentUser?.id, currentUser?.name);
    // Strictly filter ONLY active direct orders
    const directOnly = res.filter((i) => i.type === 'DIRECT_ORDER');
    setOrders(directOnly);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const handleAction = async (id: string, action: 'ACCEPTED' | 'DECLINED' | 'DISPATCHED') => {
    const targetOrder = orders.find((item) => item.id === id);
    await inquiryService.updateStatus(id, action);
    
    // If dispatched or declined, remove from active list and archive into history
    if (action === 'DISPATCHED' || action === 'DECLINED') {
      setOrders((prev) => prev.filter((item) => item.id !== id));
    } else {
      setOrders((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: action } : item))
      );
    }

    // Notify Buyer dynamically
    if (targetOrder) {
      if (action === 'ACCEPTED') {
        addNotification({
          targetRole: 'BUYER',
          title: 'Order Confirmed by Artisan 🎉',
          message: `${targetOrder.artisanName} confirmed and is packing your order for "${targetOrder.productTitle}".`,
          type: 'order',
          link: '/buyer/dashboard'
        });
      } else if (action === 'DISPATCHED') {
        addNotification({
          targetRole: 'BUYER',
          title: 'Order Dispatched! 🚚',
          message: `${targetOrder.artisanName} has dispatched your package for "${targetOrder.productTitle}".`,
          type: 'order',
          link: '/buyer/dashboard'
        });
      }
    }

    if (action === 'DISPATCHED') {
      showToast(`Order Dispatched & Moved to History 📜`, 'Completed order archived in History Archive.', 'success');
    } else {
      showToast(`Order #${id.slice(-4)} updated as ${action.toLowerCase()}!`, 'Buyer notified in real-time.', 'success');
    }
  };

  // Quick simulate helper
  const handleSimulateOrder = async () => {
    const newOrder = await inquiryService.sendInquiry({
      type: 'DIRECT_ORDER',
      productId: 'prod-2',
      productTitle: 'Handloom Kutch Silk Dupatta',
      productImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      buyerName: 'Rohan Varma',
      buyerCompany: 'Direct Retail Customer',
      buyerPhone: '+91 98111 22334',
      buyerEmail: 'rohan.varma@gmail.com',
      artisanId: currentUser?.id || 'artisan-me',
      artisanName: userName,
      quantity: 2,
      targetPrice: 4500,
      totalAmount: 9000,
      message: 'Please ensure tamper-proof gift wrapping for this artisanal order.',
      deliveryLocation: 'Bandra West, Mumbai, Maharashtra (400050)',
      address: '402, Sea Crest Towers, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      paymentMethod: 'UPI Verified (Instant)',
      status: 'NEW'
    });

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`New Direct Customer Order Received! ✨`, `From ${newOrder.buyerName}`, 'success');
  };

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter === 'ALL') return true;
    return ord.status === statusFilter;
  });

  const totalOrdersRevenue = orders.reduce(
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
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Studio Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
              Active Customer Orders
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              {orders.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage active customer orders and shipping. Dispatched packages automatically move to History.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <Link
            to="/artisan/history"
            className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <History className="w-3.5 h-3.5" />
            <span>View History Log</span>
          </Link>

          <button
            onClick={handleSimulateOrder}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Test Direct Customer Order</span>
          </button>
        </div>
      </div>

      {/* Orders Container Box */}
      <div className="bg-white rounded-3xl border-2 border-emerald-400 shadow-sm overflow-hidden flex flex-col">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-900/10 p-5 border-b-2 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-extrabold text-xl text-stone-900">
                  Direct Customer Orders Area
                </h2>
                <span className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {orders.length} Orders
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Showing ONLY direct retail customer purchases & instant buy-now orders</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-500 font-bold uppercase block">Total Order Revenue</span>
            <span className="font-display font-extrabold text-lg text-emerald-800">
              ₹{totalOrdersRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="p-4 bg-emerald-50/40 border-b border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-stone-500 mr-1">Filter:</span>
            {(['ALL', 'NEW', 'ACCEPTED', 'DISPATCHED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-emerald-100/60 border border-emerald-200'
                }`}
              >
                {st} ({st === 'ALL' ? orders.length : orders.filter(i => i.status === st).length})
              </button>
            ))}
          </div>

          <span className="text-xs text-stone-500 font-semibold">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} in view
          </span>
        </div>

        {/* Orders List */}
        <div className="p-6 space-y-4">
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 border-2 border-emerald-200 hover:border-emerald-400 shadow-sm space-y-4 transition-all"
                >
                  {/* Product & Customer Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={ord.productImage}
                        alt={ord.productTitle}
                        className="w-16 h-16 rounded-2xl object-cover border border-emerald-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-emerald-700" />
                            <span>DIRECT ORDER</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                              ord.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'DISPATCHED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-50 text-emerald-900'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-stone-900 text-sm mt-1 line-clamp-1">{ord.productTitle}</h3>
                        <p className="text-xs text-stone-600 font-medium">
                          Customer: <strong className="text-stone-900">{ord.buyerName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-emerald-800 block">
                        ₹{(ord.totalAmount || ord.quantity * ord.targetPrice).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-stone-500 font-bold">{ord.quantity} pcs retail</span>
                    </div>
                  </div>

                  {/* Payment & Shipping Breakdown */}
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-stone-200 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Payment Mode</span>
                      <span className="font-bold text-emerald-800 truncate flex items-center space-x-1 text-xs">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{ord.paymentMethod || 'Direct Payment'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Customer Phone</span>
                      <a href={`tel:${ord.buyerPhone}`} className="font-bold text-emerald-800 hover:underline truncate block text-xs">
                        {ord.buyerPhone}
                      </a>
                    </div>
                    <div className="col-span-2 text-stone-600 text-xs truncate flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{ord.deliveryLocation || ord.address || 'India'}</span>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {ord.message && (
                    <p className="text-xs text-stone-700 italic bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                      "{ord.message}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{ord.createdAt}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      {ord.status === 'NEW' && (
                        <button
                          onClick={() => handleAction(ord.id, 'ACCEPTED')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Confirm & Pack Order
                        </button>
                      )}

                      {ord.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleAction(ord.id, 'DISPATCHED')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch Package</span>
                        </button>
                      )}

                      {ord.status === 'DISPATCHED' && (
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Dispatched</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50/20 rounded-3xl p-12 text-center space-y-3 border-2 border-dashed border-emerald-300/80">
              <Zap className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-stone-800 text-base">No direct customer orders found</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                When retail buyers purchase your crafts via Buy Now or the Sourcing Basket checkout, orders will strictly appear here.
              </p>
              <button
                onClick={handleSimulateOrder}
                className="bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 transition-all cursor-pointer"
              >
                + Generate Sample Customer Order
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
