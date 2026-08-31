import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Type, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/ai';
import type { SpeechTranscriptResult } from '../../services/ai';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, lang: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete }) => {
  const { language } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [transcriptResult, setTranscriptResult] = useState<SpeechTranscriptResult | null>(null);
  const [manualText, setManualText] = useState('');

  const startVoiceRecording = () => {
    setIsRecording(true);
    setTranscriptResult(null);

    // Simulate 3 seconds of voice recording with mic animation
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);

      aiService.transcribeSpeech(language).then((res) => {
        setTranscriptResult(res);
        setIsProcessing(false);
      });
    }, 3200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-fit mb-1">
            <Mic className="w-3 h-3 text-[#C85A32]" />
            <span>VOICE-FIRST AI CATALOGUER</span>
          </span>
          <h3 className="font-display font-bold text-xl text-stone-900">
            Tell us about your product
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            You can speak naturally in Gujarati (ગુજરાતી), Hindi (हिन्दी), or English.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('voice')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
              mode === 'voice' ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
              mode === 'text' ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type instead</span>
          </button>
        </div>
      </div>

      {mode === 'voice' ? (
        <div className="py-8 text-center space-y-6 bg-[#FAF7F2] rounded-2xl border border-stone-200 p-6">
          {!transcriptResult && !isRecording && !isProcessing && (
            <div className="space-y-4">
              <button
                onClick={startVoiceRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-105 transition-transform active:scale-95 border-4 border-amber-200/60 group"
              >
                <Mic className="w-10 h-10 group-hover:animate-pulse" />
              </button>
              <div>
                <h4 className="font-bold text-stone-900 text-base">Tap and Speak</h4>
                <p className="text-xs text-stone-500">
                  Describe what you made, materials used, colors, and craft tradition.
                </p>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="space-y-4 py-4">
              <div className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-2xl animate-pulse-ring">
                <MicOff className="w-10 h-10" />
              </div>
              <div>
                <span className="bg-red-100 text-red-700 text-xs font-extrabold px-3 py-1 rounded-full animate-pulse">
                  ● RECORDING SPEECH IN GUJARATI...
                </span>
                <p className="text-xs text-stone-600 mt-2 italic font-serif">
                  "આ હાથથી વણેલી કોટનની સાડી છે. આમાં કુદરતી ઇન્ડિગો ડાયનો ઉપયોગ કર્યો છે..."
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-3 py-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-700">
                CraftConnect Speech AI is analyzing audio...
              </p>
            </div>
          )}

          {transcriptResult && (
            <div className="text-left space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Language Detected: {transcriptResult.detectedLanguage} ({(transcriptResult.confidenceScore * 100).toFixed(0)}% confidence)</span>
                </span>

                <button
                  onClick={startVoiceRecording}
                  className="text-xs text-[#C85A32] hover:underline font-semibold flex items-center space-x-1"
                >
                  <Mic className="w-3 h-3" />
                  <span>Record Again</span>
                </button>
              </div>

              <div>
                <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-wide">Audio Speech Transcript:</p>
                <p className="text-sm font-medium text-stone-900 mt-1 bg-stone-50 p-3 rounded-xl border border-stone-200 italic font-serif">
                  "{transcriptResult.transcriptText}"
                </p>
              </div>

              <button
                onClick={() => onTranscriptComplete(transcriptResult.transcriptText, transcriptResult.detectedLanguage)}
                className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ Create AI Product Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Describe your craft product in your own words:
            </label>
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g. Handwoven cotton saree made with organic indigo dye by artisan Meena Ben in Kutch..."
              className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-stone-900"
            />
          </div>

          <button
            onClick={() => onTranscriptComplete(manualText || 'Handwoven cotton product', 'English')}
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ Create AI Product Catalogue</span>
          </button>
        </div>
      )}
    </div>
  );
};
