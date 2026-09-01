import React from 'react';
import { ShoppingBag, Sparkles, X, ArrowRight, UserCheck, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface RolePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actionName?: string;
}

export const RolePromptModal: React.FC<RolePromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionName = 'Add to Cart / Bulk Order'
}) => {
  const { role, currentUser, setRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const isGuest = !currentUser || role === 'GUEST';

  const handleSignIn = () => {
    onClose();
    navigate('/login', { state: { role: 'BUYER', redirect: location.pathname } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { role: 'BUYER', redirect: location.pathname } });
  };

  const handleSwitchRole = () => {
    setRole('BUYER');
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-900/10 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#C85A32] flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1 bg-amber-50 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
            <Sparkles className="w-3 h-3" />
            <span>AUTHENTICATION REQUIRED</span>
          </div>

          <h3 className="font-display font-bold text-xl text-stone-900">
            {isGuest ? 'Sign In or Sign Up to Continue' : 'Switch to Buyer Account'}
          </h3>

          <p className="text-xs text-stone-600 leading-relaxed px-2">
            To perform <span className="font-semibold text-stone-900">{actionName}</span>, please sign in to your buyer account or register as a new buyer.
          </p>
        </div>

        <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-stone-200 text-[11px] text-stone-700 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-semibold text-[#4A2E1B]">
            <span>✓ Direct Artisan Wholesale Pricing</span>
          </div>
          <div className="flex items-center space-x-1.5 font-semibold text-[#4A2E1B]">
            <span>✓ Bulk Sourcing & Custom Orders</span>
          </div>
          <div className="flex items-center space-x-1.5 font-semibold text-[#4A2E1B]">
            <span>✓ Cart & Order Tracking Portal</span>
          </div>
        </div>

        {isGuest ? (
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleSignIn}
              className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>

            <button
              onClick={handleRegister}
              className="w-full bg-[#4A2E1B] hover:bg-[#382213] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-98"
            >
              <UserCheck className="w-4 h-4" />
              <span>Create New Buyer Account</span>
            </button>

            <div className="pt-2 text-center">
              <button
                onClick={handleSwitchRole}
                className="text-[11px] text-stone-500 hover:text-amber-800 underline font-medium"
              >
                ⚡ Quick Demo Mode: Continue as Guest Buyer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSwitchRole}
              className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98"
            >
              <span>Switch to Buyer Mode & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
