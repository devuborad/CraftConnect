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
  CheckCircle2,
  Package,
  ShoppingBag,
  MessageSquare,
  Bot,
  ArrowUpRight,
  FolderOpen,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import { productService } from '../services/products';
import { inquiryService } from '../services/inquiries';
import type { Product, BulkInquiry } from '../types';
import { useApp } from '../context/AppContext';

export const ArtisanDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, showToast, userName } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [directOrders, setDirectOrders] = useState<BulkInquiry[]>([]);
  const [bulkInquiries, setBulkInquiries] = useState<BulkInquiry[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState<boolean>(false);

  const savedDrafts = products.filter((p) => p.status === 'Draft' || p.id.startsWith('draft-'));

  const loadDashboardData = async () => {
    if (!currentUser || role === 'GUEST') return;
    const prods = await productService.getMyProducts();
    setProducts(prods);

    const allInqs = await inquiryService.getActiveInquiriesByArtisan(currentUser?.id, currentUser?.name);
    // Strictly filter ONLY NEW inquiries/orders pending artisan action
    const newDirectOrders = allInqs.filter((i) => i.type === 'DIRECT_ORDER' && (i.status === 'NEW' || !i.status));
    const newBulkInquiries = allInqs.filter((i) => i.type !== 'DIRECT_ORDER' && (i.status === 'NEW' || !i.status));

    setDirectOrders(newDirectOrders);
    setBulkInquiries(newBulkInquiries);
  };

  useEffect(() => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in to access your Artisan Dashboard.', 'warning');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/dashboard' } });
      return;
    }
    loadDashboardData();

    window.addEventListener('storage', loadDashboardData);
    window.addEventListener('focus', loadDashboardData);

    return () => {
      window.removeEventListener('storage', loadDashboardData);
      window.removeEventListener('focus', loadDashboardData);
    };
  }, [currentUser, role, navigate, showToast]);

  // Lock background body scrolling when modal is open
  useEffect(() => {
    if (showDraftsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDraftsModal]);

  const handlePublishDraft = async (draft: Product) => {
    await productService.createProduct({
      title: draft.title,
      category: draft.category,
      material: draft.material,
      craftType: draft.craftType,
      origin: draft.origin,
      price: draft.price,
      originalImage: draft.originalImage,
      enhancedImage: draft.enhancedImage,
      descriptionEn: draft.descriptionEn
    });
    await loadDashboardData();
    showToast('Published Live!', `"${draft.title}" is now visible to buyers.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative ios-fade-up">
      
      {/* Top Welcome Banner */}
      <div className="glass-card bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4 sm:space-x-5 relative z-10 flex-1">
          <Link to="/artisan/profile" className="relative shrink-0 group">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
              alt={userName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </Link>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-300">
                Artisan Studio Dashboard
              </span>
              {currentUser?.craftType && (
                <div className="bg-white/80 text-stone-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-200 flex items-center space-x-1 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{currentUser.craftType}</span>
                </div>
              )}
              {currentUser?.experienceYears && (
                <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentUser.experienceYears} Years Master</span>
                </div>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight truncate">
              Good morning, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Let's bring your authentic handloom craft to more urban buyers and retail stores today.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
          {/* Top Row: View Profile & Compact Saved Drafts */}
          <div className="flex items-center gap-2">
            <Link
              to="/artisan/profile"
              className="bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-300 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all shrink-0 hover:border-[#C85A32]"
            >
              <User className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>View Profile</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowDraftsModal(true)}
              className="bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-800 border border-purple-200 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all shrink-0 hover:border-purple-400 cursor-pointer"
              title="View all your saved product drafts"
            >
              <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Saved Drafts ({savedDrafts.length})</span>
            </button>
          </div>

          {/* Bottom Row: + Add New Product */}
          <Link
            to="/artisan/products/new"
            className="w-full sm:w-auto bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-md transition-all shrink-0 hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Interactive 5-KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Products (Warm Amber Theme) */}
        <Link
          to="/artisan/catalogue-analytics"
          className="glass-card bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] hover:bg-amber-50/20 transition-all cursor-pointer shadow-xs hover:shadow-md block group space-y-2 relative overflow-hidden ios-fade-up ios-delay-1"
          title="Click to view Studio Catalogue & Inventory Analytics"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-[#C85A32] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-amber-200 transition-all border border-amber-200/80">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <p className="font-extrabold text-3xl text-stone-900">{products.length}</p>
            <span className="text-xs text-stone-400 font-semibold group-hover:text-[#C85A32] transition-colors flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center text-xs text-[#C85A32] font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/90 group-hover:bg-amber-100 transition-colors">
              Catalog listings
            </span>
          </div>
        </Link>

        {/* 2. Order Inquiries (Fresh Emerald Green Theme) */}
        <Link
          to="/artisan/orders"
          className="glass-card bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer shadow-xs hover:shadow-md block group space-y-2 relative overflow-hidden ios-fade-up ios-delay-2"
          title="Click to view New Direct Customer Orders"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Order Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-emerald-200 transition-all border border-emerald-200/80">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <p className="font-extrabold text-3xl text-emerald-900">{directOrders.length}</p>
            <span className="text-xs text-stone-400 font-semibold group-hover:text-emerald-700 transition-colors flex items-center gap-0.5">
              View Orders <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/90 group-hover:bg-emerald-100 transition-colors">
              {directOrders.length > 0 ? `${directOrders.length} New Orders` : 'All Clear'}
            </span>
          </div>
        </Link>

        {/* 3. Bulk Inquiries (Rich Terracotta Orange Theme) */}
        <Link
          to="/artisan/inquiries"
          className="glass-card bg-white p-5 rounded-2xl border border-stone-200 hover:border-orange-500 hover:bg-orange-50/20 transition-all cursor-pointer shadow-xs hover:shadow-md block group space-y-2 relative overflow-hidden ios-fade-up ios-delay-3"
          title="Click to view New Wholesale Bulk Inquiries"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Bulk Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100/90 text-orange-800 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-orange-200 transition-all border border-orange-200/80">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <p className="font-extrabold text-3xl text-orange-800">{bulkInquiries.length}</p>
            <span className="text-xs text-stone-400 font-semibold group-hover:text-orange-700 transition-colors flex items-center gap-0.5">
              Respond <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center text-xs text-orange-800 font-bold bg-orange-50 px-3 py-1 rounded-full border border-orange-200/90 group-hover:bg-orange-100 transition-colors">
              {bulkInquiries.length > 0 ? `${bulkInquiries.length} New Inquiries` : 'All Clear'}
            </span>
          </div>
        </Link>

        {/* 4. AI Assist Used (Royal Purple Theme) */}
        <Link
          to="/artisan/products/new"
          className="glass-card bg-white p-5 rounded-2xl border border-stone-200 hover:border-purple-500 hover:bg-purple-50/20 transition-all cursor-pointer shadow-xs hover:shadow-md block group space-y-2 relative overflow-hidden ios-fade-up ios-delay-4"
          title="Click to open AI Assist Studio Tools"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">AI Assist Used</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100/90 text-purple-700 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-purple-200 transition-all border border-purple-200/80">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <p className="font-extrabold text-3xl text-purple-900">100%</p>
            <span className="text-xs text-stone-400 font-semibold group-hover:text-purple-700 transition-colors flex items-center gap-0.5">
              AI Tools <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200/90 group-hover:bg-purple-100 transition-colors">
              Studio Enhanced
            </span>
          </div>
        </Link>

        {/* 5. Total Views (Ocean Sky Blue Theme - LAST Position!) */}
        <Link
          to="/artisan/analytics"
          className="glass-card bg-white p-5 rounded-2xl border border-stone-200 hover:border-sky-500 hover:bg-sky-50/20 transition-all cursor-pointer shadow-xs hover:shadow-md block group space-y-2 relative overflow-hidden ios-fade-up ios-delay-5"
          title="Click to view Financial & Traffic Studio Analytics"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Total Views</span>
            <div className="w-9 h-9 rounded-xl bg-sky-100/90 text-sky-700 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-sky-200 transition-all border border-sky-200/80">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <p className="font-extrabold text-3xl text-stone-900">
              {products.reduce((acc, p) => acc + (p.views || 0), 142)}
            </p>
            <span className="text-xs text-stone-400 font-semibold group-hover:text-sky-600 transition-colors flex items-center gap-0.5">
              Insights <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center text-xs text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200/90 group-hover:bg-sky-100 transition-colors">
              +18% this week
            </span>
          </div>
        </Link>
      </div>

      {/* Quick AI Shortcuts */}
      <div className="glass-card bg-gradient-to-br from-[#FAF7F2] to-amber-500/5 p-6 rounded-3xl border border-amber-200/80 space-y-4 hover:shadow-lg transition-all duration-300 ios-fade-up">
        <h3 className="font-display font-bold text-lg text-stone-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#C85A32]" />
          <span>CraftConnect AI Studio Tools</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">AI Image Enhancement</h4>
            <p className="text-xs text-stone-500">AI cleans background & balances lighting for studio photography.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Create Catalogue</h4>
            <p className="text-xs text-stone-500">Speak Gujarati or Hindi. AI generates English descriptions.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Check Fair Price</h4>
            <p className="text-xs text-stone-500">Calculate living wage margins and benchmark market ranges.</p>
          </button>
        </div>
      </div>

      {/* Artisan Products List */}
      <div className="space-y-4 ios-fade-up">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl text-stone-900">
            My Product Catalogue & Drafts ({products.length})
          </h3>

          <Link
            to="/artisan/products"
            className="text-xs font-bold text-[#C85A32] hover:underline"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => {
            const isDraft = (p.status || '').toLowerCase() === 'draft';
            return (
              <div
                key={p.id}
                className="glass-card bg-white p-4 rounded-2xl border border-stone-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all group"
              >
                <img
                  src={p.enhancedImage || p.originalImage}
                  alt={p.title}
                  className="w-20 h-20 rounded-xl object-cover border border-amber-200 shrink-0 group-hover:scale-105 transition-transform"
                />

                <div className="flex-1 overflow-hidden space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isDraft
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isDraft ? 'Draft' : 'Published'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">Views: {p.views || 0}</span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm truncate">{p.title}</h4>

                  <p className="text-xs font-extrabold text-[#4A2E1B]">₹{p.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex flex-col space-y-1">
                  <Link
                    to={`/product/${p.id}`}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors active:scale-95"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => showToast('Share link copied!', p.title, 'success')}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#C85A32] transition-colors active:scale-95"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SAVED DRAFTS MODAL OVERLAY ON DASHBOARD */}
      {showDraftsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto ios-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDraftsModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto relative my-auto ios-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-stone-900">All Saved Product Drafts</h3>
                  <p className="text-xs text-stone-500">Persisted drafts ready for review or publishing live</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftsModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {savedDrafts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 bg-amber-50 text-[#C85A32] rounded-full flex items-center justify-center mx-auto text-2xl">
                  📁
                </div>
                <h4 className="font-bold text-stone-900 text-sm">No Saved Drafts Found</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  When you save drafts while adding products in AI Assist, they will be saved here.
                </p>
                <Link
                  to="/artisan/products/new"
                  onClick={() => setShowDraftsModal(false)}
                  className="inline-block bg-[#C85A32] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md mt-2 cursor-pointer active:scale-95"
                >
                  + Add Product & Save Draft
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-[#FAF7F2] hover:border-[#C85A32] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={draft.originalImage || draft.enhancedImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'}
                        alt={draft.title}
                        className="w-16 h-16 object-cover rounded-xl border border-amber-200"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">{draft.title}</h4>
                        <p className="text-xs text-[#C85A32] font-bold">₹{(draft.price || 2499).toLocaleString('en-IN')}</p>
                        <span className="inline-block bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                          Draft
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDraftsModal(false);
                          navigate('/artisan/products/new');
                        }}
                        className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Resume / Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePublishDraft(draft)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Publish Live
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <Link
                to="/artisan/products/new"
                onClick={() => setShowDraftsModal(false)}
                className="text-xs font-bold text-[#C85A32] hover:underline"
              >
                + Create New Product Draft
              </Link>
              <button
                type="button"
                onClick={() => setShowDraftsModal(false)}
                className="bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
