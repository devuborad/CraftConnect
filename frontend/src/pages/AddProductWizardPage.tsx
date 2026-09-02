import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Share2 } from 'lucide-react';
import { AIImageStudio } from '../components/ai/AIImageStudio';
import { VoiceRecorder } from '../components/ai/VoiceRecorder';
import { AICatalogueCard } from '../components/ai/AICatalogueCard';
import { AIPricingAssistant } from '../components/ai/AIPricingAssistant';
import type { CatalogueResult } from '../services/ai';
import { aiService } from '../services/ai';
import { productService } from '../services/products';
import { useApp } from '../context/AppContext';
import type { Product } from '../types';

import { useNavigate } from 'react-router-dom';

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
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string>('');
  const [rawStoryText, setRawStoryText] = useState<string>('');
  const [catalogue, setCatalogue] = useState<CatalogueResult | null>(null);
  const [price, setPrice] = useState<number>(2499);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

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

  // Step 2 transcript complete -> generate catalogue
  const handleTranscriptComplete = async (text: string, langName: string = 'Gujarati') => {
    setRawStoryText(text);
    setCurrentStep(3);
    let langCode: 'gu' | 'hi' | 'en' = 'gu';
    if (langName.toLowerCase().includes('hindi')) langCode = 'hi';
    if (langName.toLowerCase().includes('english')) langCode = 'en';

    const cat = await aiService.generateCatalogue(text, langCode, enhancedPhotoUrl || photoUrl);
    setCatalogue(cat);
  };

  // Step 3 catalogue proceed -> pricing
  const handleCatalogueConfirmed = (finalCat: CatalogueResult) => {
    setCatalogue(finalCat);
    setCurrentStep(4);
  };

  // Step 4 pricing confirmed -> review
  const handlePricingConfirmed = (recPrice: number) => {
    setPrice(recPrice);
    setCurrentStep(5);
  };

  // Step 5 final publish
  const handlePublish = async () => {
    const created = await productService.createProduct({
      title: catalogue?.titleEn || 'Handwoven Kutch Cotton Saree',
      titleGujarati: catalogue?.titleGu,
      titleHindi: catalogue?.titleHi,
      category: catalogue?.category || 'Textiles',
      material: catalogue?.material || 'Organic Cotton',
      craftType: catalogue?.craftType || 'Handloom',
      origin: catalogue?.origin || 'Kutch, Gujarat',
      price: price,
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
    await productService.saveDraftProduct({
      title: catalogue?.titleEn || 'Handwoven Craft Product Draft',
      titleGujarati: catalogue?.titleGu,
      titleHindi: catalogue?.titleHi,
      category: catalogue?.category || 'Textiles',
      material: catalogue?.material || 'Organic Cotton',
      craftType: catalogue?.craftType || 'Handloom',
      origin: catalogue?.origin || 'Gujarat',
      price: price,
      originalImage: photoUrl,
      enhancedImage: enhancedPhotoUrl || photoUrl,
      descriptionEn: catalogue?.descriptionEn || 'Draft product.',
      descriptionHi: catalogue?.descriptionHi,
      descriptionGu: catalogue?.descriptionGu
    });

    showToast('Product Saved as Draft 📁', 'Your product draft is saved in your dashboard', 'success');
    navigate('/artisan/dashboard');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Invalid file format', 'Please select an image file (JPG, PNG, WEBP)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotoUrl(evt.target.result as string);
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
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotoUrl(evt.target.result as string);
          showToast('Photo Dropped Successfully 📷', 'You can now enhance it with AI or proceed', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Visual Progress Stepper */}
      <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div key={step.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow'
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
              </div>
            );
          })}
        </div>
      </div>

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
                  className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-102"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device / Camera</span>
                </button>
              </div>
            </div>
          </div>

          {photoUrl && <AIImageStudio originalImage={photoUrl} onConfirmImage={handlePhotoConfirmed} />}
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
                showToast('Regenerating catalogue...', '', 'info');
              }}
            />
          ) : (
            <div className="py-12 text-center space-y-3 bg-white rounded-3xl p-6 border border-stone-200 ios-fade-in">
              <div className="w-10 h-10 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-700">AI is crafting your product title and descriptions...</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: AI PRICING ASSISTANT */}
      {currentStep === 4 && (
        <div className="space-y-6 ios-fade-up">
          <AIPricingAssistant onPricingConfirmed={handlePricingConfirmed} />
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
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#C85A32] font-semibold hover:underline"
            >
              Edit Details
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

            <div className="space-y-3 text-xs">
              <h4 className="font-display font-bold text-lg text-stone-900">{catalogue?.titleEn}</h4>
              <p className="text-sm font-extrabold text-[#4A2E1B]">₹{price.toLocaleString('en-IN')}</p>
              
              <div className="bg-[#FAF7F2] p-3 rounded-xl space-y-1">
                <p><strong>Craft:</strong> {catalogue?.craftType}</p>
                <p><strong>Material:</strong> {catalogue?.material}</p>
                <p><strong>Origin:</strong> {catalogue?.origin}</p>
              </div>

              <p className="text-stone-700 leading-relaxed italic">{catalogue?.descriptionEn}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-1/2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 border border-stone-300 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="w-full sm:w-1/2 bg-[#C85A32] hover:bg-[#b04b27] active:scale-95 text-white py-3.5 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-102"
            >
              <span>Publish Product Live to Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: PUBLISHED SUCCESS 🎉 */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-2xl text-center space-y-6 ios-scale-in">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner text-3xl animate-pulse-ring">
            🎉
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-stone-900">
              Your Product is Live!
            </h2>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Congratulations! Your product is now visible on CraftConnect AI marketplace to thousands of buyers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {publishedProduct && (
              <Link
                to={`/product/${publishedProduct.id}`}
                className="w-full sm:w-auto bg-[#4A2E1B] hover:bg-[#382213] active:scale-95 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all"
              >
                View Product Page
              </Link>
            )}

            <button
              onClick={() => showToast('Share link copied to clipboard!', '', 'success')}
              className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 active:scale-95 text-[#C85A32] border border-amber-200 px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Product</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                setCatalogue(null);
              }}
              className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 px-6 py-3 rounded-xl font-bold text-xs transition-all"
            >
              + Add Another Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
