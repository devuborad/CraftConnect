import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Zap, 
  Inbox, 
  Scale, 
  DollarSign, 
  Percent, 
  X, 
  Sparkles, 
  Layers, 
  Clock, 
  CreditCard,
  Copy,
  Check,
  Building2,
  PackageCheck,
  ShieldCheck,
  Download,
  Maximize2
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';
import type { BulkInquiry } from '../../types';
import { downloadAnalyticsPDF } from '../../pages/ArtisanAnalyticsPage';

interface PipelineAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: BulkInquiry[];
}

type TabType = 'overview' | 'graphs' | 'diff' | 'comparison' | 'money';

export const PipelineAnalyticsModal: React.FC<PipelineAnalyticsModalProps> = ({
  isOpen,
  onClose,
  inquiries
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);

  // Filter & Compute Real-Time Statistics from Live Inquiries
  const stats = useMemo(() => {
    const bulkList = inquiries.filter((i) => i.type !== 'DIRECT_ORDER');
    const directList = inquiries.filter((i) => i.type === 'DIRECT_ORDER');

    // Financial calculations
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

    // Realized vs Pipeline (Pending) Money
    const isCompleted = (i: BulkInquiry) => i.status === 'COMPLETED' || i.status === 'DISPATCHED';
    const isPending = (i: BulkInquiry) => i.status === 'NEW' || i.status === 'COUNTERED' || i.status === 'ACCEPTED';
    
    const realizedRevenue = inquiries.filter(isCompleted).reduce((sum, i) => sum + getVal(i), 0);
    const pendingPipeline = inquiries.filter(isPending).reduce((sum, i) => sum + getVal(i), 0);
    const declinedValue = inquiries.filter((i) => i.status === 'DECLINED').reduce((sum, i) => sum + getVal(i), 0);

    const realizedPercent = grandTotalValue > 0 ? Math.round((realizedRevenue / grandTotalValue) * 100) : 0;
    const pendingPercent = grandTotalValue > 0 ? Math.round((pendingPipeline / grandTotalValue) * 100) : 0;

    // Shares
    const bulkShare = grandTotalValue > 0 ? Math.round((bulkTotalValue / grandTotalValue) * 100) : 0;
    const directShare = grandTotalValue > 0 ? Math.round((directTotalValue / grandTotalValue) * 100) : 0;

    // Status distributions
    const statusCounts = {
      NEW: inquiries.filter((i) => i.status === 'NEW').length,
      COUNTERED: inquiries.filter((i) => i.status === 'COUNTERED').length,
      ACCEPTED: inquiries.filter((i) => i.status === 'ACCEPTED').length,
      DISPATCHED: inquiries.filter((i) => i.status === 'DISPATCHED').length,
      COMPLETED: inquiries.filter((i) => i.status === 'COMPLETED').length,
      DECLINED: inquiries.filter((i) => i.status === 'DECLINED').length
    };

    // Payment methods breakdown
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

  if (!isOpen) return null;

  const copySummaryReport = () => {
    const text = `
=== CRAFTCONNECT REAL-TIME PIPELINE & FINANCIAL ANALYTICS ===
Timestamp: ${new Date().toLocaleString()}
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
=============================================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="relative w-full max-w-5xl bg-stone-50 rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A2E1B] via-stone-900 to-[#C85A32] text-white p-6 sm:p-7 shrink-0 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>REAL-TIME BUYER FINANCIAL ANALYTICS</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                    Live Data Linked
                  </span>
                </div>

                <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-amber-50">
                  Pipeline & Financial Studio
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/80">
                  In-depth real-time analysis of wholesale bulk queries versus direct consumer marketplace orders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => downloadAnalyticsPDF(stats, 'Artisan Studio')}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                  title="Download Analysis PDF Report"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/artisan/analytics';
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                  title="Expand to Full Page Studio"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Page</span>
                </button>

                <button
                  onClick={copySummaryReport}
                  className="bg-white/10 hover:bg-white/20 text-amber-100 border border-white/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Copy formatted summary"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Export Text'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-100 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Quick KPI Strip in Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-amber-500/20">
              <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Total Pipeline Value</span>
                <span className="text-xl sm:text-2xl font-black font-display text-white">₹{stats.grandTotalValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Realized Cash</span>
                <span className="text-xl sm:text-2xl font-black font-display text-emerald-300">₹{stats.realizedRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Bulk Wholesale Value</span>
                <span className="text-xl sm:text-2xl font-black font-display text-amber-300">₹{stats.bulkTotalValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-amber-200/70 font-semibold uppercase tracking-wider block">Direct Retail Value</span>
                <span className="text-xl sm:text-2xl font-black font-display text-emerald-200">₹{stats.directTotalValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 pt-3 flex space-x-2 overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: 'overview', label: '📊 Summary Overview', icon: Layers },
              { id: 'graphs', label: '📈 Visual Graphs', icon: BarChart3 },
              { id: 'diff', label: '⚡ Differential Section', icon: Scale },
              { id: 'comparison', label: '⚖️ Side-by-Side Comparison', icon: Percent },
              { id: 'money', label: '💰 Money & Cashflow', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-2xl flex items-center space-x-2 border-t-2 border-x transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-stone-50 border-t-[#C85A32] border-x-stone-200 text-[#4A2E1B] shadow-sm -mb-px'
                      : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C85A32]' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">

            {/* TAB 1: SUMMARY OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 2 Column Cards: Bulk Queries vs Direct Orders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Bulk Inquiries Summary Card */}
                  <div className="bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-orange-500/10 p-6 rounded-3xl border-2 border-amber-300 space-y-4 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold shadow-md">
                          <Inbox className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-lg text-stone-900">Bulk Wholesale Queries</h3>
                          <p className="text-xs text-amber-800 font-medium">B2B Boutique & Enterprise RFQs</p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-[#C85A32] text-xs font-black px-3 py-1 rounded-full border border-amber-200">
                        {stats.bulkShare}% Pipeline Share
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Total Bulk Revenue</span>
                        <span className="text-xl font-extrabold font-display text-[#C85A32]">₹{stats.bulkTotalValue.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">{stats.bulkList.length} Inquiries Received</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Wholesale Volume</span>
                        <span className="text-xl font-extrabold font-display text-stone-900">{stats.bulkTotalUnits.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span></span>
                        <span className="text-[10px] text-amber-700 font-bold block mt-0.5">High Batch Demand</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Deal Size (AOV)</span>
                        <span className="text-lg font-extrabold font-display text-stone-900">₹{stats.bulkAOV.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Wholesale Unit Price</span>
                        <span className="text-lg font-extrabold font-display text-stone-900">₹{stats.bulkAvgUnitPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="bg-amber-100/60 p-3 rounded-2xl text-xs text-amber-900 flex items-center justify-between border border-amber-200">
                      <span className="font-semibold flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>Active Buyers: {stats.bulkList.map(b => b.buyerCompany || b.buyerName).slice(0, 2).join(', ') || 'N/A'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Direct Orders Summary Card */}
                  <div className="bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-teal-500/10 p-6 rounded-3xl border-2 border-emerald-300 space-y-4 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-md">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-lg text-stone-900">Direct Retail Orders</h3>
                          <p className="text-xs text-emerald-800 font-medium">Consumer Storefront Purchases</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                        {stats.directShare}% Pipeline Share
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Total Direct Revenue</span>
                        <span className="text-xl font-extrabold font-display text-emerald-800">₹{stats.directTotalValue.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">{stats.directList.length} Orders Placed</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Retail Volume</span>
                        <span className="text-xl font-extrabold font-display text-stone-900">{stats.directTotalUnits.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span></span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Instant Checkout</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Order Value (AOV)</span>
                        <span className="text-lg font-extrabold font-display text-stone-900">₹{stats.directAOV.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">Avg Retail Unit Price</span>
                        <span className="text-lg font-extrabold font-display text-stone-900">₹{stats.directAvgUnitPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-100/60 p-3 rounded-2xl text-xs text-emerald-900 flex items-center justify-between border border-emerald-200">
                      <span className="font-semibold flex items-center space-x-1">
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Recent Buyers: {stats.directList.map(d => d.buyerName).slice(0, 2).join(', ') || 'N/A'}</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* Status Distribution Pills */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
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
                      <div key={s.label} className={`p-3 rounded-2xl border ${s.color} text-center`}>
                        <span className="text-xl font-extrabold font-display block">{s.count}</span>
                        <span className="text-[10px] font-bold block">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL GRAPHS & CHARTS */}
            {activeTab === 'graphs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Revenue Share Comparison Graph */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-base text-stone-900 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-[#C85A32]" />
                        <span>Revenue Contribution Split (Bulk vs Direct)</span>
                      </h4>
                      <p className="text-xs text-stone-500">Visual comparison of money inflow by sales stream</p>
                    </div>
                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                      Total: ₹{stats.grandTotalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Horizontal Bar Visual Representation */}
                  <div className="space-y-2 pt-2">
                    <div className="h-8 w-full rounded-2xl bg-stone-100 p-1 flex overflow-hidden border border-stone-200 shadow-inner">
                      <div 
                        style={{ width: `${stats.bulkShare}%` }} 
                        className="h-full bg-gradient-to-r from-amber-500 to-[#C85A32] rounded-xl flex items-center justify-center text-white text-[11px] font-extrabold transition-all duration-500 shadow-xs"
                      >
                        {stats.bulkShare > 15 ? `${stats.bulkShare}% Wholesale` : ''}
                      </div>
                      <div 
                        style={{ width: `${stats.directShare}%` }} 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-[11px] font-extrabold transition-all duration-500 shadow-xs"
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

                {/* SVG Comparative Bar Chart */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                  <h4 className="font-display font-extrabold text-base text-stone-900 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span>Average Unit Price & Ticket Size Comparison</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Unit Price Graph */}
                    <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                      <span className="text-xs font-bold text-stone-700 block">Avg Realized Price Per Unit (₹)</span>
                      
                      <div className="h-40 flex items-end justify-center space-x-12 pt-4 border-b border-stone-300 pb-2">
                        {/* Bulk Bar */}
                        <div className="flex flex-col items-center space-y-1 group">
                          <span className="text-xs font-extrabold text-[#C85A32]">₹{stats.bulkAvgUnitPrice}</span>
                          <div 
                            style={{ height: `${Math.min(120, Math.max(20, (stats.bulkAvgUnitPrice / Math.max(stats.bulkAvgUnitPrice, stats.directAvgUnitPrice, 1)) * 110))}px` }}
                            className="w-14 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xl transition-all duration-500 group-hover:scale-105 shadow-md"
                          ></div>
                          <span className="text-[11px] font-bold text-stone-600">Bulk Unit</span>
                        </div>

                        {/* Direct Bar */}
                        <div className="flex flex-col items-center space-y-1 group">
                          <span className="text-xs font-extrabold text-emerald-700">₹{stats.directAvgUnitPrice}</span>
                          <div 
                            style={{ height: `${Math.min(120, Math.max(20, (stats.directAvgUnitPrice / Math.max(stats.bulkAvgUnitPrice, stats.directAvgUnitPrice, 1)) * 110))}px` }}
                            className="w-14 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-500 group-hover:scale-105 shadow-md"
                          ></div>
                          <span className="text-[11px] font-bold text-stone-600">Direct Unit</span>
                        </div>
                      </div>
                    </div>

                    {/* AOV Graph */}
                    <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                      <span className="text-xs font-bold text-stone-700 block">Average Order Value / Deal Size (AOV)</span>
                      
                      <div className="h-40 flex items-end justify-center space-x-12 pt-4 border-b border-stone-300 pb-2">
                        {/* Bulk AOV Bar */}
                        <div className="flex flex-col items-center space-y-1 group">
                          <span className="text-xs font-extrabold text-[#C85A32]">₹{stats.bulkAOV.toLocaleString('en-IN')}</span>
                          <div 
                            style={{ height: `${Math.min(120, Math.max(20, (stats.bulkAOV / Math.max(stats.bulkAOV, stats.directAOV, 1)) * 110))}px` }}
                            className="w-14 bg-gradient-to-t from-amber-700 to-orange-500 rounded-t-xl transition-all duration-500 group-hover:scale-105 shadow-md"
                          ></div>
                          <span className="text-[11px] font-bold text-stone-600">Bulk AOV</span>
                        </div>

                        {/* Direct AOV Bar */}
                        <div className="flex flex-col items-center space-y-1 group">
                          <span className="text-xs font-extrabold text-emerald-700">₹{stats.directAOV.toLocaleString('en-IN')}</span>
                          <div 
                            style={{ height: `${Math.min(120, Math.max(20, (stats.directAOV / Math.max(stats.bulkAOV, stats.directAOV, 1)) * 110))}px` }}
                            className="w-14 bg-gradient-to-t from-emerald-700 to-teal-500 rounded-t-xl transition-all duration-500 group-hover:scale-105 shadow-md"
                          ></div>
                          <span className="text-[11px] font-bold text-stone-600">Direct AOV</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DIFFERENTIAL SECTION */}
            {activeTab === 'diff' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center space-x-2 text-[#C85A32]">
                    <Scale className="w-5 h-5" />
                    <h4 className="font-display font-extrabold text-base">Key Channel Differential Breakdown</h4>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Analyzing how Wholesale Bulk Inquiries differ from Direct Consumer Orders across financial yield, volume capacity, negotiation lead-time, and cash realization speed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Differential Card 1: Unit Price & Discount Variance */}
                  <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
                      <Percent className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-stone-900 text-sm">1. Unit Price Discount Differential</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Wholesale bulk orders average <span className="font-bold text-[#C85A32]">₹{stats.bulkAvgUnitPrice} / unit</span> versus <span className="font-bold text-emerald-700">₹{stats.directAvgUnitPrice} / unit</span> for direct retail. Bulk buyers receive bulk volume discounts in exchange for guaranteed large batch orders.
                    </p>
                    <div className="bg-stone-50 p-2.5 rounded-xl text-[11px] font-semibold text-stone-700 border border-stone-200">
                      💡 Pricing Margin Variance: ~{stats.directAvgUnitPrice > 0 ? Math.round(((stats.directAvgUnitPrice - stats.bulkAvgUnitPrice) / stats.directAvgUnitPrice) * 100) : 0}% Wholesale Discount Provided
                    </div>
                  </div>

                  {/* Differential Card 2: Batch Volume Scale */}
                  <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-stone-900 text-sm">2. Order Scale & Batch Volume Differential</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Bulk queries account for <span className="font-bold text-stone-900">{stats.bulkTotalUnits} total units</span> ({stats.bulkList.length > 0 ? Math.round(stats.bulkTotalUnits / stats.bulkList.length) : 0} units / order average), whereas Direct orders total <span className="font-bold text-stone-900">{stats.directTotalUnits} units</span> ({stats.directList.length > 0 ? (stats.directTotalUnits / stats.directList.length).toFixed(1) : 0} units / order average).
                    </p>
                    <div className="bg-stone-50 p-2.5 rounded-xl text-[11px] font-semibold text-stone-700 border border-stone-200">
                      📦 Batch Volume Ratio: Bulk orders generate ~{stats.directTotalUnits > 0 ? Math.round(stats.bulkTotalUnits / stats.directTotalUnits) : 1}x more unit volume.
                    </div>
                  </div>

                  {/* Differential Card 3: Negotiation Lifecycle */}
                  <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                    <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-stone-900 text-sm">3. Sales Cycle & Negotiation Speed</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Direct consumer orders skip negotiation and checkout instantly. Bulk inquiries require multi-step negotiation (Target Price, Counter Offers, Dispatch timeline agreements).
                    </p>
                    <div className="bg-stone-50 p-2.5 rounded-xl text-[11px] font-semibold text-stone-700 border border-stone-200">
                      ⏱️ Velocity: Direct = Instant Conversion | Bulk = High-Touch B2B Negotiation
                    </div>
                  </div>

                  {/* Differential Card 4: Cashflow Security */}
                  <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                    <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-stone-900 text-sm">4. Cash Realization & Payment Terms</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Direct purchases are 100% pre-paid via online checkout, providing instant cashflow. Bulk wholesale orders typically involve invoice milestones or partial advance deposits.
                    </p>
                    <div className="bg-stone-50 p-2.5 rounded-xl text-[11px] font-semibold text-stone-700 border border-stone-200">
                      💳 Liquid Cash Realization Rate: {stats.realizedPercent}% of overall pipeline is liquid/completed.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SIDE-BY-SIDE COMPARISON MATRIX */}
            {activeTab === 'comparison' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-extrabold text-base text-stone-900 flex items-center space-x-2">
                    <Percent className="w-5 h-5 text-[#C85A32]" />
                    <span>Direct Channel Comparison Matrix</span>
                  </h4>
                  <span className="text-xs text-stone-500 font-medium">Real-time parameters derived from active buyer database</span>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 text-xs uppercase font-extrabold tracking-wider border-b border-stone-200">
                        <th className="p-4 sm:p-5">Financial & Operational Parameter</th>
                        <th className="p-4 sm:p-5 bg-amber-500/10 text-[#C85A32]">Bulk Wholesale Queries 📦</th>
                        <th className="p-4 sm:p-5 bg-emerald-500/10 text-emerald-900">Direct Retail Orders ⚡</th>
                        <th className="p-4 sm:p-5">Winning Advantage 💡</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Total Pipeline Monetary Value</td>
                        <td className="p-4 font-extrabold text-[#C85A32] bg-amber-50/50">₹{stats.bulkTotalValue.toLocaleString('en-IN')}</td>
                        <td className="p-4 font-extrabold text-emerald-800 bg-emerald-50/50">₹{stats.directTotalValue.toLocaleString('en-IN')}</td>
                        <td className="p-4 font-semibold text-stone-700">
                          {stats.bulkTotalValue >= stats.directTotalValue ? 'Bulk Wholesale (High Revenue)' : 'Direct Retail (Higher Retail)'}
                        </td>
                      </tr>

                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Total Transaction Count</td>
                        <td className="p-4 font-bold text-stone-800 bg-amber-50/50">{stats.bulkList.length} Inquiries</td>
                        <td className="p-4 font-bold text-stone-800 bg-emerald-50/50">{stats.directList.length} Orders</td>
                        <td className="p-4 font-semibold text-stone-700">
                          {stats.bulkList.length >= stats.directList.length ? 'Bulk (Higher Lead Inflow)' : 'Direct (Higher Purchase Frequency)'}
                        </td>
                      </tr>

                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Total Craft Units Transacted</td>
                        <td className="p-4 font-bold text-stone-800 bg-amber-50/50">{stats.bulkTotalUnits} units</td>
                        <td className="p-4 font-bold text-stone-800 bg-emerald-50/50">{stats.directTotalUnits} units</td>
                        <td className="p-4 font-semibold text-stone-700">Bulk Wholesale (Mass Production)</td>
                      </tr>

                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Average Order Value (AOV)</td>
                        <td className="p-4 font-bold text-[#C85A32] bg-amber-50/50">₹{stats.bulkAOV.toLocaleString('en-IN')} / deal</td>
                        <td className="p-4 font-bold text-emerald-800 bg-emerald-50/50">₹{stats.directAOV.toLocaleString('en-IN')} / order</td>
                        <td className="p-4 font-semibold text-amber-900 font-bold">Bulk Wholesale (+{stats.directAOV > 0 ? Math.round(((stats.bulkAOV - stats.directAOV) / stats.directAOV) * 100) : 0}% AOV)</td>
                      </tr>

                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Average Price Realized Per Unit</td>
                        <td className="p-4 font-bold text-stone-800 bg-amber-50/50">₹{stats.bulkAvgUnitPrice} / unit</td>
                        <td className="p-4 font-bold text-emerald-800 bg-emerald-50/50">₹{stats.directAvgUnitPrice} / unit</td>
                        <td className="p-4 font-semibold text-emerald-900 font-bold">Direct Retail (Maximum Profit Margin)</td>
                      </tr>

                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Customer Segment Profile</td>
                        <td className="p-4 text-stone-700 bg-amber-50/50">Retail Boutiques, Exporters & Corporate Buyers</td>
                        <td className="p-4 text-stone-700 bg-emerald-50/50">Individual Art Collectors & Home Decor Consumers</td>
                        <td className="p-4 font-semibold text-stone-700">Diversified Dual-Channel Strategy</td>
                      </tr>

                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 font-bold text-stone-900">Sales Conversion & Lead Time</td>
                        <td className="p-4 text-stone-700 bg-amber-50/50">Requires Negotiation (2-5 Days)</td>
                        <td className="p-4 text-stone-700 bg-emerald-50/50">Instant Checkout (Immediate)</td>
                        <td className="p-4 font-semibold text-emerald-800">Direct Retail (Instant Cash)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: MONEY & CASHFLOW AUDIT */}
            {activeTab === 'money' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Money Realization Breakdown */}
                <div className="bg-gradient-to-r from-stone-900 via-[#4A2E1B] to-stone-900 text-white p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Financial Audit</span>
                      <h4 className="font-display font-extrabold text-xl text-white">Full Money Flow & Cash Analysis</h4>
                    </div>
                    <span className="text-2xl font-black font-display text-amber-300">
                      ₹{stats.grandTotalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Realized Liquid Money</span>
                      <span className="text-2xl font-extrabold font-display text-emerald-400">₹{stats.realizedRevenue.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-stone-300 block">{stats.realizedPercent}% of total revenue collected</span>
                    </div>

                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">In-Pipeline Pending Money</span>
                      <span className="text-2xl font-extrabold font-display text-amber-300">₹{stats.pendingPipeline.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-stone-300 block">{stats.pendingPercent}% currently in negotiation/dispatch</span>
                    </div>

                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Declined / Lost Pipeline</span>
                      <span className="text-2xl font-extrabold font-display text-stone-400">₹{stats.declinedValue.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-stone-400 block">Declined wholesale queries</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Distribution */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                  <h4 className="font-display font-extrabold text-base text-stone-900 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-[#C85A32]" />
                    <span>Payment Channel Breakdown</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(stats.paymentBreakdown).map(([method, amount]) => (
                      <div key={method} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                        <span className="text-xs font-bold text-stone-600 block">{method}</span>
                        <span className="text-lg font-black font-display text-stone-900">₹{amount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-stone-400 block">
                          {stats.grandTotalValue > 0 ? Math.round((amount / stats.grandTotalValue) * 100) : 0}% of total volume
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="bg-stone-100 border-t border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2 text-xs text-stone-500 font-medium">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <span>Calculated live from active buyer database. Updates instantly when buyers order.</span>
            </div>

            <button
              onClick={onClose}
              className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer text-center"
            >
              Close Studio
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
};
