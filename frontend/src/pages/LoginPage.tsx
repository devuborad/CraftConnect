import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Phone, Lock, UserCheck, ShoppingBag, ShieldCheck } from 'lucide-react';
import type { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { setRole, showToast } = useApp();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole('ARTISAN');
    showToast('Logged in successfully!', 'Welcome back, Meena Ben 👋', 'success');
    navigate('/artisan/dashboard');
  };

  const handleQuickDemoLogin = (role: Role, path: string) => {
    setRole(role);
    showToast(`Quick Demo Login: ${role}`, 'Testing application flow', 'info');
    navigate(path);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto shadow font-bold text-xl">
            C
          </div>
          <h1 className="font-display font-extrabold text-2xl text-stone-900">
            Sign in to CraftConnect AI
          </h1>
          <p className="text-xs text-stone-500">
            Enter your mobile number or email to access your artisan or buyer account.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Mobile Number / Email</label>
            <div className="relative">
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98250 12345"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all"
          >
            Continue
          </button>
        </form>

        {/* Hackathon Quick Demo Buttons */}
        <div className="pt-4 border-t border-stone-200 space-y-2">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider text-center">
            QUICK HACKATHON DEMO LOGIN (1-CLICK)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('ARTISAN', '/artisan/dashboard')}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 p-2 rounded-xl text-[11px] font-bold text-[#4A2E1B] flex flex-col items-center justify-center text-center space-y-1"
            >
              <UserCheck className="w-4 h-4 text-[#C85A32]" />
              <span>Artisan</span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('BUYER', '/buyer/dashboard')}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 p-2 rounded-xl text-[11px] font-bold text-[#4A2E1B] flex flex-col items-center justify-center text-center space-y-1"
            >
              <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
              <span>Buyer</span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('ADMIN', '/admin')}
              className="bg-stone-900 hover:bg-stone-800 text-white p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center text-center space-y-1"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#C85A32] font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
