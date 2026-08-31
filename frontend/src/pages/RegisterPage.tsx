import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserCheck, ShoppingBag } from 'lucide-react';
import type { Role } from '../types';

export const RegisterPage: React.FC = () => {
  const { setRole, showToast } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('ARTISAN');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    showToast('Registration complete!', `Welcome to CraftConnect AI, ${name || 'Artisan'}`, 'success');
    if (selectedRole === 'ARTISAN') {
      navigate('/artisan/dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-card bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="font-display font-extrabold text-2xl text-stone-900">
            Create Your Account
          </h1>
          <p className="text-xs text-stone-500">
            Join thousands of artisans and buyers building authentic handmade commerce.
          </p>
        </div>

        {/* Role Picker Cards */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">Select Your Role:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('ARTISAN')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRole === 'ARTISAN'
                  ? 'border-[#C85A32] bg-amber-50/80 shadow-sm'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <UserCheck className="w-5 h-5 text-[#C85A32] mb-1" />
              <h4 className="font-bold text-xs text-stone-900">I am an Artisan</h4>
              <p className="text-[10px] text-stone-500">Sell handmade crafts</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('BUYER')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRole === 'BUYER'
                  ? 'border-[#C85A32] bg-amber-50/80 shadow-sm'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-[#C85A32] mb-1" />
              <h4 className="font-bold text-xs text-stone-900">I am a Buyer</h4>
              <p className="text-[10px] text-stone-500">Boutique & wholesale</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meena Ben Vankar"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 98250 12345"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="meena@example.com"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all mt-2"
          >
            Create Account & Continue
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C85A32] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
