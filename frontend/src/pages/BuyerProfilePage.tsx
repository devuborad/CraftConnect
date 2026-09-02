import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Save, X, Edit2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/authService';

interface BuyerProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  location: string;
}

export const BuyerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<BuyerProfileData | null>(null);
  const [editForm, setEditForm] = useState<BuyerProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      const currentUser = authService.getCurrentUser();

      if (res.success && res.data) {
        const responseData = res.data as any;
        const data = {
          id: responseData.id || '',
          name: responseData.name || '',
          email: responseData.email || '',
          phone: responseData.phone || '',
          companyName: responseData.buyerProfile?.companyName || '',
          location: responseData.buyerProfile?.location || '',
        };
        setProfile(data);
        setEditForm(data);
      } else if (currentUser) {
        const data = {
          id: currentUser.id || '',
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          companyName: currentUser.businessName || '',
          location: currentUser.city || '',
        };
        setProfile(data);
        setEditForm(data);
      } else {
        setErrorMsg('Failed to load profile data');
      }
    } catch (err) {
      setErrorMsg('An error occurred while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditForm(profile); // Reset form to current profile data
    setIsEditing(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCancelClick = () => {
    setEditForm(profile); // Revert changes
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    if (!editForm) return;
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        companyName: editForm.companyName,
        location: editForm.location,
      };

      const res = await api.updateBuyerProfile(updateData);
      const currentUser = authService.getCurrentUser();
      
      if (res.success) {
        setProfile(editForm);
        setSuccessMsg(res.message || 'Profile updated successfully!');
        setIsEditing(false);
      } else if (currentUser) {
        // Fallback local save
        const updatedUser = {
          ...currentUser,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          businessName: editForm.companyName,
          city: editForm.location,
        };
        localStorage.setItem('craft_current_user', JSON.stringify(updatedUser));
        setProfile(editForm);
        setSuccessMsg('Profile updated locally (Mock User)');
        setIsEditing(false);
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('An error occurred while saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C85A32] animate-spin mb-4" />
        <p className="text-stone-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header section */}
      <div className="glass-card bg-gradient-to-r from-[#4A2E1B] via-[#6E3C1E] to-[#C85A32] text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-amber-900/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-amber-100 text-[#C85A32] rounded-full flex items-center justify-center shadow-inner shrink-0 text-3xl font-bold uppercase border-4 border-white/20">
            {profile?.name?.charAt(0) || 'B'}
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl text-white drop-shadow-sm">
              My Profile
            </h1>
            <p className="text-sm text-amber-100/95 font-medium tracking-wide mt-1">
              Manage your personal and business details
            </p>
          </div>
        </div>

        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="relative z-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-sm transition-all backdrop-blur-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="font-medium text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Profile Form / View */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-8">
        
        {/* Personal Information */}
        <section>
          <h2 className="font-display font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-[#C85A32]" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="name" 
                  value={editForm?.name || ''} 
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl border border-transparent">
                  <User className="w-4 h-4 text-stone-400" />
                  <span className="text-sm font-semibold text-stone-900">{profile?.name || '-'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Email Address</label>
              {isEditing ? (
                <input 
                  type="email" 
                  name="email" 
                  value={editForm?.email || ''} 
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl border border-transparent">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-sm font-semibold text-stone-900">{profile?.email || '-'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mobile Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="phone" 
                  value={editForm?.phone || ''} 
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl border border-transparent">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-sm font-semibold text-stone-900">{profile?.phone || '-'}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Address / Business Information */}
        <section>
          <h2 className="font-display font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C85A32]" />
            Business & Location Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Company Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="companyName" 
                  value={editForm?.companyName || ''} 
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl border border-transparent">
                  <Building2 className="w-4 h-4 text-stone-400" />
                  <span className="text-sm font-semibold text-stone-900">{profile?.companyName || '-'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Location (City/State/Country)</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="location" 
                  value={editForm?.location || ''} 
                  onChange={handleInputChange}
                  placeholder="e.g. Mumbai, Maharashtra, India"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl border border-transparent">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span className="text-sm font-semibold text-stone-900">{profile?.location || '-'}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={handleCancelClick}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
