import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Zap, 
  Inbox, 
  Scale, 
  DollarSign, 
  Percent, 
  Sparkles, 
  Layers, 
  Clock, 
  CreditCard,
  Copy,
  Check,
  Building2,
  PackageCheck,
  ShieldCheck,
  ArrowLeft,
  Download,
  FileText,
  RefreshCw
} from 'lucide-react';
import { productService } from '../services/products';
import { inquiryService } from '../services/inquiries';
import type { BulkInquiry } from '../types';
import { useApp } from '../context/AppContext';
import { downloadAnalyticsPDF } from '../utils/pdfExport';

export const ArtisanAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role, showToast, userName } = useApp();
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'graphs' | 'diff' | 'comparison' | 'money'>('all');
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const allInquiries = await inquiryService.getInquiriesByArtisan(currentUser?.id, currentUser?.name);
    setInquiries(allInquiries);
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in to access your Artisan Analytics.', 'warning');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/analytics' } });
      return;
    }
    loadData();

    // Listen for real-time updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'craft_live_inquiries_orders' || !e.key) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadData);
    const interval = setInterval(loadData, 4000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadData);
      clearInterval(interval);
    };
  }, [currentUser, role, navigate, showToast]);

  const stats = useMemo(() => {
    const bulkList = inquiries.filter((i) => i.type !== 'DIRECT_ORDER');
    const directList = inquiries.filter((i) => i.type === 'DIRECT_ORDER');

    const getVal = (i: BulkInquiry) => i.totalAmount || (i.quantity * i.targetPrice);

    const bulkTotalValue = bulkList.reduce((sum, i) => sum + getVal(i), 0);
    const directTotalValue = directList.reduce((sum, i) => sum + getVal(i), 0);
    const grandTotalValue = bulkTotalValue + directTotalValue;

    const bulkTotalUnits = bulkList.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const directTotalUnits = directList.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const grandTotalUnits = bulkTotalUnits + directTotalUnits;

    const bulkAOV = bulkList.length > 0 ? Math.round(bulkTotalValue / bulkList.length) : 0;
    const directAOV = directList.length > 0 ? Math.round(directTotalValue / directList.length) : 0;

    const bulkAvgUnitPrice = bulkTotalUnits > 0 ? Math.round(bulkTotalValue / bulkTotalUnits) : 0;
    const directAvgUnitPrice = directTotalUnits > 0 ? Math.round(directTotalValue / directTotalUnits) : 0;

    const isCompleted = (i: BulkInquiry) => i.status === 'COMPLETED' || i.status === 'DISPATCHED';
    const isPending = (i: BulkInquiry) => i.status === 'NEW' || i.status === 'COUNTERED' || i.status === 'ACCEPTED';
    
    const realizedRevenue = inquiries.filter(isCompleted).reduce((sum, i) => sum + getVal(i), 0);
    const pendingPipeline = inquiries.filter(isPending).reduce((sum, i) => sum + getVal(i), 0);
    const declinedValue = inquiries.filter((i) => i.status === 'DECLINED').reduce((sum, i) => sum + getVal(i), 0);

    const realizedPercent = grandTotalValue > 0 ? Math.round((realizedRevenue / grandTotalValue) * 100) : 0;
    const pendingPercent = grandTotalValue > 0 ? Math.round((pendingPipeline / grandTotalValue) * 100) : 0;

    const bulkShare = grandTotalValue > 0 ? Math.round((bulkTotalValue / grandTotalValue) * 100) : 0;
    const directShare = grandTotalValue > 0 ? Math.round((directTotalValue / grandTotalValue) * 100) : 0;

    const statusCounts = {
      NEW: inquiries.filter((i) => i.status === 'NEW').length,
      COUNTERED: inquiries.filter((i) => i.status === 'COUNTERED').length,
      ACCEPTED: inquiries.filter((i) => i.status === 'ACCEPTED').length,
      DISPATCHED: inquiries.filter((i) => i.status === 'DISPATCHED').length,
      COMPLETED: inquiries.filter((i) => i.status === 'COMPLETED').length,
      DECLINED: inquiries.filter((i) => i.status === 'DECLINED').length
    };

    const paymentBreakdown = inquiries.reduce((acc, i) => {
      const method = i.paymentMethod || 'Direct Invoice';
      acc[method] = (acc[method] || 0) + getVal(i);
      return acc;
    }, {} as Record<string, number>);

    return {
      bulkList,
      directList,
      bulkTotalValue,
      directTotalValue,
      grandTotalValue,
      bulkTotalUnits,
      directTotalUnits,
      grandTotalUnits,
      bulkAOV,
      directAOV,
      bulkAvgUnitPrice,
      directAvgUnitPrice,
      realizedRevenue,
      pendingPipeline,
      declinedValue,
      realizedPercent,
      pendingPercent,
      bulkShare,
      directShare,
      statusCounts,
      paymentBreakdown
    };
  }, [inquiries]);

  const handleExportPDF = () => {
    downloadAnalyticsPDF(stats, userName);
    showToast('Downloading PDF Report 📄', 'Generated live financial audit document.', 'success');
  };

  const copySummaryText = () => {
    const text = `
=== CRAFTCONNECT FULL-PAGE FINANCIAL & PIPELINE AUDIT ===
Timestamp: ${new Date().toLocaleString()}
Artisan: ${userName}
Total Pipeline Value: ₹${stats.grandTotalValue.toLocaleString('en-IN')}
Total Deals Transacted: ${inquiries.length} (${stats.grandTotalUnits} units)

--- BULK WHOLESALE QUERIES ---
Count: ${stats.bulkList.length} deals
Total Value: ₹${stats.bulkTotalValue.toLocaleString('en-IN')} (${stats.bulkShare}% of Pipeline)
Average Order Value (AOV): ₹${stats.bulkAOV.toLocaleString('en-IN')}
Average Price Per Unit: ₹${stats.bulkAvgUnitPrice.toLocaleString('en-IN')}

--- DIRECT RETAIL ORDERS ---
Count: ${stats.directList.length} orders
Total Value: ₹${stats.directTotalValue.toLocaleString('en-IN')} (${stats.directShare}% of Pipeline)
Average Order Value (AOV): ₹${stats.directAOV.toLocaleString('en-IN')}
Average Price Per Unit: ₹${stats.directAvgUnitPrice.toLocaleString('en-IN')}

--- CASHFLOW BREAKDOWN ---
Realized Liquid Revenue: ₹${stats.realizedRevenue.toLocaleString('en-IN')} (${stats.realizedPercent}%)
In-Pipeline Pending: ₹${stats.pendingPipeline.toLocaleString('en-IN')} (${stats.pendingPercent}%)
=========================================================
`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Header Navigation */}
      <div className="bg-gradient-to-r from-[#4A2E1B] via-stone-900 to-[#C85A32] text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Link
                to="/artisan/dashboard"
                className="bg-white/10 hover:bg-white/20 text-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>

              <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                Live Buyer Data Linked
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-amber-50">
              Financial & Pipeline Studio
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl">
              Full-page interactive analysis comparing wholesale bulk inquiries against direct consumer retail orders with instant PDF export.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>📄 Download Analysis PDF</span>
            </button>

            <button
              onClick={copySummaryText}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Summary!' : 'Export Text'}</span>
            </button>

            <button
              onClick={loadData}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Header KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-amber-500/20 relative z-10">
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Total Pipeline Value</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-white">₹{stats.grandTotalValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-amber-200/60 block mt-1">{inquiries.length} Lifetime Deals</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Realized Liquid Revenue</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-emerald-300">₹{stats.realizedRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-emerald-200/80 block mt-1">{stats.realizedPercent}% Realized Ratio</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Bulk Wholesale Value</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-amber-300">₹{stats.bulkTotalValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-amber-200/60 block mt-1">{stats.bulkShare}% Pipeline Share</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Direct Retail Value</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-emerald-200">₹{stats.directTotalValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-emerald-200/60 block mt-1">{stats.directShare}% Pipeline Share</span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: '🌟 Full 360° Studio View' },
          { id: 'overview', label: '📊 Summary Overview' },
          { id: 'graphs', label: '📈 Visual Graphs' },
          { id: 'diff', label: '⚡ Differential Analysis' },
          { id: 'comparison', label: '⚖️ Side-by-Side Matrix' },
          { id: 'money', label: '💰 Money Audit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shrink-0 border transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-md'
                : 'bg-white text-stone-700 border-stone-200 hover:border-[#C85A32]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Studio Body Content */}
      <div className="space-y-8">

        {/* SECTION 1: SUMMARY OVERVIEW */}
        {(activeTab === 'all' || activeTab === 'overview') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#C85A32]" />
                <span>Channel Breakdown: Wholesale Bulk vs Direct Retail</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wholesale Bulk Summary Card */}
              <div className="bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-orange-500/10 p-6 sm:p-7 rounded-3xl border-2 border-amber-300 space-y-4 shadow-sm relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold shadow-md">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-stone-900">Bulk Wholesale Queries</h4>
                      <p className="text-xs text-amber-800 font-medium">B2B Boutique & Enterprise Sourcing</p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-[#C85A32] text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-200">
                    {stats.bulkShare}% Pipeline Share
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-4 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Total Bulk Revenue</span>
                    <span className="text-2xl font-black font-display text-[#C85A32]">₹{stats.bulkTotalValue.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{stats.bulkList.length} Inquiries Received</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Wholesale Volume</span>
                    <span className="text-2xl font-black font-display text-stone-900">{stats.bulkTotalUnits.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span></span>
                    <span className="text-[10px] text-amber-700 font-bold block mt-0.5">High Batch Demand</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Deal Size (AOV)</span>
                    <span className="text-xl font-black font-display text-stone-900">₹{stats.bulkAOV.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Wholesale Unit Price</span>
                    <span className="text-xl font-black font-display text-stone-900">₹{stats.bulkAvgUnitPrice}</span>
                  </div>
                </div>

                <div className="bg-amber-100/60 p-3.5 rounded-2xl text-xs text-amber-900 flex items-center justify-between border border-amber-200">
                  <span className="font-semibold flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-[#C85A32]" />
                    <span>Active Buyers: {stats.bulkList.map(b => b.buyerCompany || b.buyerName).slice(0, 3).join(', ') || 'N/A'}</span>
                  </span>
                </div>
              </div>

              {/* Direct Retail Summary Card */}
              <div className="bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-teal-500/10 p-6 sm:p-7 rounded-3xl border-2 border-emerald-300 space-y-4 shadow-sm relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-md">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-stone-900">Direct Retail Orders</h4>
                      <p className="text-xs text-emerald-800 font-medium">Consumer Storefront Purchases</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200">
                    {stats.directShare}% Pipeline Share
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Total Direct Revenue</span>
                    <span className="text-2xl font-black font-display text-emerald-800">₹{stats.directTotalValue.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{stats.directList.length} Orders Placed</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Retail Volume</span>
                    <span className="text-2xl font-black font-display text-stone-900">{stats.directTotalUnits.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span></span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Instant Checkout</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Order Value (AOV)</span>
                    <span className="text-xl font-black font-display text-stone-900">₹{stats.directAOV.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Retail Unit Price</span>
                    <span className="text-xl font-black font-display text-stone-900">₹{stats.directAvgUnitPrice}</span>
                  </div>
                </div>

                <div className="bg-emerald-100/60 p-3.5 rounded-2xl text-xs text-emerald-900 flex items-center justify-between border border-emerald-200">
                  <span className="font-semibold flex items-center space-x-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-700" />
                    <span>Recent Buyers: {stats.directList.map(d => d.buyerName).slice(0, 3).join(', ') || 'N/A'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Deal Status Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-3 shadow-sm">
              <h4 className="font-display font-bold text-sm text-stone-900 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-[#C85A32]" />
                <span>Real-Time Deal Status Pipeline Distribution</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {[
                  { label: 'New Received', count: stats.statusCounts.NEW, color: 'bg-amber-100 text-amber-900 border-amber-300' },
                  { label: 'Countered', count: stats.statusCounts.COUNTERED, color: 'bg-purple-100 text-purple-900 border-purple-300' },
                  { label: 'Accepted', count: stats.statusCounts.ACCEPTED, color: 'bg-blue-100 text-blue-900 border-blue-300' },
                  { label: 'Dispatched', count: stats.statusCounts.DISPATCHED, color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
                  { label: 'Completed', count: stats.statusCounts.COMPLETED, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { label: 'Declined', count: stats.statusCounts.DECLINED, color: 'bg-stone-100 text-stone-600 border-stone-300' }
                ].map((s) => (
                  <div key={s.label} className={`p-4 rounded-2xl border ${s.color} text-center`}>
                    <span className="text-2xl font-black font-display block">{s.count}</span>
                    <span className="text-[11px] font-bold block mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: VISUAL GRAPHS */}
        {(activeTab === 'all' || activeTab === 'graphs') && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#C85A32]" />
              <span>Interactive Graphical Visualizations</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Contribution Split Bar */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-extrabold text-base text-stone-900">Revenue Contribution Split</h4>
                    <p className="text-xs text-stone-500">Visual comparison of revenue streams</p>
                  </div>
                  <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                    Total: ₹{stats.grandTotalValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="h-10 w-full rounded-2xl bg-stone-100 p-1.5 flex overflow-hidden border border-stone-200 shadow-inner">
                    <div 
                      style={{ width: `${stats.bulkShare}%` }} 
                      className="h-full bg-gradient-to-r from-amber-500 to-[#C85A32] rounded-xl flex items-center justify-center text-white text-xs font-extrabold transition-all duration-500 shadow-xs"
                    >
                      {stats.bulkShare > 15 ? `${stats.bulkShare}% Wholesale` : ''}
                    </div>
                    <div 
                      style={{ width: `${stats.directShare}%` }} 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-extrabold transition-all duration-500 shadow-xs"
                    >
                      {stats.directShare > 15 ? `${stats.directShare}% Direct` : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <div className="flex items-center space-x-2 text-[#C85A32]">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      <span>Bulk Wholesale: ₹{stats.bulkTotalValue.toLocaleString('en-IN')} ({stats.bulkShare}%)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-800">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                      <span>Direct Retail: ₹{stats.directTotalValue.toLocaleString('en-IN')} ({stats.directShare}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparative Unit Price Graph */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
                <h4 className="font-display font-extrabold text-base text-stone-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <span>Realized Price Per Unit vs Deal Size</span>
                </h4>

                <div className="h-44 flex items-end justify-center space-x-16 pt-4 border-b border-stone-200 pb-2">
                  <div className="flex flex-col items-center space-y-1 group">
                    <span className="text-xs font-extrabold text-[#C85A32]">₹{stats.bulkAvgUnitPrice}</span>
                    <div 
                      style={{ height: `${Math.min(130, Math.max(25, (stats.bulkAvgUnitPrice / Math.max(stats.bulkAvgUnitPrice, stats.directAvgUnitPrice, 1)) * 120))}px` }}
                      className="w-16 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-2xl transition-all duration-500 group-hover:scale-105 shadow-md"
                    ></div>
                    <span className="text-xs font-bold text-stone-700">Bulk Unit Price</span>
                  </div>

                  <div className="flex flex-col items-center space-y-1 group">
                    <span className="text-xs font-extrabold text-emerald-700">₹{stats.directAvgUnitPrice}</span>
                    <div 
                      style={{ height: `${Math.min(130, Math.max(25, (stats.directAvgUnitPrice / Math.max(stats.bulkAvgUnitPrice, stats.directAvgUnitPrice, 1)) * 120))}px` }}
                      className="w-16 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-2xl transition-all duration-500 group-hover:scale-105 shadow-md"
                    ></div>
                    <span className="text-xs font-bold text-stone-700">Direct Unit Price</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: DIFFERENTIAL SECTION */}
        {(activeTab === 'all' || activeTab === 'diff') && (
          <div className="space-y-6">
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl space-y-2">
              <div className="flex items-center space-x-2 text-[#C85A32]">
                <Scale className="w-5 h-5" />
                <h4 className="font-display font-extrabold text-lg">Channel Differential Analysis</h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Analyzing key differences between Wholesale Bulk Queries and Direct Retail Consumer Orders across margin yield, batch volume scale, negotiation cycle speed, and cash realization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-stone-900 text-sm">1. Unit Price Discount Differential</h5>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Wholesale bulk orders average <span className="font-bold text-[#C85A32]">₹{stats.bulkAvgUnitPrice} / unit</span> versus <span className="font-bold text-emerald-700">₹{stats.directAvgUnitPrice} / unit</span> for direct retail. Bulk buyers receive wholesale volume discounts in exchange for guaranteed mass batch production.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-stone-900 text-sm">2. Order Scale & Batch Volume Scale</h5>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bulk queries account for <span className="font-bold text-stone-900">{stats.bulkTotalUnits} total units</span> ({stats.bulkList.length > 0 ? Math.round(stats.bulkTotalUnits / stats.bulkList.length) : 0} units / deal average), whereas Direct orders total <span className="font-bold text-stone-900">{stats.directTotalUnits} units</span> ({stats.directList.length > 0 ? (stats.directTotalUnits / stats.directList.length).toFixed(1) : 0} units / order average).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: SIDE-BY-SIDE COMPARISON MATRIX */}
        {(activeTab === 'all' || activeTab === 'comparison') && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
              <Percent className="w-5 h-5 text-[#C85A32]" />
              <span>Direct Side-by-Side Comparison Matrix</span>
            </h3>

            <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 text-xs uppercase font-extrabold tracking-wider border-b border-stone-200">
                    <th className="p-5">Financial & Operational Parameter</th>
                    <th className="p-5 bg-amber-500/10 text-[#C85A32]">Bulk Wholesale Queries 📦</th>
                    <th className="p-5 bg-emerald-500/10 text-emerald-900">Direct Retail Orders ⚡</th>
                    <th className="p-5">Strategic Advantage 💡</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-5 font-bold text-stone-900">Total Pipeline Monetary Value</td>
                    <td className="p-5 font-extrabold text-[#C85A32] bg-amber-50/50">₹{stats.bulkTotalValue.toLocaleString('en-IN')}</td>
                    <td className="p-5 font-extrabold text-emerald-800 bg-emerald-50/50">₹{stats.directTotalValue.toLocaleString('en-IN')}</td>
                    <td className="p-5 font-semibold text-stone-700">
                      {stats.bulkTotalValue >= stats.directTotalValue ? 'Bulk Wholesale (High Revenue)' : 'Direct Retail (Higher Retail)'}
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-5 font-bold text-stone-900">Total Transaction Count</td>
                    <td className="p-5 font-bold text-stone-800 bg-amber-50/50">{stats.bulkList.length} Inquiries</td>
                    <td className="p-5 font-bold text-stone-800 bg-emerald-50/50">{stats.directList.length} Orders</td>
                    <td className="p-5 font-semibold text-stone-700">
                      {stats.bulkList.length >= stats.directList.length ? 'Bulk (Higher Sourcing Demand)' : 'Direct (Higher Purchase Frequency)'}
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-5 font-bold text-stone-900">Total Craft Units Transacted</td>
                    <td className="p-5 font-bold text-stone-800 bg-amber-50/50">{stats.bulkTotalUnits} units</td>
                    <td className="p-5 font-bold text-stone-800 bg-emerald-50/50">{stats.directTotalUnits} units</td>
                    <td className="p-5 font-semibold text-stone-700">Bulk Wholesale (High Batch Volume)</td>
                  </tr>

                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-5 font-bold text-stone-900">Average Order Value (AOV)</td>
                    <td className="p-5 font-bold text-[#C85A32] bg-amber-50/50">₹{stats.bulkAOV.toLocaleString('en-IN')} / deal</td>
                    <td className="p-5 font-bold text-emerald-800 bg-emerald-50/50">₹{stats.directAOV.toLocaleString('en-IN')} / order</td>
                    <td className="p-5 font-semibold text-amber-900 font-bold">Bulk Wholesale (+{stats.directAOV > 0 ? Math.round(((stats.bulkAOV - stats.directAOV) / stats.directAOV) * 100) : 0}% AOV)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: MONEY & CASHFLOW AUDIT */}
        {(activeTab === 'all' || activeTab === 'money') && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-[#C85A32]" />
              <span>Full Money & Cashflow Audit</span>
            </h3>

            <div className="bg-gradient-to-r from-stone-900 via-[#4A2E1B] to-stone-900 text-white p-7 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Financial Liquidity</span>
                  <h4 className="font-display font-extrabold text-2xl text-white">Cashflow Realization Audit</h4>
                </div>
                <span className="text-3xl font-black font-display text-amber-300">
                  ₹{stats.grandTotalValue.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Realized Liquid Money</span>
                  <span className="text-3xl font-extrabold font-display text-emerald-400">₹{stats.realizedRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-stone-300 block">{stats.realizedPercent}% of total revenue collected</span>
                </div>

                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">In-Pipeline Pending Money</span>
                  <span className="text-3xl font-extrabold font-display text-amber-300">₹{stats.pendingPipeline.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-stone-300 block">{stats.pendingPercent}% currently in negotiation</span>
                </div>

                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Declined / Lost Value</span>
                  <span className="text-3xl font-extrabold font-display text-stone-400">₹{stats.declinedValue.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-stone-400 block">Declined wholesale queries</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
