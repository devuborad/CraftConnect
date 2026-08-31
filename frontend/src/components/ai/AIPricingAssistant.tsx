import React, { useState } from 'react';
import { Calculator, Sparkles, ChevronDown, ChevronUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { aiService } from '../../services/ai';
import type { PricingResult } from '../../services/ai';

interface AIPricingAssistantProps {
  onPricingConfirmed: (price: number, result: PricingResult) => void;
}

export const AIPricingAssistant: React.FC<AIPricingAssistantProps> = ({ onPricingConfirmed }) => {
  const [rawMaterial, setRawMaterial] = useState(650);
  const [labor, setLabor] = useState(500);
  const [packaging, setPackaging] = useState(100);
  const [other, setOther] = useState(100);

  const [loading, setLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [showWhy, setShowWhy] = useState(true);

  const totalCost = rawMaterial + labor + packaging + other;

  const calculatePrice = async () => {
    setLoading(true);
    const res = await aiService.calculatePriceRecommendation({
      rawMaterial,
      labor,
      packaging,
      other
    });
    setPricingResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-fit mb-1">
            <Calculator className="w-3 h-3 text-[#C85A32]" />
            <span>AI PRICING ASSISTANT</span>
          </span>
          <h3 className="font-display font-bold text-xl text-stone-900">
            Find a fair price for your craft
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            CraftConnect AI ensures your hard work earns a fair living wage margin without underpricing.
          </p>
        </div>
      </div>

      {/* Production Costs Inputs */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide">
          1. Enter Production Costs (₹)
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Raw Material Cost</label>
            <input
              type="number"
              value={rawMaterial}
              onChange={(e) => setRawMaterial(Number(e.target.value))}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Labour & Time Cost</label>
            <input
              type="number"
              value={labor}
              onChange={(e) => setLabor(Number(e.target.value))}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Packaging Cost</label>
            <input
              type="number"
              value={packaging}
              onChange={(e) => setPackaging(Number(e.target.value))}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Other / Transport</label>
            <input
              type="number"
              value={other}
              onChange={(e) => setOther(Number(e.target.value))}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-600 font-semibold">Total Direct Cost of Production:</span>
          <span className="font-extrabold text-base text-[#4A2E1B]">₹{totalCost.toLocaleString('en-IN')}</span>
        </div>

        <button
          onClick={calculatePrice}
          disabled={loading}
          className="w-full bg-[#4A2E1B] hover:bg-[#382213] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{loading ? 'Calculating Fair Price...' : 'Get AI Price Recommendation'}</span>
        </button>
      </div>

      {/* AI Result Card */}
      {pricingResult && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-3xl border border-amber-500/30 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-900/10">
            <div>
              <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                RECOMMENDED SELLING PRICE
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-display font-extrabold text-3xl text-[#4A2E1B]">
                  ₹{pricingResult.recommendedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500 font-medium">/ unit</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-amber-200 text-xs">
              <span className="text-stone-500 text-[10px] block font-semibold">MARKET RANGE [DEMO DATA]</span>
              <span className="font-bold text-stone-900">
                ₹{pricingResult.marketRange.min.toLocaleString('en-IN')} – ₹{pricingResult.marketRange.max.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold w-fit">
              {pricingResult.confidence}% AI Confidence
            </div>
          </div>

          {/* Expandable Why This Price */}
          <div>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-xs font-bold text-[#4A2E1B] flex items-center justify-between w-full py-1"
            >
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                <span>Why this price?</span>
              </span>
              {showWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showWhy && (
              <ul className="mt-3 space-y-2 text-xs text-stone-700 bg-white/70 p-4 rounded-2xl border border-amber-200/60">
                {pricingResult.breakdown.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => onPricingConfirmed(pricingResult.recommendedPrice, pricingResult)}
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
          >
            <span>Confirm & Review Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
