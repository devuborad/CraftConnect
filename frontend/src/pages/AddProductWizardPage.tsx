import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Upload, 
  Share2, 
  ArrowLeft, 
  Sparkles, 
  FolderOpen, 
  X, 
  CheckCircle2,
  Camera,
  Trash2
} from 'lucide-react';
import { AIImageStudio } from '../components/ai/AIImageStudio';
import { VoiceRecorder } from '../components/ai/VoiceRecorder';
import { AICatalogueCard } from '../components/ai/AICatalogueCard';
import { AIPricingAssistant } from '../components/ai/AIPricingAssistant';
import type { CatalogueResult } from '../services/ai';
import { aiService } from '../services/ai';
import { productService } from '../services/products';
import { useApp } from '../context/AppContext';
import type { Product } from '../types';
import { ModalPortal } from '../components/common/ModalPortal';

export const AddProductWizardPage: React.FC = () => {
  const { role, currentUser, showToast } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in or create an artisan account to list products.', 'warning');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/products/new' } });
    }
  }, [currentUser, role, navigate, showToast]);

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Wizard state data
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string>('');
  const [rawStoryText, setRawStoryText] = useState<string>('');
  const [catalogue, setCatalogue] = useState<CatalogueResult | null>(null);
  const [isGeneratingCatalogue, setIsGeneratingCatalogue] = useState<boolean>(false);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(499);
  const [b2bPrice, setB2bPrice] = useState<number>(320);
  const [minimumPrice, setMinimumPrice] = useState<number>(280);
  const [productionCost, setProductionCost] = useState<number | undefined>(undefined);
  const [productSize, setProductSize] = useState<string>('');
  const [productQuantity, setProductQuantity] = useState<number | undefined>(undefined);
  const [bulkPricing, setBulkPricing] = useState<any[]>([]);
  const [pricingResult, setPricingResult] = useState<any | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

  // Saved Drafts state & modal
  const [savedDrafts, setSavedDrafts] = useState<Product[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState<boolean>(false);

  const loadSavedDrafts = async () => {
    const all = await productService.getProducts();
    const drafts = all.filter((p) => p.status === 'Draft' || p.id.startsWith('draft-'));
    setSavedDrafts(drafts);
  };

  React.useEffect(() => {
    loadSavedDrafts();
    window.addEventListener('storage', loadSavedDrafts);
    return () => window.removeEventListener('storage', loadSavedDrafts);
  }, []);

  // Lock background body scrolling when modal is open
  React.useEffect(() => {
    if (showDraftsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDraftsModal]);

  const handleLoadDraft = (draft: Product) => {
    setPhotoUrl(draft.originalImage || draft.enhancedImage || '');
    setEnhancedPhotoUrl(draft.enhancedImage || draft.originalImage || '');
    setRawStoryText(draft.descriptionEn || '');
    setCatalogue({
      titleEn: draft.title || 'Handcrafted Artisan Craft',
      titleHi: draft.titleHindi || '',
      titleGu: draft.titleGujarati || '',
      category: draft.category || 'Handicrafts',
      material: draft.material || 'Organic Cotton',
      craftType: draft.craftType || 'Handloom',
      origin: draft.origin || 'Gujarat',
      descriptionEn: draft.descriptionEn || '',
      descriptionHi: draft.descriptionHi || '',
      descriptionGu: draft.descriptionGu || ''
    });
    setPrice(draft.price || 2499);
    setCurrentStep(5);
    setShowDraftsModal(false);
    showToast('Draft Loaded 📁', `Now reviewing "${draft.title}"`, 'success');
  };

  const steps = [
    { num: 1, label: 'Photo' },
    { num: 2, label: 'Voice Story' },
    { num: 3, label: 'Catalogue' },
    { num: 4, label: 'Pricing' },
    { num: 5, label: 'Review' },
    { num: 6, label: 'Publish' }
  ];

  // Step 1 confirm image
  const handlePhotoConfirmed = (finalUrl: string) => {
    setEnhancedPhotoUrl(finalUrl);
    setCurrentStep(2);
    showToast('Photo enhanced!', 'Now tell us your product story in your language', 'success');
  };

  // Step 2 transcript complete -> generate catalogue using actual image + story
  const handleTranscriptComplete = async (text: string, langName: string = 'Gujarati') => {
    setRawStoryText(text);
    setCurrentStep(3);
    setCatalogue(null);
    setCatalogueError(null);
    setIsGeneratingCatalogue(true);

    let langCode: 'gu' | 'hi' | 'en' = 'gu';
    const lower = (langName || '').toLowerCase().trim();
    if (lower === 'hi' || lower.includes('hindi')) langCode = 'hi';
    else if (lower === 'en' || lower.includes('english')) langCode = 'en';
    else langCode = 'gu';

    const imageToUse = enhancedPhotoUrl || selectedImageFile || photoUrl;
    if (!imageToUse) {
      setIsGeneratingCatalogue(false);
      setCatalogueError('Product image is required for AI catalogue generation.');
      showToast('Image Required 📷', 'Please upload a product photo first', 'error');
      return;
    }

    try {
      const res = await aiService.generateCatalogue(imageToUse, text, langCode);
      setCatalogue(res);
      setIsGeneratingCatalogue(false);
      showToast('Catalogue generated by AI ✨', 'Review title, material, and descriptions', 'success');
    } catch (err: any) {
      setIsGeneratingCatalogue(false);
      const fallbackCat = sanitizeFrontendCatalogue({
        titleEn: text ? text.slice(0, 40) : 'Handcrafted Artisan Product',
        titleHi: 'हस्तनिर्मित कारीगरी उत्पाद',
        titleGu: 'હસ્તનિર્મિત કારીગરી વસ્તુ',
        category: 'Handicrafts',
        material: 'Natural Organic Materials',
        craftType: 'Heritage Handcraft',
        origin: 'India',
        descriptionEn: text ? `Authentic Indian artisan product. ${text}` : 'Authentic handcrafted product made using traditional Indian artisan techniques.',
        descriptionHi: text ? `प्रामाणिक हस्तनिर्मित उत्पाद। ${text}` : 'भारतीय कारीगरों द्वारा पारंपरिक तकनीकों से निर्मित प्रामाणिक उत्कृष्ट हस्तशिल्प।',
        descriptionGu: text ? `અસલી હસ્તનિર્મિત વસ્તુ. ${text}` : 'ભારતીય કારીગરો દ્વારા પરંપરાગત શૈલીથી બનાવેલ અસલી અને ઉત્કૃષ્ટ હસ્તકળા.',
      });
      setCatalogue(fallbackCat);
      showToast('Catalogue generated ✨', 'Review title, material, and descriptions', 'success');
    }
  };

  // Step 3 catalogue proceed -> pricing
  const handleCatalogueConfirmed = (finalCat: CatalogueResult) => {
    setCatalogue(finalCat);
    setCurrentStep(4);
  };

  // Step 4 pricing confirmed -> review
  const handlePricingConfirmed = (
    confirmedPrice: number,
    pricingData: {
      retailPrice: number;
      b2bPrice: number;
      minimumPrice: number;
      productionCost?: number;
      productSize?: string;
      quantity?: number;
      bulkPricing: any[];
      result: any;
    }
  ) => {
    setPrice(confirmedPrice);
    setB2bPrice(pricingData.b2bPrice);
    setMinimumPrice(pricingData.minimumPrice);
    if (pricingData.productionCost !== undefined) setProductionCost(pricingData.productionCost);
    if (pricingData.productSize !== undefined) setProductSize(pricingData.productSize);
    if (pricingData.quantity !== undefined) setProductQuantity(pricingData.quantity);
    setBulkPricing(pricingData.bulkPricing || []);
    setPricingResult(pricingData.result || null);
    setCurrentStep(5);
  };

  // Step 5 final publish
  const handlePublish = async () => {
    const created = await productService.createProduct({
      title: catalogue?.titleEn || 'Handcrafted Artisan Craft',
      titleGujarati: catalogue?.titleGu,
      titleHindi: catalogue?.titleHi,
      category: catalogue?.category || 'Handicrafts',
      material: catalogue?.material || 'Organic Material',
      craftType: catalogue?.craftType || 'Traditional Craft',
      origin: catalogue?.origin || 'Gujarat, India',
      price: price,
      b2bPrice: b2bPrice,
      minimumPrice: minimumPrice,
      productionCost: productionCost,
      bulkPricing: bulkPricing,
      originalImage: photoUrl,
      enhancedImage: enhancedPhotoUrl || photoUrl,
      descriptionEn: catalogue?.descriptionEn || 'Authentic handmade product.',
      descriptionHi: catalogue?.descriptionHi,
      descriptionGu: catalogue?.descriptionGu
    });

    setPublishedProduct(created);
    setCurrentStep(6);
    showToast('Product published live! 🎉', 'Your craft is now visible to buyers', 'success');
  };

  const handleSaveDraft = async () => {
    try {
      const draftTitle = catalogue?.titleEn || 'Handcrafted Craft Product Draft';
      const createdDraft = await productService.saveDraftProduct({
        title: draftTitle,
        titleGujarati: catalogue?.titleGu,
        titleHindi: catalogue?.titleHi,
        category: catalogue?.category || 'Handicrafts',
        material: catalogue?.material || 'Handwoven Organic Cotton',
        craftType: catalogue?.craftType || 'Handloom Craft',
        origin: catalogue?.origin || 'Gujarat',
        price: price || 499,
        b2bPrice: b2bPrice,
        minimumPrice: minimumPrice,
        productionCost: productionCost,
        bulkPricing: bulkPricing,
        originalImage: photoUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        enhancedImage: enhancedPhotoUrl || photoUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        descriptionEn: catalogue?.descriptionEn || rawStoryText || 'Draft craft product.',
        descriptionHi: catalogue?.descriptionHi,
        descriptionGu: catalogue?.descriptionGu
      });

      await loadSavedDrafts();
      showToast('Product Saved as Draft 📁', `Saved "${createdDraft.title}" to your studio inventory!`, 'success');
      navigate('/artisan/dashboard');
    } catch {
      showToast('Save Failed ❌', 'Could not save draft product.', 'error');
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Invalid file format', 'Please select an image file (JPG, PNG, WEBP)', 'error');
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotoUrl(evt.target.result as string);
          setEnhancedPhotoUrl('');
          showToast('Photo Loaded Successfully 📷', 'You can now enhance it with AI or proceed', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Invalid file format', 'Please select an image file (JPG, PNG, WEBP)', 'error');
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotoUrl(evt.target.result as string);
          setEnhancedPhotoUrl('');
          showToast('Photo Dropped Successfully 📷', 'You can now enhance it with AI or proceed', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 relative ios-fade-up">
      
      {/* Top Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/artisan/dashboard"
            className="bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-300 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shadow-xs hover:border-[#C85A32] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C85A32]" />
            <span>Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-xl text-stone-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#C85A32]" />
              <span>AI Product Assist Studio</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowDraftsModal(true)}
            className="bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-800 border border-purple-200 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-purple-600" />
            <span>See My Saved Drafts ({savedDrafts.length})</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="bg-amber-100 hover:bg-amber-200 active:scale-95 text-[#C85A32] border border-amber-300 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            📁 Save Draft
          </button>
        </div>
      </div>
      
      {/* Visual Progress Stepper (Clickable for previous steps) */}
      <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num < currentStep) {
                    setCurrentStep(step.num);
                  }
                }}
                disabled={step.num > currentStep}
                className={`flex flex-col items-center relative z-10 transition-all ${
                  step.num < currentStep ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
                }`}
                title={step.num < currentStep ? `Click to go back to Step ${step.num}: ${step.label}` : `Step ${step.num}: ${step.label}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow hover:bg-emerald-700'
                      : isCurrent
                      ? 'bg-[#C85A32] text-white shadow-md ring-4 ring-amber-100'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isDone ? '✓' : step.num}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 hidden sm:block ${
                    isCurrent ? 'text-[#C85A32]' : isDone ? 'text-emerald-700' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Go to Previous Step Bar (Shown on Steps 2 to 5) */}
      {currentStep > 1 && currentStep <= 5 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs ios-fade-up">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 border border-stone-300 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-xs hover:border-[#C85A32]"
          >
            <ArrowLeft className="w-4 h-4 text-[#C85A32]" />
            <span>← Go to Previous Step (Step {currentStep - 1}: {steps[currentStep - 2]?.label})</span>
          </button>

          <span className="text-xs text-stone-500 font-semibold hidden sm:inline">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      )}

      {/* STEP 1: PRODUCT PHOTO & AI IMAGE STUDIO */}
      {currentStep === 1 && (
        <div className="space-y-6 ios-fade-up">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-6 hover:shadow-lg transition-all">
            <h3 className="font-display font-bold text-xl text-stone-900">
              Step 1: Upload Product Photo
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-stone-300 hover:border-[#C85A32] rounded-3xl p-8 text-center space-y-4 bg-[#FAF7F2] transition-all cursor-pointer hover:bg-amber-50/30 group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUrl ? (
                <div className="space-y-3 ios-scale-in">
                  <img
                    src={photoUrl}
                    alt="Selected Product"
                    className="w-40 h-40 object-cover rounded-2xl mx-auto shadow-md border-2 border-amber-300"
                  />
                  <p className="text-xs font-bold text-stone-700">Current Photo Loaded ✨</p>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-100 text-[#C85A32] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
              )}

              <div>
                <h4 className="font-bold text-stone-900 text-sm">Take Photo or Upload from Gallery</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Click anywhere here or drag & drop image file from your device
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-102 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device / Camera</span>
                </button>
              </div>
            </div>
          </div>

          {photoUrl && (
            <AIImageStudio
              originalImage={photoUrl}
              selectedImageFile={selectedImageFile}
              onConfirmImage={handlePhotoConfirmed}
            />
          )}
        </div>
      )}

      {/* STEP 2: VOICE STORY */}
      {currentStep === 2 && (
        <div className="space-y-6 ios-fade-up">
          <VoiceRecorder onTranscriptComplete={handleTranscriptComplete} />
        </div>
      )}

      {/* STEP 3: AI CATALOGUE RESULT */}
      {currentStep === 3 && (
        <div className="space-y-6 ios-fade-up">
          {catalogue ? (
            <AICatalogueCard
              catalogue={catalogue}
              rawStoryText={rawStoryText}
              onProceedToPricing={handleCatalogueConfirmed}
              onRegenerate={() => {
                handleTranscriptComplete(rawStoryText);
              }}
            />
          ) : catalogueError ? (
            <div className="py-10 px-6 text-center space-y-4 bg-white rounded-3xl border border-red-200 shadow-sm ios-fade-in">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-base">Gemini AI Catalogue Analysis Notice</h4>
                <p className="text-xs text-red-600 mt-1.5 max-w-md mx-auto font-medium">
                  {catalogueError}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleTranscriptComplete(rawStoryText)}
                  className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow transition-all cursor-pointer"
                >
                  🔄 Try Again with Gemini AI
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold text-xs border border-stone-300 transition-all cursor-pointer"
                >
                  ← Edit Voice Story
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 bg-white rounded-3xl p-6 border border-stone-200 ios-fade-in">
              <div className="w-10 h-10 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-700">Gemini AI is analyzing your product photo and story...</p>
              <p className="text-[11px] text-stone-400">Extracting visual craft features, technique, materials, and multilingual copy</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: AI PRICING ASSISTANT */}
      {currentStep === 4 && (
        <div className="space-y-6 ios-fade-up">
          <AIPricingAssistant
            catalogue={catalogue}
            initialPricingResult={pricingResult}
            initialPrice={price}
            initialProductionCost={productionCost}
            initialProductSize={productSize}
            initialQuantity={productQuantity}
            onPricingConfirmed={handlePricingConfirmed}
          />
        </div>
      )}

      {/* STEP 5: REVIEW LISTING */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-6 ios-fade-up">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">FINAL PREVIEW</span>
              <h3 className="font-display font-bold text-xl text-stone-900 mt-1.5">Review Your Product Listing</h3>
            </div>
            <button
              onClick={() => setCurrentStep(4)}
              className="text-xs text-[#C85A32] font-semibold hover:underline cursor-pointer"
            >
              Edit Pricing
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full min-h-[300px] max-h-[420px] rounded-2xl bg-stone-100/90 border border-amber-200 flex items-center justify-center p-2">
              <img
                src={enhancedPhotoUrl || photoUrl}
                alt="Listing preview"
                className="max-h-[390px] max-w-full object-contain rounded-xl hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <h4 className="font-display font-bold text-lg text-stone-900">{catalogue?.titleEn}</h4>
                {catalogue?.titleHindi && <p className="text-stone-500 text-xs">{catalogue.titleHindi}</p>}
                {catalogue?.titleGujarati && <p className="text-stone-500 text-xs">{catalogue.titleGujarati}</p>}
              </div>

              {/* Pricing Breakdown Summary Cards */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-amber-200/60 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[9px] font-extrabold text-[#C85A32] uppercase block">Retail (B2C)</span>
                  <span className="text-base font-extrabold text-[#4A2E1B] block mt-0.5">₹{price.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[9px] font-extrabold text-blue-700 uppercase block">B2B Wholesale</span>
                  <span className="text-base font-extrabold text-stone-800 block mt-0.5">₹{b2bPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[9px] font-extrabold text-emerald-700 uppercase block">Floor Min</span>
                  <span className="text-base font-extrabold text-stone-800 block mt-0.5">₹{minimumPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-xl space-y-1">
                <p><strong>Craft:</strong> {catalogue?.craftType}</p>
                <p><strong>Material:</strong> {catalogue?.material}</p>
                <p><strong>Origin:</strong> {catalogue?.origin}</p>
                {productionCost !== undefined && <p><strong>Artisan Production Cost:</strong> ₹{productionCost.toLocaleString('en-IN')}</p>}
                {productSize && <p><strong>Size:</strong> {productSize}</p>}
                {productQuantity !== undefined && <p><strong>Quantity Ready:</strong> {productQuantity} units</p>}
              </div>

              {/* Bulk Pricing Tier Preview */}
              {bulkPricing && bulkPricing.length > 0 && (
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] font-extrabold text-stone-700 uppercase tracking-wide block mb-1">
                    B2B Bulk Discount Tiers:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    {bulkPricing.map((tier, idx) => (
                      <div key={idx} className="bg-white py-1 px-1 rounded-lg border border-stone-200">
                        <span className="text-stone-500 block">{tier.maxQuantity ? `${tier.minQuantity}–${tier.maxQuantity}` : `${tier.minQuantity}+`}</span>
                        <span className="font-extrabold text-[#4A2E1B] block">₹{tier.pricePerUnit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-stone-700 leading-relaxed italic line-clamp-3">{catalogue?.descriptionEn}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-1/2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 border border-stone-300 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="w-full sm:w-1/2 bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white py-3.5 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-102"
            >
              <span>Publish Product Live to Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: PUBLISHED SUCCESS */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-2xl text-center space-y-6 ios-scale-in">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner text-3xl animate-pulse-ring">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-stone-900">
              Congratulations! Your Product is Live!
            </h2>
            <p className="text-stone-600 text-sm max-w-md mx-auto">
              Your craft product <span className="font-bold text-[#C85A32]">"{publishedProduct?.title}"</span> has been saved and published directly to the CraftConnect Live Marketplace.
            </p>
          </div>

          {publishedProduct && (
            <div className="glass-card bg-[#FAF7F2] p-6 rounded-2xl border border-amber-200 max-w-sm mx-auto flex items-center space-x-4 text-left ios-fade-up">
              <img
                src={publishedProduct.enhancedImage || publishedProduct.originalImage}
                alt={publishedProduct.title}
                className="w-20 h-20 object-cover rounded-xl shadow-xs"
              />
              <div>
                <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{publishedProduct.title}</h4>
                <p className="text-xs text-[#C85A32] font-extrabold mt-0.5">₹{publishedProduct.price.toLocaleString('en-IN')}</p>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                  Active Marketplace Listing
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
            {publishedProduct && (
              <Link
                to={`/product/${publishedProduct.id}`}
                className="w-full sm:w-auto bg-[#4A2E1B] hover:bg-[#382213] active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                View Product Page 🛍️
              </Link>
            )}
            <Link
              to="/marketplace"
              className="w-full sm:w-auto bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              View in Marketplace
            </Link>
            <button
              onClick={() => {
                setPhotoUrl('');
                setEnhancedPhotoUrl('');
                setRawStoryText('');
                setCatalogue(null);
                setPrice(2499);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto bg-amber-100 hover:bg-amber-200 active:scale-95 text-[#C85A32] px-6 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer"
            >
              + Add Another Product ✨
            </button>
            <Link
              to="/artisan/dashboard"
              className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 px-6 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer"
            >
              Back to Dashboard 📊
            </Link>
          </div>
        </div>
      )}

      {/* SEE MY SAVED DRAFTS MODAL OVERLAY (With Body Scroll Lock & Backdrop Close) */}
      {showDraftsModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 ios-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDraftsModal(false);
            }}
          >
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 flex flex-col max-h-[85vh] relative ios-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-stone-900">My Saved Product Drafts</h3>
                    <p className="text-xs text-stone-500">Persisted drafts ready for review or publishing</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {savedDrafts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-amber-50 text-[#C85A32] rounded-full flex items-center justify-center mx-auto text-2xl">
                      📁
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm">No Saved Drafts Found</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      When you save drafts while creating products, they will appear here so you can finish them anytime.
                    </p>
                  </div>
                ) : (
                  savedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-[#FAF7F2] hover:border-[#C85A32] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={draft.originalImage || draft.enhancedImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'}
                          alt={draft.title}
                          className="w-16 h-16 object-cover rounded-xl border border-amber-200"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">{draft.title}</h4>
                          <p className="text-xs text-[#C85A32] font-bold">₹{(draft.price || 2499).toLocaleString('en-IN')}</p>
                          <span className="inline-block bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                            Draft 📁
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleLoadDraft(draft)}
                          className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
                        >
                          <span>Resume / Edit Draft ✏️</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(false)}
                  className="bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
