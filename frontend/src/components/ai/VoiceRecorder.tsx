import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Type, Check, ArrowRight, Volume2, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/ai';
import type { SpeechTranscriptResult } from '../../services/ai';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, lang: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete }) => {
  const { language: appLang } = useApp();
  const [selectedLang, setSelectedLang] = useState<'gu' | 'hi' | 'en'>(
    appLang === 'hi' ? 'hi' : appLang === 'en' ? 'en' : 'gu'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [transcriptResult, setTranscriptResult] = useState<SpeechTranscriptResult | null>(null);
  const [manualText, setManualText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setIsProcessing(false);
    setTranscriptResult(null);
    setErrorMessage(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const bLangCode = selectedLang === 'gu' ? 'gu-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
    const langLabel = selectedLang === 'gu' ? 'Gujarati' : selectedLang === 'hi' ? 'Hindi' : 'English';

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = bLangCode;

        recognition.onresult = (event: any) => {
          const speechText = event.results[0]?.[0]?.transcript || '';
          const confidence = event.results[0]?.[0]?.confidence || 0.96;
          setIsRecording(false);
          setIsProcessing(false);
          
          if (speechText.trim()) {
            setTranscriptResult({
              detectedLanguage: langLabel,
              transcriptText: speechText,
              confidenceScore: Math.round(confidence * 100) / 100,
            });
          } else {
            // Fallback if empty speech
            fallbackToAiService(selectedLang);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error / fallback triggered:', event.error);
          setIsRecording(false);
          setIsProcessing(true);
          fallbackToAiService(selectedLang);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition init error:', err);
      }
    }

    // Fallback if SpeechRecognition unsupported in browser
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);
      fallbackToAiService(selectedLang);
    }, 2000);
  };

  const fallbackToAiService = (lang: 'gu' | 'hi' | 'en') => {
    aiService.transcribeSpeech(lang).then((res) => {
      setTranscriptResult(res);
      setIsProcessing(false);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-100 text-[#C85A32] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-fit mb-1">
            <Mic className="w-3 h-3 text-[#C85A32]" />
            <span>MULTILINGUAL VOICE AI CATALOGUER</span>
          </span>
          <h3 className="font-display font-bold text-xl text-stone-900">
            Tell us about your product
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Speak naturally in Gujarati, Hindi, or English.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setMode('voice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              mode === 'voice' ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Mic</span>
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              mode === 'text' ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Story</span>
          </button>
        </div>
      </div>

      {/* Language Selector Selector Tabs */}
      <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
          <Globe className="w-4 h-4 text-[#C85A32]" />
          <span>Select Your Spoken Language:</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedLang('gu')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLang === 'gu'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            }`}
          >
            🇮🇳 ગુજરાતી (Gujarati)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('hi')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLang === 'hi'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            }`}
          >
            🇮🇳 हिन्दी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('en')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLang === 'en'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {mode === 'voice' ? (
        <div className="py-8 text-center space-y-6 bg-[#FAF7F2] rounded-2xl border border-stone-200 p-6">
          {!transcriptResult && !isRecording && !isProcessing && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={startVoiceRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-105 transition-transform active:scale-95 border-4 border-amber-200/60 group"
              >
                <Mic className="w-10 h-10 group-hover:animate-pulse" />
              </button>
              <div>
                <h4 className="font-bold text-stone-900 text-base">
                  Tap Mic to Speak in {selectedLang === 'gu' ? 'Gujarati (ગુજરાતી)' : selectedLang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Describe what you made, materials used, colors, and craft process.
                </p>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="space-y-4 py-4">
              <div className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <Volume2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <span className="bg-red-100 text-red-700 text-xs font-extrabold px-3 py-1 rounded-full animate-pulse">
                  ● RECORDING SPEECH IN {selectedLang === 'gu' ? 'GUJARATI (ગુજરાતી)' : selectedLang === 'hi' ? 'HINDI (हिन्दी)' : 'ENGLISH'}...
                </span>
                <p className="text-xs text-stone-600 mt-2 italic font-serif">
                  {selectedLang === 'gu'
                    ? '"તમારા હસ્તકલા પ્રોડક્ટ અને માટી/સામગ્રી વિશે બોલો..."'
                    : selectedLang === 'hi'
                    ? '"अपने उत्पाद और सामग्री के बारे में बोलें..."'
                    : '"Speak naturally about your craft product..."'}
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-3 py-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-700">
                CraftConnect Voice AI is analyzing audio transcript in {selectedLang === 'gu' ? 'Gujarati' : selectedLang === 'hi' ? 'Hindi' : 'English'}...
              </p>
            </div>
          )}

          {transcriptResult && (
            <div className="text-left space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Language Captured: {transcriptResult.detectedLanguage} ({(transcriptResult.confidenceScore * 100).toFixed(0)}% accuracy)</span>
                </span>

                <button
                  type="button"
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
                type="button"
                onClick={() => onTranscriptComplete(transcriptResult.transcriptText, transcriptResult.detectedLanguage)}
                className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ Generate AI Product Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Describe your craft product in {selectedLang === 'gu' ? 'Gujarati (ગુજરાતી)' : selectedLang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}:
            </label>
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={
                selectedLang === 'gu'
                  ? 'દા.ત. હાથથી બનાવેલું પરંપરાગત માટીનું માટલું...'
                  : selectedLang === 'hi'
                  ? 'उदा. हाथ से बना पारंपरिक मिट्टी का मटका...'
                  : 'e.g. Traditional handcrafted terracotta clay water pot matka...'
              }
              className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-stone-900"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              onTranscriptComplete(
                manualText || (selectedLang === 'gu' ? 'પરંપરાગત માટીનું માટલું' : selectedLang === 'hi' ? 'पारंपरिक मिट्टी का मटका' : 'Terracotta clay water pot'),
                selectedLang === 'gu' ? 'Gujarati' : selectedLang === 'hi' ? 'Hindi' : 'English'
              )
            }
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ Generate AI Product Catalogue</span>
          </button>
        </div>
      )}
    </div>
  );
};
