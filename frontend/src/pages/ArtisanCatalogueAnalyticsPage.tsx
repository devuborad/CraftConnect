import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  PlusCircle, 
  ArrowLeft, 
  Eye, 
  Layers, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  RefreshCw,
  Camera,
  Mic,
  Calculator,
  Tag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { productService } from '../services/products';
import type { Product } from '../types';
import { downloadCataloguePDF } from '../utils/pdfExport';

export const ArtisanCatalogueAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role, showToast, userName } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'valuation' | 'ai' | 'items'>('all');
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const all = await productService.getProducts();
    const artisanProds = all.filter(
      (p) => p.artisanId === currentUser?.id || p.artisanName?.toLowerCase() === currentUser?.name?.toLowerCase()
    );
    setProducts(artisanProds.length > 0 ? artisanProds : all.slice(0, 4));
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in to access your Catalogue Studio.', 'warning');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/catalogue-analytics' } });
      return;
    }
    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'craft_live_products' || !e.key) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadData);
    };
  }, [currentUser, role, navigate, showToast]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const publishedCount = products.filter((p) => (p.status || 'Published') === 'Published').length;
    const pendingCount = products.filter((p) => p.status === 'Pending').length;
    const draftCount = products.filter((p) => p.status === 'Draft').length;

    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock !== undefined ? p.stock : 10), 0);
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + ((p.stock !== undefined ? p.stock : 10) * p.price),
      0
    );

    const avgProductPrice = totalProducts > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / totalProducts) : 0;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const aiEnhancedCount = products.filter((p) => p.isAiEnhanced || p.enhancedImage).length;

    // Category breakdown
    const categoryBreakdown = products.reduce((acc, p) => {
      const cat = p.category || 'Handicrafts';
      if (!acc[cat]) {
        acc[cat] = { count: 0, stock: 0, value: 0 };
      }
      acc[cat].count += 1;
      const stock = p.stock !== undefined ? p.stock : 10;
      acc[cat].stock += stock;
      acc[cat].value += (stock * p.price);
      return acc;
    }, {} as Record<string, { count: number; stock: number; value: number }>);

    return {
      totalProducts,
      publishedCount,
      pendingCount,
      draftCount,
      totalStockUnits,
      totalInventoryValue,
      avgProductPrice,
      totalViews,
      aiEnhancedCount,
      categoryBreakdown
    };
  }, [products]);

  const handleExportPDF = () => {
    downloadCataloguePDF(stats, products, userName);
    showToast('Downloading Catalogue PDF 📄', 'Generated full inventory valuation audit.', 'success');
  };

  const copySummaryText = () => {
    const text = `
=== CRAFTCONNECT CATALOGUE & INVENTORY AUDIT ===
Timestamp: ${new Date().toLocaleString()}
Artisan: ${userName}
Total Catalogue Products: ${stats.totalProducts} (${stats.publishedCount} Published Live)
Total Stock Inventory: ${stats.totalStockUnits} units
Total Inventory Value: ₹${stats.totalInventoryValue.toLocaleString('en-IN')}
Average Unit Price: ₹${stats.avgProductPrice.toLocaleString('en-IN')}
AI Enhanced Products: ${stats.aiEnhancedCount} items
================================================
`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-[#C85A32] to-orange-700 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Link
                to="/artisan/dashboard"
                className="bg-white/10 hover:bg-white/20 text-amber-100 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>

              <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block mr-1"></span>
                Live Products Linked
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Catalogue & Inventory Studio
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl">
              Real-time craft catalogue management, inventory valuation audit, category distribution, and AI enhancement metrics.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-white text-stone-900 hover:bg-amber-50 font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C85A32]" />
              <span>📄 Download Catalogue PDF</span>
            </button>

            <Link
              to="/artisan/products/new"
              className="bg-stone-900 hover:bg-black text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>+ Add New Product</span>
            </Link>

            <button
              onClick={copySummaryText}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Export Text'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip in Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-amber-400/30 relative z-10">
          <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-100/80 font-semibold uppercase tracking-wider block">Total Catalogue Items</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-white">{stats.totalProducts}</span>
            <span className="text-[10px] text-emerald-200 block mt-1">{stats.publishedCount} Published Live</span>
          </div>

          <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-100/80 font-semibold uppercase tracking-wider block">Total Stock Inventory</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-amber-200">{stats.totalStockUnits} <span className="text-xs font-normal">units</span></span>
            <span className="text-[10px] text-amber-100/70 block mt-1">Available Live Units</span>
          </div>

          <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-100/80 font-semibold uppercase tracking-wider block">Total Inventory Value</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-white">₹{stats.totalInventoryValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-amber-100/70 block mt-1">Potential Craft Revenue</span>
          </div>

          <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-100/80 font-semibold uppercase tracking-wider block">Avg Item Price</span>
            <span className="text-2xl sm:text-3xl font-black font-display text-white">₹{stats.avgProductPrice.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-amber-100/70 block mt-1">{stats.aiEnhancedCount} AI Enhanced</span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: '🌟 Full 360° Catalogue View' },
          { id: 'overview', label: '📊 Status & Category Overview' },
          { id: 'valuation', label: '📈 Stock & Valuation Analysis' },
          { id: 'ai', label: '🤖 AI Studio Analytics' },
          { id: 'items', label: '📦 Product Inventory Listing' }
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

      {/* Body Sections */}
      <div className="space-y-8">

        {/* SECTION 1: STATUS & CATEGORY OVERVIEW */}
        {(activeTab === 'all' || activeTab === 'overview') && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#C85A32]" />
              <span>Category Distribution & Status Overview</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Published Live Card */}
              <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">Status: Published</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-display text-emerald-900">{stats.publishedCount}</span>
                  <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">Live Marketplace</span>
                </div>
                <p className="text-xs text-emerald-700">Visible to global buyers and wholesale boutique buyers.</p>
              </div>

              {/* Pending / Review Card */}
              <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">Status: Pending Review</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-display text-amber-900">{stats.pendingCount}</span>
                  <span className="bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">In AI Verification</span>
                </div>
                <p className="text-xs text-amber-700">Awaiting AI background cleanup or translation check.</p>
              </div>

              {/* Stock Inventory Value Card */}
              <div className="bg-stone-900 text-white p-6 rounded-3xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">Live Inventory Valuation</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-display text-amber-300">₹{stats.totalInventoryValue.toLocaleString('en-IN')}</span>
                  <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">{stats.totalStockUnits} Units</span>
                </div>
                <p className="text-xs text-stone-300">Total estimated craft value across active stock.</p>
              </div>
            </div>

            {/* Category Split Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
              <h4 className="font-display font-extrabold text-base text-stone-900 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-[#C85A32]" />
                <span>Craft Category Breakdown</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(stats.categoryBreakdown).map(([category, catData]) => (
                  <div key={category} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-900 text-sm">{category}</span>
                      <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {catData.count} items
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Stock: {catData.stock} units</span>
                      <span className="font-bold text-stone-900">₹{catData.value.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCT INVENTORY LISTING */}
        {(activeTab === 'all' || activeTab === 'items') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
                <Package className="w-5 h-5 text-[#C85A32]" />
                <span>Product Inventory Listing & Valuation Table</span>
              </h3>

              <Link
                to="/artisan/products/new"
                className="text-xs font-bold text-[#C85A32] hover:underline flex items-center space-x-1"
              >
                <span>+ Add Product</span>
              </Link>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 text-xs uppercase font-extrabold tracking-wider border-b border-stone-200">
                    <th className="p-4 sm:p-5">Product Details</th>
                    <th className="p-4 sm:p-5">Category & Craft</th>
                    <th className="p-4 sm:p-5">Status</th>
                    <th className="p-4 sm:p-5">Available Stock</th>
                    <th className="p-4 sm:p-5">Unit Price (₹)</th>
                    <th className="p-4 sm:p-5">Total Inventory Value</th>
                    <th className="p-4 sm:p-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                  {products.map((p) => {
                    const stock = p.stock !== undefined ? p.stock : 10;
                    const itemValue = stock * p.price;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 sm:p-5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.originalImage}
                              alt={p.title}
                              className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0 bg-stone-100"
                            />
                            <div>
                              <span className="font-extrabold text-stone-900 block truncate max-w-[200px]">{p.title}</span>
                              <span className="text-[10px] text-stone-400 font-medium block">ID: {p.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 sm:p-5">
                          <span className="font-semibold text-stone-800 block">{p.category || 'Handicrafts'}</span>
                          <span className="text-[10px] text-stone-500 block">{p.material || p.craftType}</span>
                        </td>

                        <td className="p-4 sm:p-5">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md">
                            {p.status || 'Published'}
                          </span>
                        </td>

                        <td className="p-4 sm:p-5 font-bold text-stone-900">
                          {stock} units
                        </td>

                        <td className="p-4 sm:p-5 font-extrabold text-stone-900">
                          ₹{p.price.toLocaleString('en-IN')}
                        </td>

                        <td className="p-4 sm:p-5 font-black text-[#C85A32]">
                          ₹{itemValue.toLocaleString('en-IN')}
                        </td>

                        <td className="p-4 sm:p-5">
                          <Link
                            to={`/product/${p.id}`}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 inline-flex items-center space-x-1 font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
