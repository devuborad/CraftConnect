import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Building2, Save, X, Edit2, Loader2, CheckCircle2, AlertCircle, Camera, Upload, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { useApp } from '../context/AppContext';
import { compressImage } from '../utils/imageCompressor';

interface BuyerProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  location: string;
  avatar?: string;
}

const BUYER_AVATAR_PRESETS = [
  { label: 'Craft Enthusiast', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { label: 'Retail Buyer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { label: 'Boutique Owner', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
  { label: 'Sourcing Partner', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
  { label: 'Art Collector', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
  { label: 'Executive Buyer', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
];

export const BuyerProfilePage: React.FC = () => {
  const { currentUser, updateProfile: updateAppContextProfile, showToast } = useApp();
  const [profile, setProfile] = useState<BuyerProfileData | null>(null);
  const [editForm, setEditForm] = useState<BuyerProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      const savedUser = authService.getCurrentUser();

      if (res.success && res.data) {
        const responseData = res.data as any;
        const buyerData = responseData.buyerProfile || {};
        const currentAvatar = responseData.avatar || responseData.profileImage || buyerData.profileImage || savedUser?.avatar || savedUser?.profileImage || '';
        
        const data = {
          id: responseData.id || '',
          name: responseData.name || '',
          email: responseData.email || '',
          phone: responseData.phone || '',
          companyName: buyerData.companyName || savedUser?.businessName || '',
          location: buyerData.location || savedUser?.city || '',
          avatar: currentAvatar,
        };
        setProfile(data);
        setEditForm(data);
      } else if (savedUser) {
        const data = {
          id: savedUser.id || '',
          name: savedUser.name || '',
          email: savedUser.email || '',
          phone: savedUser.phone || '',
          companyName: savedUser.businessName || '',
          location: savedUser.city || '',
          avatar: savedUser.avatar || savedUser.profileImage || '',
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
    setEditForm(profile || {
      id: '', name: '', email: '', phone: '', companyName: '', location: '', avatar: ''
    });
    setIsEditing(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCancelClick = () => {
    setEditForm(profile);
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 15MB.', 'warning');
      return;
    }

    setIsUploadingImage(true);
    try {
      const compressedData = await compressImage(file, 200, 200, 0.75);

      // Immediately update local component states
      setEditForm((prev) => (prev ? { ...prev, avatar: compressedData } : null));
      setProfile((prev) => (prev ? { ...prev, avatar: compressedData } : null));

      // Sync across App Context & Navbar
      await updateAppContextProfile({
        avatar: compressedData,
        profileImage: compressedData,
      });

      // Update backend MySQL buyer profile
      await api.updateBuyerProfile({
        avatar: compressedData,
        profileImage: compressedData,
      });

      setIsUploadingImage(false);
      setSuccessMsg('Profile picture updated successfully!');
      showToast('Photo Updated! 📸', 'Your buyer profile picture is now live across CraftConnect.', 'success');
    } catch (err: any) {
      setIsUploadingImage(false);
      setErrorMsg('Could not process selected image.');
      showToast('Upload Error', 'Failed to compress and save image.', 'error');
    }
  };

  const handleSelectPresetAvatar = async (presetUrl: string) => {
    setEditForm((prev) => (prev ? { ...prev, avatar: presetUrl } : null));
    setProfile((prev) => (prev ? { ...prev, avatar: presetUrl } : null));

    await updateAppContextProfile({
      avatar: presetUrl,
      profileImage: presetUrl,
    });

    await api.updateBuyerProfile({
      avatar: presetUrl,
      profileImage: presetUrl,
    });

    showToast('Avatar Updated!', 'Selected new profile avatar.', 'success');
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
        avatar: editForm.avatar,
        profileImage: editForm.avatar,
      };

      // 1. Update AppContext & local storage (reflects in Navbar, Auth, state)
      const contextSuccess = await updateAppContextProfile({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        businessName: editForm.companyName,
        city: editForm.location,
        avatar: editForm.avatar,
        profileImage: editForm.avatar,
      });

      // 2. Call Buyer Profile API endpoint
      const res = await api.updateBuyerProfile(updateData);

      if (res.success || contextSuccess) {
        setProfile(editForm);
        setSuccessMsg('Profile updated successfully!');
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

  const currentDisplayAvatar = editForm?.avatar || profile?.avatar || currentUser?.avatar || currentUser?.profileImage;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header section - High-contrast warm gradient card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A2E1B] via-[#6E3C1E] to-[#C85A32] text-white p-6 sm:p-8 shadow-xl border border-amber-900/20 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-300/40 shadow-2xl overflow-hidden bg-amber-100 text-[#C85A32] flex items-center justify-center relative">
              {currentDisplayAvatar ? (
                <img
                  src={currentDisplayAvatar}
                  alt={profile?.name || 'Buyer Avatar'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-3xl font-extrabold uppercase">
                  {profile?.name?.charAt(0) || 'B'}
                </span>
              )}

              {/* Hover Overlay for direct picture upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute inset-0 bg-stone-950/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer p-2"
                title="Click to change profile picture"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1 text-amber-300 drop-shadow" />
                    <span>Change Photo</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Upload Camera Button Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="absolute bottom-0 right-0 bg-[#C85A32] hover:bg-amber-600 text-white p-2 rounded-full shadow-lg border-2 border-white transition-transform active:scale-95 cursor-pointer"
              title="Upload Profile Picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white drop-shadow-sm">
                {profile?.name || 'My Buyer Profile'}
              </h1>
              <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Buyer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium tracking-wide mt-1.5 max-w-md">
              Manage your personal details, business info & profile photo across CraftConnect
            </p>
          </div>
        </div>

        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="relative z-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-sm transition-all backdrop-blur-sm shrink-0 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="font-medium text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Profile Form / View */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-8">
        
        {/* Profile Picture Selector Section (Visible when editing) */}
        {isEditing && (
          <section className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-stone-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#C85A32]" />
                Profile Picture & Avatars
              </h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#C85A32] hover:text-[#9e4323] flex items-center gap-1 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Custom Photo
              </button>
            </div>

            <div>
              <p className="text-xs text-stone-500 font-medium mb-3">Or choose a preset buyer avatar:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {BUYER_AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = currentDisplayAvatar === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 group cursor-pointer ${
                        isSelected ? 'border-[#C85A32] ring-2 ring-[#C85A32]/30 scale-105' : 'border-stone-200 hover:border-amber-400'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-14 object-cover rounded-lg"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#C85A32]/40 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                          <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

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
                  placeholder="Enter full name"
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
                  placeholder="Enter email address"
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
                  placeholder="Enter mobile number"
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

        {/* Business & Location Details */}
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
                  placeholder="e.g. Heritage Crafts Pvt Ltd"
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

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={handleCancelClick}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
