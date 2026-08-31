import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../services/mockData';
import { Globe, ArrowRight } from 'lucide-react';
import type { LanguageCode } from '../types';

export const LanguagePage: React.FC = () => {
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="space-y-3">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-[#C85A32] flex items-center justify-center mx-auto shadow-md">
          <Globe className="w-7 h-7" />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-stone-900">
          Choose Your Language <br />
          <span className="text-[#C85A32]">ભાષા પસંદ કરો / भाषा चुनें</span>
        </h1>
        <p className="text-sm text-stone-600">
          Designed for low-literacy users. CraftConnect AI will speak and catalogue in your selected native language.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between shadow-sm hover:shadow-md ${
              language === lang.code
                ? 'border-[#C85A32] bg-amber-50/80 shadow-md ring-2 ring-[#C85A32]/20'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">{lang.name}</span>
              <h3 className="font-display font-bold text-2xl text-stone-900">{lang.nativeName}</h3>
              <p className="text-xs text-stone-500">{lang.script}</p>
            </div>

            <div className="flex items-center space-x-2">
              {language === lang.code && (
                <span className="w-8 h-8 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold">
                  ✓
                </span>
              )}
              <ArrowRight className="w-5 h-5 text-stone-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
