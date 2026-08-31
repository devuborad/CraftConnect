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

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'artisans' | 'buyers' | 'products' | 'categories' | 'inquiries' | 'ai' | 'content' | 'settings'
  >('dashboard');

  const [productsList, setProductsList] = useState(MOCK_PRODUCTS);

  const handleProductStatus = (id: string, newStatus: 'Published' | 'Rejected') => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Product status updated to ${newStatus}`, '', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Admin Navigation Sidebar (Desktop & Mobile Drawer) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="glass-card bg-stone-900 text-stone-200 p-4 rounded-3xl space-y-1 shadow-xl">
            <div className="p-3 mb-2 border-b border-stone-800 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-white text-base">Admin Portal</h3>
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'dashboard' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview & Charts</span>
            </button>

            <button
              onClick={() => setActiveTab('artisans')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'artisans' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Artisans Management</span>
            </button>

            <button
              onClick={() => setActiveTab('buyers')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'buyers' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyers & Boutiques</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'products' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Moderation</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'inquiries' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Bulk Inquiries</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'ai' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Feature Activity</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                activeTab === 'settings' ? 'bg-amber-600 text-white shadow' : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
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
                  <p className="font-extrabold text-2xl text-stone-900">1,240</p>
                  <span className="text-[10px] text-emerald-600 font-bold">+14% this month</span>
                </div>

                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Total Products</span>
                  <p className="font-extrabold text-2xl text-stone-900">3,850</p>
                  <span className="text-[10px] text-emerald-600 font-bold">3,410 Published</span>
                </div>

                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Buyer Inquiries</span>
                  <p className="font-extrabold text-2xl text-[#C85A32]">890</p>
                  <span className="text-[10px] text-emerald-600 font-bold">₹48.5L Volume</span>
                </div>

                <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">AI Requests</span>
                  <p className="font-extrabold text-2xl text-stone-900">14,200</p>
                  <span className="text-[10px] text-amber-600 font-bold">98.4% Success</span>
                </div>
              </div>

              {/* Analytics SVG Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Growth Chart */}
                <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-stone-900">Artisan & Product Growth</h3>
                    <span className="text-[10px] bg-amber-100 text-[#C85A32] font-bold px-2 py-0.5 rounded">2026 Q3</span>
                  </div>

                  <div className="h-40 flex items-end justify-between space-x-2 pt-4 px-2">
                    {[35, 45, 60, 75, 88, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-[#4A2E1B] to-[#C85A32] rounded-t-lg transition-all"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[9px] text-stone-400 font-semibold">M{i + 1}</span>
                      </div>
                    ))}
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
                    {MOCK_ARTISANS.map((a) => (
                      <tr key={a.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-900 flex items-center space-x-2">
                          <img src={a.avatar} alt={a.name} className="w-6 h-6 rounded-full object-cover" />
                          <span>{a.name}</span>
                        </td>
                        <td className="p-3">{a.location}</td>
                        <td className="p-3">{a.craftType}</td>
                        <td className="p-3">{a.experienceYears} yrs</td>
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
                    {productsList.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-900 flex items-center space-x-2">
                          <img src={p.originalImage} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="line-clamp-1">{p.title}</span>
                        </td>
                        <td className="p-3">{p.artisanName}</td>
                        <td className="p-3">{p.category}</td>
                        <td className="p-3 font-bold">₹{p.price}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.status === 'Published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
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
                {MOCK_AI_METRICS.map((m) => (
                  <div key={m.id} className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-4 h-4 text-[#C85A32]" />
                      <div>
                        <p className="font-bold text-stone-900">{m.type} • {m.artisanName}</p>
                        <p className="text-[10px] text-stone-500">{m.timestamp}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {m.status} ({m.durationMs}ms)
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
