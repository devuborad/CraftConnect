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
  Share2
} from 'lucide-react';
import { productService } from '../services/products';
import type { Product } from '../types';
import { useApp } from '../context/AppContext';

export const ArtisanDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getProducts().then((res) => setProducts(res));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Dashboard Greeting Header */}
      <div className="glass-card bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-900/10 p-8 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ARTISAN STUDIO DASHBOARD</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
            Good morning, Meena 👋
          </h1>
          <p className="text-sm text-stone-600">
            Let's bring your authentic handloom craft to more urban buyers and retail stores today.
          </p>
        </div>

        <Link
          to="/artisan/products/new"
          className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all shrink-0 hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Add New Product</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Products</span>
          <p className="font-display font-extrabold text-2xl text-stone-900">{products.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Active Catalogue</span>
          </span>
        </div>

        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Published</span>
          <p className="font-display font-extrabold text-2xl text-stone-900">
            {products.filter((p) => p.status === 'Published').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Live in Marketplace</span>
        </div>

        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Bulk Inquiries</span>
          <p className="font-display font-extrabold text-2xl text-[#C85A32]">12</p>
          <Link to="/artisan/inquiries" className="text-[11px] text-[#C85A32] font-semibold hover:underline">
            View Inquiry Inbox →
          </Link>
        </div>

        <div className="glass-card bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Views</span>
          <p className="font-display font-extrabold text-2xl text-stone-900">420</p>
          <span className="text-[11px] text-stone-500 font-semibold">Marketplace Impressions</span>
        </div>
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
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">📷 Improve Photo</h4>
            <p className="text-xs text-stone-500">AI cleans background & balances lighting for studio photography.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">🎤 Create Catalogue</h4>
            <p className="text-xs text-stone-500">Speak Gujarati or Hindi. AI generates English descriptions.</p>
          </button>

          <button
            onClick={() => navigate('/artisan/products/new')}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-[#C85A32] text-left space-y-2 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">💰 Check Fair Price</h4>
            <p className="text-xs text-stone-500">Calculate living wage margins and benchmark market ranges.</p>
          </button>
        </div>
      </div>

      {/* Artisan Products List (Card Layout for Mobile/Desktop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl text-stone-900">
            My Published Crafts ({products.length})
          </h3>

          <Link
            to="/artisan/products"
            className="text-xs font-bold text-[#C85A32] hover:underline"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="glass-card bg-white p-4 rounded-2xl border border-stone-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={p.originalImage}
                alt={p.title}
                className="w-20 h-20 rounded-xl object-cover border border-amber-200 shrink-0"
              />

              <div className="flex-1 overflow-hidden space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {p.status}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Views: {p.views}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};
