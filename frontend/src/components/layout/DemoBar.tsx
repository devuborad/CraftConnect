import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, UserCheck, ShoppingBag, ShieldCheck, Globe } from 'lucide-react';
import type { Role } from '../../types';
import { useNavigate } from 'react-router-dom';

export const DemoBar: React.FC = () => {
  const { role, setRole } = useApp();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: Role, path: string) => {
    setRole(newRole);
    navigate(path);
  };

  return (
    <div className="bg-stone-900 text-stone-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-stone-800 shadow-sm z-50 relative">
      <div className="flex items-center space-x-2">
        <span className="bg-amber-600/30 text-amber-400 border border-amber-500/30 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center space-x-1">
          <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
          <span>HACKATHON DEMO MODE</span>
        </span>
        <span className="hidden md:inline text-stone-400">
          Switch roles anytime to test full artisan & buyer journeys:
        </span>
      </div>

      <div className="flex items-center space-x-1.5 mt-1 sm:mt-0">
        <button
          onClick={() => handleRoleChange('GUEST', '/')}
          className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center space-x-1 ${
            role === 'GUEST'
              ? 'bg-amber-700 text-white shadow'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Public / Visitor</span>
        </button>

        <button
          onClick={() => handleRoleChange('ARTISAN', '/artisan/dashboard')}
          className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center space-x-1 ${
            role === 'ARTISAN'
              ? 'bg-amber-600 text-white shadow ring-2 ring-amber-400/50'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          <UserCheck className="w-3 h-3" />
          <span>Artisan (Meena 👋)</span>
        </button>

        <button
          onClick={() => handleRoleChange('BUYER', '/buyer/dashboard')}
          className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center space-x-1 ${
            role === 'BUYER'
              ? 'bg-amber-600 text-white shadow ring-2 ring-amber-400/50'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          <ShoppingBag className="w-3 h-3" />
          <span>Boutique Buyer</span>
        </button>

        <button
          onClick={() => handleRoleChange('ADMIN', '/admin')}
          className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center space-x-1 ${
            role === 'ADMIN'
              ? 'bg-stone-100 text-stone-900 font-semibold shadow ring-2 ring-white/50'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};
