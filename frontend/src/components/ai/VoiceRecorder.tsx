import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Sparkles, Type, Check, ArrowRight, Volume2, Globe, Square, AlertCircle, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, lang: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete }) => {
  const { language: appLang } = useApp();
  const [selectedLang, setSelectedLang] = useState<'gu' | 'hi' | 'en'>(
    appLang === 'hi' ? 'hi' : appLang === 'en' ? 'en' : 'gu'
  );

  // Active recording language locked at session start
  const [recordedLang, setRecordedLang] = useState<'gu' | 'hi' | 'en' | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');

  // Transcripts
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session & Recognition Refs
  const recognitionRef = useRef<any>(null);
  const sessionIdRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');

  // Cleanup active recognition when component unmounts
  useEffect(() => {
    return () => {
      sessionIdRef.current = '';
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const getLangLocale = (lang: 'gu' | 'hi' | 'en'): string => {
    switch (lang) {
      case 'gu':
        return 'gu-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
        return 'en-IN';
      default:
        return 'gu-IN';
    }
  };

  const getLangLabel = (lang: 'gu' | 'hi' | 'en'): string => {
    switch (lang) {
      case 'gu':
        return 'Gujarati (ગુજરાતી)';
      case 'hi':
        return 'Hindi (हिन्दी)';
      case 'en':
        return 'English';
      default:
        return 'Gujarati';
    }
  };

  // Stop active voice recording cleanly
  const stopVoiceRecording = useCallback(() => {
    if (!isRecordingRef.current && !isRecording) return;

    setIsRecording(false);
    isRecordingRef.current = false;
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    }
  }, [isRecording]);

  // Start a fresh, isolated voice recording session
  const startVoiceRecording = () => {
    if (isRecordingRef.current) return;

    // 1. Generate unique session ID for complete isolation
    const currentSessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sessionIdRef.current = currentSessionId;

    // 2. Lock language for this session
    const currentLang = selectedLang;
    setRecordedLang(currentLang);

    // 3. Clear all old transcripts from previous sessions
    setFinalTranscript('');
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setErrorMessage(null);

    // 4. Safely abort any lingering recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    // 5. Check browser SpeechRecognition support
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or switch to the "Type Story" option.'
      );
      setIsRecording(false);
      isRecordingRef.current = false;
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      // Lock recognition settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = getLangLocale(currentLang);

      recognition.onstart = () => {
        if (sessionIdRef.current !== currentSessionId) return;
        setIsRecording(true);
        isRecordingRef.current = true;
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        // Drop any stale callbacks from prior sessions
        if (sessionIdRef.current !== currentSessionId) return;

        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            sessionFinal += (sessionFinal ? ' ' : '') + text.trim();
          } else {
            sessionInterim += (sessionInterim ? ' ' : '') + text.trim();
          }
        }

        finalTranscriptRef.current = sessionFinal;
        setFinalTranscript(sessionFinal);
        setInterimTranscript(sessionInterim);
      };

      recognition.onerror = (event: any) => {
        if (sessionIdRef.current !== currentSessionId) return;
        console.warn('SpeechRecognition error:', event.error);

        if (event.error === 'aborted') {
          // Normal stop/abort by user, do not show error
          return;
        }

        let userMsg = 'Voice recognition encountered an issue. Please try again.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          userMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          userMsg = 'No speech was detected. Please try speaking closer to your microphone.';
        } else if (event.error === 'audio-capture') {
          userMsg = 'Microphone could not be accessed. Please verify your audio input device.';
        } else if (event.error === 'network') {
          userMsg = 'Network connection issue with speech recognition service. Please check your internet.';
        } else if (event.error === 'service-not-allowed') {
          userMsg = 'Speech recognition service is restricted by your browser or device.';
        }

        setErrorMessage(userMsg);
        setIsRecording(false);
        isRecordingRef.current = false;
        setInterimTranscript('');
      };

      recognition.onend = () => {
        if (sessionIdRef.current !== currentSessionId) return;
        setIsRecording(false);
        isRecordingRef.current = false;
        setInterimTranscript('');
      };

      recognition.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err: any) {
      console.warn('SpeechRecognition start error:', err);
      setErrorMessage('Could not initialize microphone. Please check your device settings.');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  // Language tab change: strictly disabled during active recording
  const handleLanguageChange = (newLang: 'gu' | 'hi' | 'en') => {
    if (isRecording) return;
    setSelectedLang(newLang);
    // Clear old transcript when explicitly changing language so sessions never mix
    setFinalTranscript('');
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setErrorMessage(null);
    setRecordedLang(null);
  };

  // Submit voice transcript
  const handleProceedVoice = () => {
    const textToSubmit = finalTranscript.trim();
    if (!textToSubmit) {
      setErrorMessage('Please speak or record your product story before proceeding.');
      return;
    }
    const langToUse = recordedLang || selectedLang;
    onTranscriptComplete(textToSubmit, langToUse);
  };

  // Submit typed transcript
  const handleProceedText = () => {
    const textToSubmit = manualText.trim();
    if (!textToSubmit) {
      setErrorMessage('Please type your product story before proceeding.');
      return;
    }
    onTranscriptComplete(textToSubmit, selectedLang);
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
            type="button"
            disabled={isRecording}
            onClick={() => {
              if (!isRecording) {
                setMode('voice');
                setErrorMessage(null);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              mode === 'voice' ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600'
            } ${isRecording ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Mic</span>
          </button>
          <button
            type="button"
            disabled={isRecording}
            onClick={() => {
              if (!isRecording) {
                setMode('text');
                setErrorMessage(null);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              mode === 'text' ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600'
            } ${isRecording ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Story</span>
          </button>
        </div>
      </div>

      {/* Language Selector Selector Tabs (Disabled during active recording) */}
      <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
          <Globe className="w-4 h-4 text-[#C85A32]" />
          <span>
            {isRecording ? 'Active Recording Language (Locked):' : 'Select Your Spoken Language:'}
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={isRecording}
            onClick={() => handleLanguageChange('gu')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLang === 'gu'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            } ${isRecording ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            title={isRecording ? 'Language locked during recording' : 'Select Gujarati'}
          >
            🇮🇳 ગુજરાતી (Gujarati)
          </button>
          <button
            type="button"
            disabled={isRecording}
            onClick={() => handleLanguageChange('hi')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLang === 'hi'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            } ${isRecording ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            title={isRecording ? 'Language locked during recording' : 'Select Hindi'}
          >
            🇮🇳 हिन्दी (Hindi)
          </button>
          <button
            type="button"
            disabled={isRecording}
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLang === 'en'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            } ${isRecording ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            title={isRecording ? 'Language locked during recording' : 'Select English'}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-red-700 text-xs ios-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">Voice Recognition Notice</p>
            <p className="text-red-600">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {mode === 'voice' ? (
        <div className="py-8 text-center space-y-6 bg-[#FAF7F2] rounded-2xl border border-stone-200 p-6">
          
          {/* STATE 1: IDLE (Not Recording, No Final Transcript yet) */}
          {!isRecording && !finalTranscript && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={startVoiceRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4A2E1B] to-[#C85A32] text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-105 transition-transform active:scale-95 border-4 border-amber-200/60 group cursor-pointer"
              >
                <Mic className="w-10 h-10 group-hover:animate-pulse" />
              </button>
              <div>
                <h4 className="font-bold text-stone-900 text-base">
                  Tap Mic to Speak in {getLangLabel(selectedLang)}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Describe what you made, materials used, colors, and craft process.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: ACTIVE RECORDING */}
          {isRecording && (
            <div className="space-y-5 py-2">
              <div className="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-2xl animate-pulse ring-8 ring-red-100">
                <Volume2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="bg-red-100 text-red-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full inline-flex items-center space-x-1.5 animate-pulse shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                  <span>LISTENING IN {getLangLabel(recordedLang || selectedLang).toUpperCase()}...</span>
                </span>
                <p className="text-xs text-stone-500 mt-2 font-medium">
                  Speak clearly into your device. Click &quot;Stop Recording&quot; when finished.
                </p>
              </div>

              {/* Live speech preview box */}
              <div className="text-left bg-white p-4 rounded-2xl border border-amber-200 shadow-sm min-h-[90px] flex flex-col justify-center">
                {finalTranscript || interimTranscript ? (
                  <p className="text-sm text-stone-900 leading-relaxed font-medium">
                    <span>{finalTranscript}</span>
                    {interimTranscript && (
                      <span className="text-stone-400 italic ml-1.5">{interimTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 italic text-center font-serif">
                    {selectedLang === 'gu'
                      ? '"તમારા હસ્તકલા પ્રોડક્ટ અને માટી/સામગ્રી વિશે બોલો..."'
                      : selectedLang === 'hi'
                      ? '"अपने उत्पाद और सामग्री के बारे में बोलें..."'
                      : '"Speak naturally about your craft product..."'}
                  </p>
                )}
              </div>

              {/* Prominent Stop Button */}
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 mx-auto shadow-lg transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording</span>
              </button>
            </div>
          )}

          {/* STATE 3: RECORDING COMPLETED (Transcript ready) */}
          {!isRecording && finalTranscript && (
            <div className="text-left space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm ios-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recording Complete · Captured in {getLangLabel(recordedLang || selectedLang)}</span>
                </span>

                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="text-xs text-[#C85A32] hover:text-[#b04b27] font-bold flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Record Again in {getLangLabel(selectedLang)}</span>
                </button>
              </div>

              <div>
                <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                  Audio Speech Transcript ({getLangLabel(recordedLang || selectedLang)}):
                </p>
                <p className="text-sm font-medium text-stone-900 mt-1.5 bg-stone-50 p-4 rounded-xl border border-stone-200 italic font-serif leading-relaxed">
                  &quot;{finalTranscript}&quot;
                </p>
              </div>

              <button
                type="button"
                onClick={handleProceedVoice}
                className="w-full bg-[#C85A32] hover:bg-[#b04b27] active:scale-98 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ Generate AI Product Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* MODE: TYPE STORY */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Describe your craft product in {getLangLabel(selectedLang)}:
            </label>
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => {
                setManualText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={
                selectedLang === 'gu'
                  ? 'દા.ત. આ હાથથી બનાવેલો માટીનો કળશ છે. આ અમારા ગામમાં બનાવવામાં આવે છે...'
                  : selectedLang === 'hi'
                  ? 'उदा. यह हाथ से बनाया गया मिट्टी का कलश है। इसे हमारे गांव में बनाया जाता है...'
                  : 'e.g. This is a handmade clay kalash pot made in our village using traditional wheel pottery...'
              }
              className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-stone-900"
            />
          </div>

          <button
            type="button"
            onClick={handleProceedText}
            className="w-full bg-[#C85A32] hover:bg-[#b04b27] active:scale-98 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ Generate AI Product Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
