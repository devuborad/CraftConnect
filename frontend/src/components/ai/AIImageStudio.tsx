import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Sliders, RefreshCw, ArrowRight } from 'lucide-react';
import { aiService } from '../../services/ai';
import type { ImageStudioResult } from '../../services/ai';

interface AIImageStudioProps {
  originalImage: string;
  onConfirmImage: (enhancedUrl: string) => void;
}

export const AIImageStudio: React.FC<AIImageStudioProps> = ({ originalImage, onConfirmImage }) => {
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<ImageStudioResult | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [stepProgress, setStepProgress] = useState(1);

  React.useEffect(() => {
    let t1 = setTimeout(() => setStepProgress(2), 500);
    let t2 = setTimeout(() => setStepProgress(3), 1000);
    let t3 = setTimeout(() => {
      setStepProgress(4);
      aiService.enhanceImage(originalImage).then((res) => {
        setResult(res);
        setProcessing(false);
      });
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [originalImage]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-fit mb-1">
            <Sparkles className="w-3 h-3 text-[#C85A32]" />
            <span>AI IMAGE STUDIO</span>
          </span>
          <h3 className="font-display font-bold text-xl text-stone-900">
            Professional Product Photography Clean
          </h3>
        </div>
      </div>

      {processing ? (
        <div className="py-12 text-center space-y-5 bg-[#FAF7F2] rounded-2xl border border-stone-200">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto animate-spin" style={{ animationDuration: '3s' }}>
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-stone-800 text-base">
            AI is preparing your product photo...
          </h4>

          <div className="max-w-xs mx-auto text-left space-y-2 text-xs text-stone-600 font-medium">
            <div className={`flex items-center space-x-2 ${stepProgress >= 1 ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Background cleaned & clutter removed</span>
            </div>
            <div className={`flex items-center space-x-2 ${stepProgress >= 2 ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Shadows & natural lighting balanced</span>
            </div>
            <div className={`flex items-center space-x-2 ${stepProgress >= 3 ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Craft details centered & sharpened</span>
            </div>
            <div className={`flex items-center space-x-2 ${stepProgress >= 4 ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Marketplace 4:3 catalog formatting ready</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Comparison Slider */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-stone-300 select-none group">
            {/* Original Image (Left side) */}
            <img
              src={originalImage}
              alt="Original"
              className="absolute inset-0 w-full h-full object-cover filter contrast-90 brightness-95"
            />

            {/* Enhanced Overlay (Right side) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={originalImage}
                alt="Enhanced"
                className="w-full h-full object-cover filter brightness-105 contrast-105 saturate-110"
              />
              <span className="absolute top-3 left-3 bg-amber-900/80 backdrop-blur text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                ✨ AI ENHANCED STUDIO
              </span>
            </div>

            <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded shadow">
              📷 ORIGINAL PHOTO
            </span>

            {/* Interactive Slider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-stone-800 shadow-xl border border-stone-300 flex items-center justify-center text-xs font-bold">
                <Sliders className="w-4 h-4 text-[#C85A32]" />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />
          </div>

          <p className="text-center text-xs text-stone-500 font-medium">
            Drag the slider to compare original photo vs AI enhanced studio version
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setProcessing(true);
                setStepProgress(1);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => onConfirmImage(originalImage)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold"
              >
                Keep Original
              </button>

              <button
                onClick={() => onConfirmImage(result?.enhancedUrl || originalImage)}
                className="flex-1 sm:flex-none bg-[#C85A32] hover:bg-[#b04b27] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md"
              >
                <span>Use Enhanced Photo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
