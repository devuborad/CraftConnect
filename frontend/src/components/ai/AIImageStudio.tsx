import React, { useState, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  React.useEffect(() => {
    if (!originalImage) return;
    setProcessing(true);
    setStepProgress(1);

    let isMounted = true;
    let t1 = setTimeout(() => { if (isMounted) setStepProgress(2); }, 200);
    let t2 = setTimeout(() => { if (isMounted) setStepProgress(3); }, 400);

    aiService.enhanceImage(originalImage).then((res) => {
      if (isMounted) {
        setStepProgress(4);
        setResult(res);
        setProcessing(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [originalImage]);

  const updateSliderFromEvent = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateSliderFromEvent(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current || e.buttons === 1) {
      updateSliderFromEvent(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-fit mb-1">
            <Sparkles className="w-3 h-3 text-[#C85A32]" />
            <span>AI IMAGE STUDIO</span>
          </span>
          <h3 className="font-display font-bold text-xl text-stone-900">
            Professional Product Photography Enhancement
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
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative aspect-[4/3] min-h-[340px] sm:min-h-[420px] w-full rounded-2xl overflow-hidden shadow-lg border border-stone-300 select-none group bg-stone-100 cursor-ew-resize touch-none"
          >
            {/* Original Image (Background / Right Side) */}
            <img
              src={originalImage}
              alt="Original"
              className="absolute inset-0 w-full h-full object-cover filter contrast-90 brightness-95"
            />

            {/* Enhanced Image Overlay (Clipped on Left Side using clipPath) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              <img
                src={result?.enhancedUrl || originalImage}
                alt="Enhanced"
                className="w-full h-full object-cover filter brightness-105 contrast-105 saturate-110"
              />
              <span className="absolute top-3 left-3 bg-amber-900/90 backdrop-blur text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md shadow flex items-center space-x-1 z-10">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>✨ AI ENHANCED STUDIO</span>
              </span>
            </div>

            <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur text-stone-200 text-[10px] font-bold px-2.5 py-1 rounded-md shadow z-10">
              📷 ORIGINAL PHOTO
            </span>

            {/* Interactive Vertical Slider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-stone-800 shadow-2xl border-2 border-[#C85A32] flex items-center justify-center text-xs font-bold pointer-events-none">
                <Sliders className="w-4 h-4 text-[#C85A32]" />
              </div>
            </div>

            {/* Range Input Overlay for accessibility & drag */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onInput={(e: any) => setSliderPos(Number(e.target.value))}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-none pointer-events-auto"
            />
          </div>

          <p className="text-center text-xs text-stone-500 font-medium flex items-center justify-center space-x-1">
            <Sliders className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Drag the slider left or right to compare original photo vs AI enhanced studio version</span>
          </p>

          {/* Action Buttons */}
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
