import React, { useState } from 'react';
import { Sparkles, Edit3, RefreshCw, ArrowRight, Globe, MessageSquareQuote } from 'lucide-react';
import { aiService, type CatalogueResult } from '../../services/ai';

interface AICatalogueCardProps {
  catalogue: CatalogueResult;
  rawStoryText?: string;
  onProceedToPricing: (finalCatalogue: CatalogueResult) => void;
  onRegenerate: () => void;
}

export const AICatalogueCard: React.FC<AICatalogueCardProps> = ({
  catalogue: initialCatalogue,
  rawStoryText,
  onProceedToPricing,
  onRegenerate
}) => {
  const [catalogue, setCatalogue] = useState<CatalogueResult>(initialCatalogue);
  const [activeTab, setActiveTab] = useState<'en' | 'hi' | 'gu'>('en');
  const [editing, setEditing] = useState(false);
  const [useRawStory, setUseRawStory] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolishWithAI = async () => {
    setIsPolishing(true);
    try {
      const res = await aiService.generateMultilingualDescriptions({
        title: catalogue.titleEn,
        category: catalogue.category,
        material: catalogue.material,
        craftType: catalogue.craftType,
        origin: catalogue.origin,
        story: rawStoryText,
      });
      setCatalogue((prev) => ({
        ...prev,
        descriptionEn: res.descriptionEn,
        descriptionHi: res.descriptionHi,
        descriptionGu: res.descriptionGu,
      }));
    } catch (e) {
      console.warn('Failed to polish descriptions with AI:', e);
    } finally {
      setIsPolishing(false);
    }
  };

  const toggleRawStory = (useRaw: boolean) => {
    setUseRawStory(useRaw);
    if (useRaw && rawStoryText) {
      const guRegex = /[\u0A80-\u0AFF]/g;
      const hiRegex = /[\u0900-\u097F]/g;
      
      const cleanEn = rawStoryText.replace(guRegex, '').replace(hiRegex, '').replace(/\s+/g, ' ').trim();
      const cleanHi = rawStoryText.replace(guRegex, '').replace(/\s+/g, ' ').trim();
      const cleanGu = rawStoryText.replace(hiRegex, '').replace(/\s+/g, ' ').trim();

      setCatalogue((prev) => ({
        ...prev,
        descriptionEn: cleanEn || rawStoryText,
        descriptionHi: cleanHi || rawStoryText,
        descriptionGu: cleanGu || rawStoryText,
      }));
    } else if (!useRaw) {
      setCatalogue(initialCatalogue);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-fit mb-1">
            <Sparkles className="w-3 h-3 text-[#C85A32]" />
            <span>PRODUCT CATALOGUE PREVIEW</span>
          </span>
          <h3 className="font-display font-bold text-xl text-stone-900">
            Your Catalogue Details ✨
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="text-xs font-semibold text-[#C85A32] bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          <span>{editing ? 'Save Edits' : 'Edit Details'}</span>
        </button>
      </div>

      {/* Description Source Selector: Voice/Raw Story vs AI Enhanced */}
      {rawStoryText && (
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-200/80 space-y-2">
          <label className="block text-xs font-extrabold text-stone-800 uppercase tracking-wide flex items-center space-x-1.5">
            <MessageSquareQuote className="w-4 h-4 text-[#C85A32]" />
            <span>Choose Description Text Source</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleRawStory(false)}
              className={`p-3 rounded-xl border font-bold text-left transition-all flex items-center justify-between ${
                !useRawStory
                  ? 'bg-amber-600 text-white border-amber-600 shadow'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <span>✨ Use AI Polished Catalogue</span>
              {!useRawStory && <span>✓</span>}
            </button>

            <button
              type="button"
              onClick={() => toggleRawStory(true)}
              className={`p-3 rounded-xl border font-bold text-left transition-all flex items-center justify-between ${
                useRawStory
                  ? 'bg-amber-600 text-white border-amber-600 shadow'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <span>🗣️ Use My Spoken / Typed Story</span>
              {useRawStory && <span>✓</span>}
            </button>
          </div>
        </div>
      )}

      {/* Structured Meta Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 text-xs">
        <div>
          <span className="text-[10px] text-stone-400 font-bold uppercase">Category</span>
          {editing ? (
            <input
              type="text"
              value={catalogue.category}
              onChange={(e) => setCatalogue({ ...catalogue, category: e.target.value as any })}
              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 mt-1 font-bold text-stone-900"
            />
          ) : (
            <p className="font-bold text-stone-900 mt-0.5">{catalogue.category}</p>
          )}
        </div>
        <div>
          <span className="text-[10px] text-stone-400 font-bold uppercase">Craft Technique</span>
          {editing ? (
            <input
              type="text"
              value={catalogue.craftType}
              onChange={(e) => setCatalogue({ ...catalogue, craftType: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 mt-1 font-bold text-stone-900"
            />
          ) : (
            <p className="font-bold text-stone-900 mt-0.5">{catalogue.craftType}</p>
          )}
        </div>
        <div>
          <span className="text-[10px] text-stone-400 font-bold uppercase">Material</span>
          {editing ? (
            <input
              type="text"
              value={catalogue.material}
              onChange={(e) => setCatalogue({ ...catalogue, material: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 mt-1 font-bold text-stone-900"
            />
          ) : (
            <p className="font-bold text-stone-900 mt-0.5 truncate">{catalogue.material}</p>
          )}
        </div>
        <div>
          <span className="text-[10px] text-stone-400 font-bold uppercase">Origin</span>
          {editing ? (
            <input
              type="text"
              value={catalogue.origin}
              onChange={(e) => setCatalogue({ ...catalogue, origin: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 mt-1 font-bold text-stone-900"
            />
          ) : (
            <p className="font-bold text-stone-900 mt-0.5">{catalogue.origin}</p>
          )}
        </div>
      </div>

      {/* Title Edit */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-stone-700">
            Product Title ({activeTab === 'gu' ? 'ગુજરાતી' : activeTab === 'hi' ? 'हिन्दी' : 'English'})
          </label>
        </div>
        {editing ? (
          <input
            type="text"
            value={activeTab === 'gu' ? (catalogue.titleGu || catalogue.titleEn) : activeTab === 'hi' ? (catalogue.titleHi || catalogue.titleEn) : catalogue.titleEn}
            onChange={(e) => {
              if (activeTab === 'gu') setCatalogue({ ...catalogue, titleGu: e.target.value });
              else if (activeTab === 'hi') setCatalogue({ ...catalogue, titleHi: e.target.value });
              else setCatalogue({ ...catalogue, titleEn: e.target.value });
            }}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
          />
        ) : (
          <h4 className="font-display font-bold text-lg text-stone-900 bg-stone-50 p-3 rounded-xl border border-stone-200">
            {activeTab === 'gu' ? (catalogue.titleGu || catalogue.titleEn) : activeTab === 'hi' ? (catalogue.titleHi || catalogue.titleEn) : catalogue.titleEn}
          </h4>
        )}
      </div>

      {/* Multilingual Description Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#C85A32]" />
            <span className="text-xs font-bold text-stone-800">Multilingual Descriptions</span>
            <button
              type="button"
              onClick={handlePolishWithAI}
              disabled={isPolishing}
              className="text-[11px] font-bold text-[#C85A32] bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all disabled:opacity-50 shadow-sm ml-1"
              title="Generate rich storytelling descriptions with Gemini AI"
            >
              <Sparkles className={`w-3 h-3 text-[#C85A32] ${isPolishing ? 'animate-spin' : ''}`} />
              <span>{isPolishing ? 'Generating...' : 'Polish with AI'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'en' ? 'bg-[#4A2E1B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'hi' ? 'bg-[#4A2E1B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gu')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'gu' ? 'bg-[#4A2E1B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>

        {activeTab === 'en' && (
          <div>
            {editing ? (
              <textarea
                rows={3}
                value={catalogue.descriptionEn}
                onChange={(e) => setCatalogue({ ...catalogue, descriptionEn: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
            ) : (
              <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
                {catalogue.descriptionEn}
              </p>
            )}
          </div>
        )}

        {activeTab === 'hi' && (
          <div>
            {editing ? (
              <textarea
                rows={3}
                value={catalogue.descriptionHi}
                onChange={(e) => setCatalogue({ ...catalogue, descriptionHi: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
            ) : (
              <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
                {catalogue.descriptionHi}
              </p>
            )}
          </div>
        )}

        {activeTab === 'gu' && (
          <div>
            {editing ? (
              <textarea
                rows={3}
                value={catalogue.descriptionGu}
                onChange={(e) => setCatalogue({ ...catalogue, descriptionGu: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
            ) : (
              <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
                {catalogue.descriptionGu}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onRegenerate}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center justify-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate Again</span>
        </button>

        <button
          type="button"
          onClick={() => onProceedToPricing(catalogue)}
          className="w-full sm:w-auto bg-[#C85A32] hover:bg-[#b04b27] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md"
        >
          <span>Continue to Pricing Engine</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
