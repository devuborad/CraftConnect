import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { productService } from '../services/products';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/common/ModalPortal';
import type { Product, Artisan } from '../types';
import { ProductCard } from '../components/marketplace/ProductCard';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Edit3, 
  X, 
  Save, 
  Lock, 
  Eye, 
  EyeOff, 
  Palette, 
  ArrowLeft, 
  PlusCircle,
  Package,
  Layers,
  CheckCircle2,
  TrendingUp,
  Share2,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

const CRAFT_AVATAR_PRESETS = [
  { label: 'Weaver Portrait', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
  { label: 'Artisan Workshop', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { label: 'Craft Studio', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { label: 'Company / Brand Logo', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400' }
];

export const ArtisanProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, role, userName, updateProfile, showToast } = useApp();

  const isOwnProfile = !id || (currentUser && (currentUser.id === id || id === 'profile' || id === 'me'));

  // Artisan details state
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lock background scrolling when edit profile modal is open
  useBodyScrollLock(isEditModalOpen);

  // Edit Form Fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editCraftType, setEditCraftType] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState('5');
  const [editLocation, setEditLocation] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // File Input References
  const directFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load profile data
  useEffect(() => {
    setLoading(true);

    if (isOwnProfile && currentUser) {
      const currentAvatar = currentUser.avatar || currentUser.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400';
      const ownArtisanData: Artisan = {
        id: currentUser.id,
        name: currentUser.name || 'Master Artisan',
        businessName: currentUser.businessName || `${currentUser.name}'s Craft Heritage`,
        avatar: currentAvatar,
        location: currentUser.city || 'Patan, Gujarat',
        state: currentUser.city?.includes(',') ? currentUser.city.split(',')[1].trim() : 'Gujarat',
        craftType: currentUser.craftType || 'Authentic Handloom & Traditional Crafts',
        experienceYears: currentUser.experienceYears || 10,
        story: currentUser.bio || 'Dedicated to preserving generational handicraft traditions with sustainable, authentic artisan techniques.',
        rating: 4.9,
        reviewCount: 32,
        phone: currentUser.phone || '+91 98250 12345',
        isVerified: true,
        publishedCount: 0,
        languages: ['gu', 'hi', 'en']
      };

      setArtisan(ownArtisanData);
      populateEditForm(currentUser);

      // Fetch products created by this artisan or catalogue products
      productService.getProducts().then((allProds) => {
        const artisanProducts = allProds.filter(
          (p) => p.artisanId === currentUser.id || p.artisanName?.toLowerCase() === currentUser.name?.toLowerCase()
        );
        // If user is logged in, show their products or default studio catalogue
        setProducts(artisanProducts.length > 0 ? artisanProducts : allProds.slice(0, 4));
        setLoading(false);
      });
    } else if (id) {
      productService.getArtisanById(id).then((foundArtisan) => {
        if (foundArtisan) {
          setArtisan(foundArtisan);
        } else if (currentUser) {
          // Fallback to current user if artisan not found
          setArtisan({
            id: currentUser.id,
            name: currentUser.name,
            businessName: currentUser.businessName || `${currentUser.name} Studio`,
            avatar: currentUser.avatar || currentUser.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
            location: currentUser.city || 'Gujarat, India',
            state: 'Gujarat',
            craftType: currentUser.craftType || 'Traditional Crafts',
            experienceYears: currentUser.experienceYears || 5,
            story: currentUser.bio || 'Authentic master craftsperson on CraftConnect AI.',
            rating: 4.9,
            reviewCount: 18,
            phone: currentUser.phone || '',
            isVerified: true,
            publishedCount: 0,
            languages: ['gu', 'hi', 'en']
          });
        }
        productService.getProducts().then((prods) => {
          setProducts(prods.filter((p) => p.artisanId === id || p.artisanName?.toLowerCase() === foundArtisan?.name?.toLowerCase()));
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, [id, isOwnProfile, currentUser]);

  const populateEditForm = (user: typeof currentUser) => {
    if (!user) return;
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditBusinessName(user.businessName || '');
    setEditCraftType(user.craftType || '');
    setEditExperienceYears(String(user.experienceYears || '5'));
    setEditLocation(user.city || '');
    setEditBio(user.bio || '');
    setEditProfileImage(user.avatar || user.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400');
    setEditPassword('');
  };

  const handleOpenEditModal = () => {
    if (currentUser) {
      populateEditForm(currentUser);
    }
    setIsEditModalOpen(true);
  };

  // Direct Avatar / Logo Upload from profile card
  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 5MB.', 'warning');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        setIsUploadingImage(false);
        return;
      }

      // Update local preview immediately
      setArtisan((prev) => (prev ? { ...prev, avatar: base64Data } : null));
      setEditProfileImage(base64Data);

      // Save to database & user context
      const success = await updateProfile({
        avatar: base64Data,
        profileImage: base64Data,
      });

      setIsUploadingImage(false);
      if (success) {
        showToast('Profile Photo / Logo Updated! 📸', 'Your picture is now live across your profile and studio.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Modal Image / Logo Upload
  const handleModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setEditProfileImage(base64Data);
        showToast('Photo Loaded', 'Click Save & Update Profile to save your new photo.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      showToast('Validation Error', 'Full Name, Email, and Phone are required.', 'warning');
      return;
    }

    setSaving(true);

    const success = await updateProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      businessName: editBusinessName.trim() || undefined,
      craftType: editCraftType.trim() || undefined,
      experienceYears: parseInt(editExperienceYears, 10) || 1,
      city: editLocation.trim() || undefined,
      bio: editBio.trim() || undefined,
      password: editPassword.trim() ? editPassword.trim() : undefined,
      avatar: editProfileImage || undefined,
      profileImage: editProfileImage || undefined,
    });

    setSaving(false);

    if (success) {
      setIsEditModalOpen(false);
      // Update local artisan preview state immediately
      setArtisan((prev) =>
        prev
          ? {
              ...prev,
              name: editName.trim(),
              businessName: editBusinessName.trim() || prev.businessName,
              craftType: editCraftType.trim() || prev.craftType,
              experienceYears: parseInt(editExperienceYears, 10) || prev.experienceYears,
              location: editLocation.trim() || prev.location,
              story: editBio.trim() || prev.story,
              phone: editPhone.trim() || prev.phone,
              avatar: editProfileImage || prev.avatar,
            }
          : null
      );
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-stone-600 font-semibold">Loading master artisan profile...</p>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <User className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Artisan Profile Not Found</h2>
        <p className="text-xs text-stone-500">Please sign in or select an artisan to view their profile.</p>
        <Link
          to="/artisan/dashboard"
          className="inline-flex items-center space-x-2 bg-[#C85A32] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/artisan/dashboard"
          className="inline-flex items-center space-x-2 text-stone-600 hover:text-[#C85A32] font-semibold text-xs transition-colors bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Dashboard</span>
        </Link>

        {role === 'ARTISAN' && isOwnProfile && (
          <button
            onClick={handleOpenEditModal}
            className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit My Profile & Details</span>
          </button>
        )}
      </div>

      {/* Main Artisan Profile Header Card */}
      <div className="glass-card bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          
          {/* Avatar & Verification Badge + Live Upload Camera Badge */}
          <div className="relative group shrink-0">
            <div className="relative overflow-hidden rounded-3xl border-4 border-amber-300 shadow-xl w-32 h-32 sm:w-36 sm:h-36 bg-stone-100 flex items-center justify-center">
              <img
                src={artisan.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                alt={artisan.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Direct Hover / Click Upload Overlay for Own Profile */}
              {isOwnProfile && role === 'ARTISAN' && (
                <button
                  type="button"
                  onClick={() => directFileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold p-2 text-center cursor-pointer"
                  title="Click to Upload Profile Photo or Company Logo"
                >
                  {isUploadingImage ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1 text-amber-300 drop-shadow" />
                      <span>Change Photo / Logo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Floating Quick Upload Camera Button on Mobile/Desktop */}
            {isOwnProfile && role === 'ARTISAN' && (
              <button
                type="button"
                onClick={() => directFileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute -top-2 -left-2 bg-[#C85A32] hover:bg-[#b04b27] text-white p-2 rounded-2xl shadow-lg border-2 border-white transition-transform active:scale-90 flex items-center justify-center group-hover:scale-110 cursor-pointer"
                title="Upload Profile Picture or Logo"
              >
                {isUploadingImage ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Hidden Direct File Input */}
            <input
              type="file"
              ref={directFileInputRef}
              onChange={handleDirectImageUpload}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
            />

            {artisan.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md" title="Verified Master Artisan">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-amber-100 text-[#C85A32] text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VERIFIED MASTER ARTISAN</span>
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{artisan.experienceYears} Years Craft Heritage</span>
              </span>
            </div>

            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-stone-900">
                {artisan.name}
              </h1>
              {artisan.businessName && (
                <p className="text-sm font-bold text-[#C85A32] flex items-center justify-center md:justify-start space-x-1.5 mt-0.5">
                  <Building2 className="w-4 h-4" />
                  <span>{artisan.businessName}</span>
                </p>
              )}
            </div>

            {/* Location & Contact Info Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-stone-600">
              <span className="flex items-center space-x-1 font-medium bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{artisan.location}</span>
              </span>

              {isOwnProfile && currentUser?.email && (
                <span className="flex items-center space-x-1 font-medium bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span>{currentUser.email}</span>
                </span>
              )}

              {artisan.phone && (
                <span className="flex items-center space-x-1 font-medium bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>{artisan.phone}</span>
                </span>
              )}
            </div>

            {/* Craft Story / Bio */}
            {artisan.story && (
              <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-700 italic font-serif leading-relaxed">
                "{artisan.story}"
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 text-center md:text-left">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Craft Specialty</span>
            <span className="text-xs sm:text-sm font-bold text-stone-900 truncate block mt-0.5">
              {artisan.craftType}
            </span>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 text-center md:text-left">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Published Items</span>
            <span className="text-xs sm:text-sm font-bold text-[#C85A32] block mt-0.5">
              {products.length} Active Crafts
            </span>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 text-center md:text-left">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Heritage Experience</span>
            <span className="text-xs sm:text-sm font-bold text-stone-900 block mt-0.5">
              {artisan.experienceYears} Years Master
            </span>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 text-center md:text-left">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Buyer Rating</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600 block mt-0.5">
              ⭐ {artisan.rating} ({artisan.reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Published Items Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-stone-900 flex items-center space-x-2">
              <Package className="w-6 h-6 text-[#C85A32]" />
              <span>Published Crafts & Catalogue ({products.length})</span>
            </h2>
            <p className="text-xs text-stone-500">
              All authentic handcrafted products created and published by {artisan.name}.
            </p>
          </div>

          {isOwnProfile && (
            <Link
              to="/artisan/products/new"
              className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Product</span>
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-card bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-4">
            <Layers className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-900 text-base">No Published Products Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't listed any handcrafted products yet. Start by using our AI Assist tool to create your first catalogue item!
            </p>
            <Link
              to="/artisan/products/new"
              className="inline-flex items-center space-x-2 bg-[#C85A32] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg hover:bg-[#b04b27] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Product</span>
            </Link>
          </div>
        )}
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditModalOpen && (
        <ModalPortal>
          <div 
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] flex items-center justify-center p-3 sm:p-6 bg-stone-900/30 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsEditModalOpen(false);
            }}
          >
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200">
              
              {/* Sticky Modal Header */}
              <div className="shrink-0 p-5 sm:p-6 bg-gradient-to-r from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="w-5 h-5 text-amber-300" />
                    <h3 className="font-display font-extrabold text-xl">Edit Master Artisan Profile</h3>
                  </div>
                  <p className="text-xs text-amber-100/90">
                    Update your contact details, craft specialty, workshop name, and credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Body Form */}
              <form id="edit-artisan-profile-form" onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 text-xs">
                
                {/* Profile Photo / Company Logo Upload Card */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-900 font-bold text-xs flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-[#C85A32]" />
                      <span>Profile Picture or Company / Brand Logo</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">Supports JPG, PNG, WEBP, SVG</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview Thumbnail */}
                    <div className="relative shrink-0">
                      <img
                        src={editProfileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                        alt="Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md bg-white"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => modalFileInputRef.current?.click()}
                          className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload From Device</span>
                        </button>

                        {editProfileImage && (
                          <button
                            type="button"
                            onClick={() => setEditProfileImage('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400')}
                            className="bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 px-3 py-2 rounded-xl font-semibold text-xs flex items-center space-x-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Reset Default</span>
                          </button>
                        )}
                      </div>

                      {/* Hidden Modal File Input */}
                      <input
                        type="file"
                        ref={modalFileInputRef}
                        onChange={handleModalImageUpload}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        className="hidden"
                      />

                      {/* Quick Presets */}
                      <div className="pt-1">
                        <span className="text-[10px] text-stone-400 font-semibold block mb-1">Or choose a craft theme preset:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {CRAFT_AVATAR_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => setEditProfileImage(p.url)}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all cursor-pointer ${
                                editProfileImage === p.url
                                  ? 'border-[#C85A32] bg-amber-100/70 text-[#C85A32] font-bold'
                                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Name & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Meena Ben Vankar"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                        required
                      />
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Mobile Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 98250 12345"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                        required
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="artisan@domain.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                      required
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Workshop / Company Name & Craft Specialty Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Workshop / Company Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editBusinessName}
                        onChange={(e) => setEditBusinessName(e.target.value)}
                        placeholder="e.g. Kutch Handloom Studio"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                      />
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Craft Specialty / Technique</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editCraftType}
                        onChange={(e) => setEditCraftType(e.target.value)}
                        placeholder="e.g. Patola Weaving, Terracotta"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                      />
                      <Palette className="w-4 h-4 text-[#C85A32] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* Experience Years & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Years of Experience *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={editExperienceYears}
                        onChange={(e) => setEditExperienceYears(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                        required
                      />
                      <Award className="w-4 h-4 text-[#C85A32] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Workshop Location (City & State)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="e.g. Patan, Gujarat"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white"
                      />
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* Bio / Craft Story */}
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Craft Story / Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Share your artisan journey, traditional heritage, and weaving philosophy..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white resize-none"
                  />
                </div>

                {/* Optional Password Update */}
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                  <label className="block text-stone-700 font-bold">
                    Change Password (Leave blank to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-10 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </form>

              {/* Sticky Modal Footer Actions */}
              <div className="shrink-0 bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-artisan-profile-form"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#b04b27] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 transform active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save & Update Profile'}</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
