import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Sliders, 
  Eye
} from 'lucide-react';
import { MOCK_ARTISANS, MOCK_PRODUCTS, MOCK_AI_METRICS } from '../services/mockData';
import { useApp } from '../context/AppContext';

import { useEffect } from 'react';
import { api } from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'artisans' | 'buyers' | 'products' | 'categories' | 'inquiries' | 'ai' | 'content' | 'settings'
  >('dashboard');

  const [productsList, setProductsList] = useState<any[]>([]);
  const [artisansList, setArtisansList] = useState<any[]>([]);
  const [aiActivityList, setAiActivityList] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<any>(null);

  useEffect(() => {
    api.getAdminStats().then((res) => {
      if (res.success && res.data) {
        setOverviewStats(res.data);
      }
    });

    api.getAdminProducts().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setProductsList(res.data);
      }
    });

    api.getAdminArtisans().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setArtisansList(res.data);
      }
    });

    api.getAdminAIActivity().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setAiActivityList(res.data);
      }
    });
  }, []);

  const handleProductStatus = (id: string, newStatus: 'Published' | 'Rejected') => {
    const statusParam = newStatus.toLowerCase();
    api.moderateProduct(id, statusParam).then(() => {
      setProductsList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      showToast(`Product status updated to ${newStatus}`, '', 'success');
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Admin Navigation Sidebar (Desktop & Mobile Drawer) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 p-5 rounded-3xl space-y-2 shadow-2xl">
            <div className="pb-3 mb-3 border-b border-stone-800 space-y-2.5">
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-xs inline-block">
                <img src="/logo.png" alt="CraftConnect" className="h-6 w-auto object-contain" />
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-extrabold text-white text-base tracking-wide">Admin Portal</h3>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Overview & Charts</span>
            </button>

            <button
              onClick={() => setActiveTab('artisans')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'artisans'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Artisans Management</span>
            </button>

            <button
              onClick={() => setActiveTab('buyers')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'buyers'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Buyers & Boutiques</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Product Moderation</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Bulk Inquiries</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Feature Activity</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/40 scale-[1.01]'
                  : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Platform Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content View */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-2xl text-stone-900">
                    Platform Overview
                  </h1>
                  <p className="text-xs text-stone-500">Live statistics and platform performance analytics</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Total Artisans</span>
                  <p className="font-extrabold text-2xl text-stone-900">{overviewStats?.artisans ?? overviewStats?.totalArtisans ?? 1240}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Verified Artisans</span>
                </div>

                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Total Products</span>
                  <p className="font-extrabold text-2xl text-stone-900">{overviewStats?.products ?? overviewStats?.totalProducts ?? 3850}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">{overviewStats?.publishedProducts ?? 3410} Published</span>
                </div>

                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Buyer Inquiries</span>
                  <p className="font-extrabold text-2xl text-[#C85A32]">{overviewStats?.inquiries ?? overviewStats?.totalInquiries ?? 890}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">B2B Sourcing Volume</span>
                </div>

                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">AI Requests</span>
                  <p className="font-extrabold text-2xl text-stone-900">{overviewStats?.aiRequests ?? overviewStats?.totalAIRequests ?? 14200}</p>
                  <span className="text-[10px] text-amber-600 font-bold">Live AI Logs</span>
                </div>
              </div>

              {/* Analytics SVG Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Growth Chart */}
                <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-stone-900">Artisan & Product Growth</h3>
                      <p className="text-[10px] text-stone-500 font-medium">Monthly trajectory of artisans & catalogued items</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-stone-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] inline-block"></span>
                        <span>Artisans</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-stone-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                        <span>Products</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-[#C85A32] font-extrabold px-2 py-0.5 rounded">2026 Q3</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <div className="h-44 flex items-end justify-between space-x-3 px-2">
                      {[
                        { month: 'M1', artisans: 45, products: 70 },
                        { month: 'M2', artisans: 60, products: 95 },
                        { month: 'M3', artisans: 80, products: 130 },
                        { month: 'M4', artisans: 100, products: 165 },
                        { month: 'M5', artisans: 125, products: 205 },
                        { month: 'M6', artisans: 155, products: 260 },
                      ].map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          <div className="w-full flex items-end justify-center space-x-1.5 h-36">
                            {/* Artisan Growth Bar */}
                            <div
                              className="w-1/2 bg-gradient-to-t from-[#4A2E1B] to-[#C85A32] rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs"
                              style={{ height: `${(item.artisans / 280) * 100}%` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap z-20 shadow-md">
                                {item.artisans} Artisans
                              </div>
                            </div>
                            {/* Product Growth Bar */}
                            <div
                              className="w-1/2 bg-gradient-to-t from-emerald-800 to-emerald-500 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs"
                              style={{ height: `${(item.products / 280) * 100}%` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap z-20 shadow-md">
                                {item.products} Products
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-500 font-extrabold mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Feature Usage Breakdown */}
                <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                  <h3 className="font-bold text-sm text-stone-900">AI Usage Breakdown</h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Multilingual Speech-to-Text (Gujarati/Hindi)</span>
                        <span className="text-[#C85A32]">45%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#C85A32] h-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>AI Image Studio Enhancement</span>
                        <span className="text-amber-600">32%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full" style={{ width: '32%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>AI Pricing Engine</span>
                        <span className="text-emerald-600">23%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: '23%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTISAN MANAGEMENT */}
          {activeTab === 'artisans' && (
            <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4 animate-in fade-in duration-200">
              <h2 className="font-display font-bold text-xl text-stone-900">Artisan Directory Management</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-900 uppercase text-[10px] font-extrabold">
                    <tr>
                      <th className="p-3">Artisan</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Craft</th>
                      <th className="p-3">Experience</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {artisansList.map((a: any) => (
                      <tr key={a.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-900 flex items-center space-x-2">
                          <img src={a.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'} alt={a.name} className="w-6 h-6 rounded-full object-cover" />
                          <span>{a.name}</span>
                        </td>
                        <td className="p-3">{a.location || 'Gujarat'}</td>
                        <td className="p-3">{a.craftType || 'Handicrafts'}</td>
                        <td className="p-3">{a.experienceYears || 5} yrs</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Verified
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => showToast('Artisan profile viewed', a.name, 'info')}
                            className="text-stone-600 hover:text-stone-900"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT MODERATION */}
          {activeTab === 'products' && (
            <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4 animate-in fade-in duration-200">
              <h2 className="font-display font-bold text-xl text-stone-900">Product Moderation</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-900 uppercase text-[10px] font-extrabold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Artisan</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {productsList.map((p: any) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-900 flex items-center space-x-2">
                          <img src={p.originalImage || p.original_image_url} alt={p.title || p.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="line-clamp-1">{p.title || p.name}</span>
                        </td>
                        <td className="p-3">{p.artisanName || 'Artisan'}</td>
                        <td className="p-3">{p.category || p.category_name}</td>
                        <td className="p-3 font-bold">₹{p.price}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              (p.status || '').toLowerCase() === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 flex items-center space-x-2">
                          <button
                            onClick={() => handleProductStatus(p.id, 'Published')}
                            className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProductStatus(p.id, 'Rejected')}
                            className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AI ACTIVITY */}
          {activeTab === 'ai' && (
            <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4 animate-in fade-in duration-200">
              <h2 className="font-display font-bold text-xl text-stone-900">AI Assist Request Log</h2>

              <div className="space-y-3">
                {aiActivityList.map((m: any) => (
                  <div key={m.id} className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-4 h-4 text-[#C85A32]" />
                      <div>
                        <p className="font-bold text-stone-900">{(m.feature || m.type || 'AI_FEATURE').toUpperCase()} • {m.userName || m.artisanName || 'Artisan'}</p>
                        <p className="text-[10px] text-stone-500">{m.createdAt || m.timestamp}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {m.status} ({m.durationMs || m.processingTimeMs || 1200}ms)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS & OTHER */}
          {(activeTab === 'buyers' || activeTab === 'inquiries' || activeTab === 'settings') && (
            <div className="glass-card bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-3">
              <div className="text-3xl">⚙️</div>
              <h3 className="font-bold text-stone-900 text-base">Admin Config Section: {activeTab.toUpperCase()}</h3>
              <p className="text-xs text-stone-500">
                All platform rules, security tokens, and language configurations are active.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
