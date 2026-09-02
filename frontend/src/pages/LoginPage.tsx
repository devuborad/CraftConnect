import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setRole, showToast, addNotification } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Location state passed from registration auto-redirect
  const statePrefill = location.state?.prefillIdentifier || '';
  const registeredName = location.state?.registeredName || '';

  const [identifier, setIdentifier] = useState(statePrefill);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (statePrefill) {
      setIdentifier(statePrefill);
    }
  }, [statePrefill]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your Email/Mobile number and Password.');
      return;
    }

    setLoading(true);

    const result = await authService.loginUser(identifier, password);
    setLoading(false);

    if (!result.success || !result.user) {
      setErrorMessage(result.message);
      return;
    }

    // Login successful
    const user = result.user;
    setRole(user.role, user);

    const isAdmin = user.role === 'ADMIN';

    // Push Notification directly into live Bell notification icon
    addNotification({
      targetRole: isAdmin ? 'ADMIN' : user.role,
      title: 'Sign In Successful 🔐',
      message: `Welcome back, ${user.name}! ${isAdmin ? 'Admin Dashboard Unlocked.' : 'You signed in to your account.'}`,
      type: 'system',
      link: isAdmin ? '/admin' : user.role === 'BUYER' ? '/buyer/dashboard' : '/artisan/dashboard'
    });

    showToast(`Welcome back, ${user.name}! 🎉`, `${isAdmin ? 'Signed in as Platform Administrator' : `Signed in as ${user.role === 'BUYER' ? 'Boutique Buyer' : 'Master Artisan'}`}`, 'success');

    const targetRedirect = location.state?.redirect;
    if (isAdmin) {
      navigate('/admin');
    } else if (targetRedirect) {
      navigate(targetRedirect);
    } else if (user.role === 'ARTISAN') {
      navigate('/artisan/dashboard');
    } else if (user.role === 'BUYER') {
      navigate('/buyer/dashboard');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-2xl space-y-6">
        
        {/* Header Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-stone-900">
            Sign In to CraftConnect
          </h1>
          <p className="text-xs text-stone-500">
            Enter the Email/Mobile and Password set during your registration.
          </p>
        </div>

        {/* Registration Welcome Banner if just registered */}
        {registeredName && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-semibold text-center animate-in fade-in">
            Account created for {registeredName}! Please sign in below.
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-bold mb-1">Registered Email or Mobile *</label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="meena@craftconnect.in or 9825012345"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                required
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your set password"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-2"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-4 border-t border-stone-100">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#C85A32] font-bold hover:underline">
            Register here →
          </Link>
        </div>
      </div>
    </div>
  );
};
