import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Camera, 
  Mic, 
  Calculator, 
  Eye, 
  TrendingUp, 
  Sparkles, 
  Share2,
  User,
  Building2,
  Award,
  Package,
  Inbox,
  ShoppingBag,
  Zap,
  ArrowRight,
  History
} from 'lucide-react';
import { productService } from '../services/products';
import { inquiryService } from '../services/inquiries';
import type { Product, BulkInquiry } from '../types';
import { useApp } from '../context/AppContext';

export const ArtisanDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, showToast, userName } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products and real inquiries
  const loadDashboardData = async () => {
    setLoading(true);
    const [allProducts, allInquiries] = await Promise.all([
      productService.getProducts(),
      inquiryService.getInquiriesByArtisan(currentUser?.id, currentUser?.name)
    ]);

    // Filter products for this artisan, fallback to catalogue
    const artisanProds = allProducts.filter(
      (p) => p.artisanId === currentUser?.id || p.artisanName?.toLowerCase() === currentUser?.name?.toLowerCase()
    );
    setProducts(artisanProds.length > 0 ? artisanProds : allProducts.slice(0, 4));
    setInquiries(allInquiries);
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in to access your Artisan Dashboard.', 'warning');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/dashboard' } });
      return;
    }
    loadDashboardData();

    // Listen for real-time buyer order updates across browser tabs & window focus
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'craft_live_inquiries_orders' || !e.key) {
        loadDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadDashboardData);

    // Periodic sync interval for instant real-time live buyer updates
    const intervalId = setInterval(loadDashboardData, 4000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadDashboardData);
      clearInterval(intervalId);
    };
  }, [currentUser, role, navigate, showToast]);

  // Separate active wholesale inquiries, active direct orders, and completed history
  const activeWholesale = inquiries.filter(
    (i) => i.type !== 'DIRECT_ORDER' && !i.isArchived && i.status !== 'DISPATCHED' && i.status !== 'DECLINED'
  );
  const activeOrders = inquiries.filter(
    (i) => i.type === 'DIRECT_ORDER' && !i.isArchived && i.status !== 'DISPATCHED' && i.status !== 'DECLINED'
  );
  const historyRecords = inquiries.filter(
    (i) => i.isArchived || i.status === 'DISPATCHED' || i.status === 'DECLINED' || i.status === 'COMPLETED'
  );
  const totalOrderValue = inquiries.reduce(
    (acc, curr) => acc + (curr.totalAmount || curr.quantity * curr.targetPrice),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Dashboard Greeting Header */}
      <div className="glass-card bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-900/10 p-6 sm:p-8 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-5">
          {/* Artisan Profile Picture / Company Logo */}
          <Link to="/artisan/profile" className="shrink-0 relative group" title="Click to view/edit profile & photo">
            <img
              src={currentUser?.avatar || currentUser?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
              alt={userName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
              Edit
            </div>
          </Link>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ARTISAN STUDIO DASHBOARD</span>
              </div>
              {currentUser?.businessName && (
                <div className="inline-flex items-center space-x-1.5 bg-white text-stone-700 text-xs font-bold px-3 py-1 rounded-full border border-stone-200 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{currentUser.businessName}</span>
                </div>
              )}
              {currentUser?.experienceYears && (
                <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentUser.experienceYears} Years Master</span>
                </div>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900">
              Good morning, {userName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Manage your craft catalogue, active wholesale buyer inquiries, direct orders, and completed history.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/artisan/profile"
            className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all shrink-0 hover:border-[#C85A32]"
          >
            <User className="w-4 h-4 text-[#C85A32]" />
            <span>View Profile</span>
          </Link>

          <Link
            to="/artisan/products/new"
            className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all shrink-0 hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Bordered Stats Grid with 5 Focused KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products / Catalogue Card - Links to Full Page Catalogue Studio */}
        <Link
          to="/artisan/catalogue-analytics"
          className="glass-card bg-amber-50/20 hover:bg-amber-50/50 p-5 rounded-3xl border-2 border-stone-200 hover:border-[#C85A32]/70 space-y-2 shadow-sm transition-all group block relative overflow-hidden"
          title="Click to view detailed catalogue valuation & inventory studio"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider group-hover:text-[#C85A32] transition-colors">Catalogue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 group-hover:bg-[#C85A32] text-[#C85A32] group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-sm relative">
              <Package className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 group-hover:text-[#C85A32] transition-colors">{products.length}</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{products.filter((p) => (p.status || 'Published') === 'Published').length} Published Live</span>
              </p>
              <span className="text-[10px] font-bold text-[#C85A32] group-hover:underline flex items-center space-x-0.5">
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>

        {/* Active Bulk Inquiries Card */}
        <Link
          to="/artisan/inquiries"
          className="glass-card bg-amber-50/30 hover:bg-amber-50/60 p-5 rounded-3xl border-2 border-amber-300/90 space-y-2 shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider">Bulk Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-[#C85A32] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-[#C85A32]">{activeWholesale.length}</p>
              {activeWholesale.filter((i) => i.status === 'NEW').length > 0 && (
                <span className="text-[10px] font-bold bg-[#C85A32] text-white px-2 py-0.5 rounded-full">
                  {activeWholesale.filter((i) => i.status === 'NEW').length} New
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#C85A32] font-bold flex items-center space-x-1 mt-0.5">
              <span>View Wholesale Inbox</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Active Direct Orders Card */}
        <Link
          to="/artisan/orders"
          className="glass-card bg-emerald-50/30 hover:bg-emerald-50/60 p-5 rounded-3xl border-2 border-emerald-300/90 space-y-2 shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider">Direct Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-800">{activeOrders.length}</p>
              {activeOrders.filter((i) => i.status === 'NEW').length > 0 && (
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  {activeOrders.filter((i) => i.status === 'NEW').length} New
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1 mt-0.5">
              <span>View Live Orders</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* History Archive Card */}
        <Link
          to="/artisan/history"
          className="glass-card bg-purple-50/30 hover:bg-purple-50/60 p-5 rounded-3xl border-2 border-purple-300/90 space-y-2 shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider">History Archive</span>
            <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-purple-800">{historyRecords.length}</p>
            <p className="text-[11px] text-purple-700 font-bold flex items-center space-x-1 mt-0.5">
              <span>View History Log</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Pipeline Value Card - Links directly to Full Page Financial Analytics Studio */}
        <Link 
          to="/artisan/analytics"
          className="glass-card bg-amber-50/20 hover:bg-amber-50/50 p-5 rounded-3xl border-2 border-amber-300/80 space-y-2 shadow-sm transition-all group block relative overflow-hidden"
          title="Click to open full-page real-time financial & pipeline analytics studio"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider group-hover:text-[#C85A32] transition-colors">Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 group-hover:bg-[#C85A32] text-[#4A2E1B] group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-sm relative">
              <TrendingUp className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-[#4A2E1B] group-hover:text-[#C85A32] transition-colors">
              ₹{totalOrderValue.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[11px] text-stone-500 font-medium">
                {inquiries.length} Lifetime Deals & Orders
              </p>
              <span className="text-[10px] font-bold text-[#C85A32] group-hover:underline flex items-center space-x-0.5">
                <span>View Full Studio</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* AI Quick Tools Section */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl text-stone-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#C85A32]" />
          <span>Quick AI Assist Tools</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-3xl border-2 border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">📷 AI Photo Studio</h4>
            <p className="text-xs text-stone-500">AI cleans background & balances studio lighting for authentic crafts.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-3xl border-2 border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">🎤 Voice Catalogue Assistant</h4>
            <p className="text-xs text-stone-500">Speak Gujarati or Hindi. AI drafts English titles and export tags.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-3xl border-2 border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">💰 Fair Wage Price Engine</h4>
            <p className="text-xs text-stone-500">Calculate living wage margins and wholesale discount thresholds.</p>
          </button>
        </div>
      </div>

      {/* Artisan Products List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-display font-bold text-xl text-stone-900">
              My Active Catalogue ({products.length})
            </h3>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-bold text-[#C85A32] hover:underline"
          >
            View in Marketplace →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="glass-card bg-white p-4 rounded-3xl border-2 border-stone-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={p.originalImage}
                alt={p.title}
                className="w-20 h-20 rounded-2xl object-cover border border-amber-200 shrink-0 bg-stone-100"
              />

              <div className="flex-1 overflow-hidden space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {p.status || 'Published'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Stock: {p.stock !== undefined ? p.stock : 10} units
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm truncate">{p.title}</h4>

                <p className="text-xs font-extrabold text-[#4A2E1B]">₹{p.price.toLocaleString('en-IN')}</p>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Link
                  to={`/product/${p.id}`}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => showToast('Share link copied!', p.title, 'success')}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#C85A32] transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
