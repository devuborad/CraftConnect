import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  ShoppingBag, 
  Building2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Award,
  MapPin,
  Palette
} from 'lucide-react';
import type { Role } from '../types';

export const RegisterPage: React.FC = () => {
  const { showToast, addNotification } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>('ARTISAN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [craftType, setCraftType] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation 1: All required fields filled
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    // Validation 2: Password Length
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Validation 3: Confirm Password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password carefully.');
      return;
    }

    setLoading(true);

    const result = await authService.registerUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role: selectedRole,
      businessName: businessName.trim() || undefined,
      craftType: selectedRole === 'ARTISAN' ? (craftType.trim() || 'Handloom & Traditional Crafts') : undefined,
      experienceYears: selectedRole === 'ARTISAN' ? (parseInt(experienceYears, 10) || 1) : undefined,
      city: city.trim() || (selectedRole === 'ARTISAN' ? 'Gujarat, India' : 'Mumbai, India'),
    });

    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    // Push notification to live Notification Bell Inbox
    addNotification({
      targetRole: selectedRole,
      title: 'Welcome to CraftConnect! 🎉',
      message: `Account created for ${name.trim()}. You can now access all direct artisan features.`,
      type: 'system',
      link: '/login'
    });

    showToast('Registration Successful! 🎉', 'Your account has been created and connected to MySQL. Please sign in.', 'success');

    // Automatically redirect to Login page with prefilled credential
    navigate('/login', { 
      state: { 
        prefillIdentifier: email.trim() || phone.trim(),
        registeredName: name.trim()
      } 
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="glass-card bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-2xl space-y-6">
        
        {/* Header Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900">
            Join CraftConnect AI
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            Create your account to start direct artisan sourcing or selling authentic handmade crafts.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Select Your Account Type:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('ARTISAN')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedRole === 'ARTISAN'
                  ? 'border-[#C85A32] bg-amber-50/70 shadow-md ring-2 ring-[#C85A32]/20'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-2 rounded-xl bg-amber-100 text-[#C85A32]">
                  <UserCheck className="w-5 h-5" />
                </div>
                {selectedRole === 'ARTISAN' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Master Artisan</h4>
                <p className="text-[11px] text-stone-500">Sell handloom & crafts directly</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('BUYER')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedRole === 'BUYER'
                  ? 'border-[#C85A32] bg-amber-50/70 shadow-md ring-2 ring-[#C85A32]/20'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-2 rounded-xl bg-amber-100 text-[#C85A32]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                {selectedRole === 'BUYER' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Boutique Buyer</h4>
                <p className="text-[11px] text-stone-500">Bulk sourcing & retail</p>
              </div>
            </button>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-stone-700 font-bold mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === 'ARTISAN' ? 'e.g. Meena Ben Vankar' : 'e.g. Anita Sharma'}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                required
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Mobile Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                  required
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Master Artisan Specific Profile Section */}
          {selectedRole === 'ARTISAN' ? (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs pb-1 border-b border-amber-200/60">
                <Award className="w-4 h-4 text-[#C85A32]" />
                <span>Artisan Workshop & Craft Experience Details</span>
              </div>

              {/* Craft Specialty & Workshop Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Craft Specialty / Technique
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={craftType}
                      onChange={(e) => setCraftType(e.target.value)}
                      placeholder="e.g. Patola Weaving, Pottery"
                      className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    />
                    <Palette className="w-4 h-4 text-[#C85A32] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Workshop / Company Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Kutch Handloom Studio"
                      className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    />
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Experience Years & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Years of Craft Experience *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                      required
                    />
                    <Award className="w-4 h-4 text-[#C85A32] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Workshop Location (City & State)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Patan, Gujarat"
                      className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    />
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Buyer Specific Section */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Boutique / Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Heritage Craft Boutique"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                  />
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  City / Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>
          )}

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Create Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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

            <div>
              <label className="block text-stone-700 font-bold mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-2 mt-4"
          >
            <span>Register & Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-100">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C85A32] font-bold hover:underline">
            Sign in to your account →
          </Link>
        </div>
      </div>
    </div>
  );
};
