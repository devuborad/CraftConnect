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
  Zap, 
  Search, 
  History, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  CreditCard,
  Building2,
  Package,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ArtisanHistoryPage: React.FC = () => {
  const { showToast, currentUser, userName } = useApp();
  const [historyList, setHistoryList] = useState<BulkInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'WHOLESALE' | 'ORDERS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DISPATCHED' | 'COMPLETED' | 'DECLINED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    const res = await inquiryService.getHistoryByArtisan(currentUser?.id, currentUser?.name);
    setHistoryList(res);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const handleRestore = async (id: string) => {
    await inquiryService.restoreFromHistory(id);
    showToast('Restored to Active Inbox 🔄', 'Order/Inquiry is now back in your active list.', 'success');
    loadHistory();
  };

  const handleDelete = async (id: string) => {
    await inquiryService.deleteHistoryItem(id);
    showToast('Record Deleted 🗑️', 'History item has been removed.', 'info');
    loadHistory();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history records?')) {
      await inquiryService.clearAllHistory();
      showToast('History Cleared 🧹', 'All completed history records have been cleared.', 'info');
      loadHistory();
    }
  };

  // Filter list
  const filteredList = historyList.filter((item) => {
    // Tab filter
    if (activeTab === 'WHOLESALE' && item.type === 'DIRECT_ORDER') return false;
    if (activeTab === 'ORDERS' && item.type !== 'DIRECT_ORDER') return false;

    // Status filter
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.buyerName || '').toLowerCase().includes(q);
      const matchComp = (item.buyerCompany || '').toLowerCase().includes(q);
      const matchProd = (item.productTitle || '').toLowerCase().includes(q);
      const matchId = (item.id || '').toLowerCase().includes(q);
      const matchPhone = (item.buyerPhone || '').includes(q);
      if (!matchName && !matchComp && !matchProd && !matchId && !matchPhone) {
        return false;
      }
    }

    return true;
  });

  const wholesaleHistory = historyList.filter((i) => i.type !== 'DIRECT_ORDER');
  const ordersHistory = historyList.filter((i) => i.type === 'DIRECT_ORDER');
  const totalHistoricRevenue = historyList.reduce(
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
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
              Orders & Inquiries History Archive
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
              {historyList.length} Archived
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Permanent archive of all past completed, dispatched, and fulfilled wholesale inquiries and direct orders.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 border border-stone-300 hover:border-red-300 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start md:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Total Archived</span>
            <span className="font-display font-extrabold text-2xl text-stone-900">{historyList.length} Records</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Wholesale History</span>
            <span className="font-display font-extrabold text-2xl text-[#C85A32]">{wholesaleHistory.length} Deals</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Fulfilled Orders</span>
            <span className="font-display font-extrabold text-2xl text-emerald-800">{ordersHistory.length} Orders</span>
          </div>
        </div>
      </div>

      {/* Main History Container */}
      <div className="bg-white rounded-3xl border-2 border-purple-300/80 shadow-sm overflow-hidden flex flex-col">
        
        {/* Controls Header */}
        <div className="p-5 border-b border-stone-200 space-y-4 bg-stone-50/60">
          
          {/* Top Bar: Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                All History ({historyList.length})
              </button>

              <button
                onClick={() => setActiveTab('WHOLESALE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'WHOLESALE'
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                Wholesale ({wholesaleHistory.length})
              </button>

              <button
                onClick={() => setActiveTab('ORDERS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ORDERS'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                Direct Orders ({ordersHistory.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history by buyer, product, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Status Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-stone-500 mr-1">Status:</span>
              {(['ALL', 'DISPATCHED', 'COMPLETED', 'DECLINED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs font-extrabold text-[#4A2E1B]">
              Historic Value: ₹{totalHistoricRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* History Records List */}
        <div className="p-6 space-y-4">
          {filteredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border-2 border-stone-200 hover:border-purple-300 shadow-sm space-y-4 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                              item.type === 'DIRECT_ORDER'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-[#C85A32]'
                            }`}
                          >
                            {item.type === 'DIRECT_ORDER' ? <Zap className="w-2.5 h-2.5" /> : <Inbox className="w-2.5 h-2.5" />}
                            <span>{item.type === 'DIRECT_ORDER' ? 'DIRECT ORDER' : 'WHOLESALE'}</span>
                          </span>

                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                              item.status === 'DISPATCHED'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'DECLINED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-stone-900 text-sm mt-1 line-clamp-1">{item.productTitle}</h3>
                        <p className="text-xs text-stone-600 font-medium">
                          {item.type === 'DIRECT_ORDER' ? 'Customer' : 'Boutique'}: <strong className="text-stone-900">{item.buyerName}</strong> {item.buyerCompany ? `(${item.buyerCompany})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-[#4A2E1B] block">
                        ₹{(item.totalAmount || item.quantity * item.targetPrice).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-stone-400 font-bold">{item.quantity} {item.type === 'DIRECT_ORDER' ? 'pcs' : 'units batch'}</span>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-stone-200 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Completed Date</span>
                      <span className="font-bold text-stone-800 flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        <span>{item.completedAt || item.createdAt}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Contact</span>
                      <a href={`tel:${item.buyerPhone}`} className="font-bold text-[#4A2E1B] hover:underline truncate block mt-0.5">
                        {item.buyerPhone}
                      </a>
                    </div>

                    <div className="col-span-2 text-stone-600 text-xs truncate flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{item.deliveryLocation || item.address || 'India'}</span>
                    </div>
                  </div>

                  {/* Footer Actions: Restore & Delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400">
                      ID: <strong className="text-stone-600">#{item.id.slice(-6)}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Move back to active inboxes"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore to Active</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl p-12 text-center space-y-3 border-2 border-dashed border-stone-200">
              <History className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="font-bold text-stone-800 text-base">No history records found</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                When you dispatch or fulfill bulk inquiries and direct customer orders, they will automatically be archived into this history record.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
