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
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string>('');
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
  const handleTranscriptComplete = async (text: string) => {
    setCurrentStep(3);
    const cat = await aiService.generateCatalogue(text);
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
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
            <h3 className="font-display font-bold text-xl text-stone-900">
              Step 1: Upload Product Photo
            </h3>

            <div className="border-2 border-dashed border-stone-300 rounded-3xl p-8 text-center space-y-4 bg-[#FAF7F2]">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#C85A32] flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">📷 Take Photo or Upload from Gallery</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Drag & drop image file or tap button below
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800')}
                  className="bg-[#C85A32] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                >
                  Sample Photo 1 (Saree)
                </button>
                <button
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800')}
                  className="bg-stone-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                >
                  Sample Photo 2 (Pottery)
                </button>
              </div>
            </div>
          </div>

          <AIImageStudio originalImage={photoUrl} onConfirmImage={handlePhotoConfirmed} />
        </div>
      )}

      {/* STEP 2: VOICE STORY */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <VoiceRecorder onTranscriptComplete={handleTranscriptComplete} />
        </div>
      )}

      {/* STEP 3: AI CATALOGUE RESULT */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {catalogue ? (
            <AICatalogueCard
              catalogue={catalogue}
              onProceedToPricing={handleCatalogueConfirmed}
              onRegenerate={() => {
                showToast('Regenerating catalogue...', '', 'info');
              }}
            />
          ) : (
            <div className="py-12 text-center space-y-3 bg-white rounded-3xl p-6 border border-stone-200">
              <div className="w-10 h-10 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-700">AI is crafting your product title and descriptions...</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: AI PRICING ASSISTANT */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <AIPricingAssistant onPricingConfirmed={handlePricingConfirmed} />
        </div>
      )}

      {/* STEP 5: REVIEW LISTING */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="bg-amber-100 text-[#C85A32] text-[10px] font-bold px-2 py-0.5 rounded">FINAL PREVIEW</span>
              <h3 className="font-display font-bold text-xl text-stone-900 mt-1">Review Your Product Listing</h3>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#C85A32] font-semibold hover:underline"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={enhancedPhotoUrl || photoUrl}
              alt="Listing preview"
              className="w-full aspect-4/3 rounded-2xl object-cover border border-amber-200"
            />

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

          <button
            onClick={handlePublish}
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2"
          >
            <span>Publish Product Live to Marketplace</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 6: PUBLISHED SUCCESS 🎉 */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner text-3xl">
            🎉
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-stone-900">
              Your Product is Live!
            </h2>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Congratulations Meena! Your product is now visible on CraftConnect AI marketplace to thousands of buyers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {publishedProduct && (
              <Link
                to={`/product/${publishedProduct.id}`}
                className="w-full sm:w-auto bg-[#4A2E1B] text-white px-6 py-3 rounded-xl font-bold text-xs shadow"
              >
                View Product Page
              </Link>
            )}

            <button
              onClick={() => showToast('Share link copied to clipboard!', '', 'success')}
              className="w-full sm:w-auto bg-amber-50 text-[#C85A32] border border-amber-200 px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Product</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                setCatalogue(null);
              }}
              className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-xl font-bold text-xs"
            >
              + Add Another Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
