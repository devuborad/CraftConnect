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
  CheckCircle2
} from 'lucide-react';
import { productService } from '../services/products';
import type { Product } from '../types';
import { useApp } from '../context/AppContext';

export const ArtisanDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, showToast, userName } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in to access your Artisan Dashboard.', 'warning');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/dashboard' } });
      return;
    }
    productService.getMyProducts().then((res) => setProducts(res));
  }, [currentUser, role, navigate, showToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ios-fade-up">
      
      {/* Header & Quick Profile Info */}
      <div className="glass-card bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all">
        <div className="flex items-center space-x-4">
          <Link to="/artisan/profile" className="relative group shrink-0">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
              alt={userName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </Link>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-xs">
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
                <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentUser.experienceYears} Years Master</span>
                </div>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Good morning, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Let's bring your authentic handloom craft to more urban buyers and retail stores today.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/artisan/profile"
            className="bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-300 px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all shrink-0 hover:border-[#C85A32]"
          >
            <User className="w-4 h-4 text-[#C85A32]" />
            <span>View Profile</span>
          </Link>

          <Link
            to="/artisan/products/new"
            className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all shrink-0 hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200/90 space-y-1 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ios-fade-up ios-delay-1">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Products</span>
          <p className="font-extrabold text-2xl text-stone-900">{products.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Catalog listings</span>
        </div>

        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200/90 space-y-1 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ios-fade-up ios-delay-2">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Views</span>
          <p className="font-extrabold text-2xl text-stone-900">
            {products.reduce((acc, p) => acc + (p.views || 0), 142)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">+18% this week</span>
        </div>

        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200/90 space-y-1 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ios-fade-up ios-delay-3">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Bulk Inquiries</span>
          <p className="font-extrabold text-2xl text-[#C85A32]">8</p>
          <span className="text-[10px] text-amber-600 font-bold">Pending response</span>
        </div>

        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200/90 space-y-1 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ios-fade-up ios-delay-4">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">AI Assist Used</span>
          <p className="font-extrabold text-2xl text-stone-900">100%</p>
          <span className="text-[10px] text-emerald-600 font-bold">Studio Enhanced</span>
        </div>
      </div>

      {/* Quick AI Shortcuts */}
      <div className="glass-card bg-gradient-to-br from-[#FAF7F2] to-amber-500/5 p-6 rounded-3xl border border-amber-200/80 space-y-4 hover:shadow-lg transition-all duration-300 ios-fade-up ios-delay-2">
        <h3 className="font-display font-bold text-lg text-stone-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#C85A32]" />
          <span>CraftConnect AI Studio Tools</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">AI Image Enhancement</h4>
            <p className="text-xs text-stone-500">AI cleans background & balances lighting for studio photography.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Create Catalogue</h4>
            <p className="text-xs text-stone-500">Speak Gujarati or Hindi. AI generates English descriptions.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Check Fair Price</h4>
            <p className="text-xs text-stone-500">Calculate living wage margins and benchmark market ranges.</p>
          </button>
        </div>
      </div>

      {/* Artisan Products List (Card Layout for Mobile/Desktop) */}
      <div className="space-y-4">
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
                className="glass-card bg-white p-4 rounded-2xl border border-stone-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={p.enhancedImage || p.originalImage}
                  alt={p.title}
                  className="w-20 h-20 rounded-xl object-cover border border-amber-200 shrink-0"
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
                      {isDraft ? '📁 Draft' : '🚀 Published'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">Views: {p.views || 0}</span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm truncate">{p.title}</h4>

                  <p className="text-xs font-extrabold text-[#4A2E1B]">₹{p.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex flex-col space-y-1">
                  <Link
                    to={`/product/${p.id}`}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="View"
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
