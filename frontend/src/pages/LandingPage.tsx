import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Mic, 
  Calculator, 
  ShoppingBag, 
  CheckCircle2
} from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from '../services/mockData';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setRole, t, language } = useApp();
  const navigate = useNavigate();

  const handleStartSelling = () => {
    setRole('ARTISAN');
    navigate('/artisan/dashboard');
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Headline & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-100/80 border border-amber-300 text-[#4A2E1B] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-[1.15]">
              {t('hero.title1')} <br />
              <span className="text-[#C85A32]">{t('hero.title2')}</span> <br />
              {t('hero.title3')}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed">
              {t('hero.description')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={handleStartSelling}
                className="bg-[#C85A32] hover:bg-[#b04b27] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group"
              >
                <span>{t('hero.startSelling')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/marketplace"
                className="glass-card bg-white/90 text-stone-800 hover:bg-white px-8 py-4 rounded-2xl font-bold text-base border border-stone-300 flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <ShoppingBag className="w-5 h-5 text-[#4A2E1B]" />
                <span>{t('hero.explore')}</span>
              </Link>
            </div>

            {/* Micro Trust Points */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-xs font-medium text-stone-600">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('hero.feature1')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('hero.feature2')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('hero.feature3')}</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card Stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Main Card: Handwoven Saree */}
              <div className="glass-card bg-white/95 rounded-3xl p-5 shadow-2xl border border-stone-200 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                    alt="Handwoven Ikat Saree"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-amber-900/80 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{t('hero.aiStudioBadge')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C85A32]">{t('hero.cardCraft')}</span>
                    <span className="text-xs font-extrabold text-[#4A2E1B] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      ₹2,499
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-stone-900">
                    {language === 'gu' ? 'હાથથી વણેલી કચ્છી સિંગલ ઇકત કોટન સાડી' : language === 'hi' ? 'हथकरघा कच्छ सिंगल इकत सूती साड़ी' : 'Handwoven Kutch Single Ikat Cotton Saree'}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {language === 'gu' ? '"આ હાથથી વણેલી કોટનની સાડી છે..." (વોઇસથી અંગ્રેજી AI કેટલોગ)' : language === 'hi' ? '"यह हाथ से बुनी सूती साड़ी है..." (वॉयस से इंग्लिश AI कैटलॉग)' : '"This is a handwoven cotton saree..." (Speech to English AI Catalogue)'}
                  </p>
                </div>
              </div>

              {/* Floating AI Workflow Card */}
              <div className="glass-card bg-white/95 p-4 rounded-2xl shadow-xl border border-amber-900/10 absolute -bottom-6 -left-6 max-w-xs space-y-2 hidden sm:block animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="flex items-center space-x-2 text-xs font-bold text-[#4A2E1B]">
                  <Mic className="w-4 h-4 text-[#C85A32]" />
                  <span>{t('hero.voiceActive')}</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {language === 'gu' ? 'ટ્રાન્સક્રિપ્શન: "કચ્છની પરંપરાગત વણાટ કામગીરી" → અંગ્રેજી લિસ્ટિંગ તૈયાર ✨' : language === 'hi' ? 'ट्रांसक्रिप्शन: "कच्छ की पारंपरिक बुनाई" → इंग्लिश लिस्टिंग तैयार ✨' : 'Transcribed: "Traditional Kutch weave" → English Listing Generated ✨'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="bg-white py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('problems.badge')}
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">
              {t('problems.title')}
            </h2>
            <p className="text-sm text-stone-600">
              {t('problems.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
                🗣️
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{t('problems.item1.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item1.desc')}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
                📷
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{t('problems.item2.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item2.desc')}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
                💰
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{t('problems.item3.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item3.desc')}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center font-bold">
                🤝
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{t('problems.item4.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item4.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CRAFTCONNECT WORKS (5 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {t('steps.badge')}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">
            {t('steps.title')}
          </h2>
          <p className="text-sm text-stone-600">
            {t('steps.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative">
            <span className="text-4xl font-extrabold text-amber-900/10 absolute top-4 right-4">01</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base mb-1">{t('steps.1.title')}</h4>
            <p className="text-xs text-stone-500">{t('steps.1.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative">
            <span className="text-4xl font-extrabold text-amber-900/10 absolute top-4 right-4">02</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base mb-1">{t('steps.2.title')}</h4>
            <p className="text-xs text-stone-500">{t('steps.2.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative">
            <span className="text-4xl font-extrabold text-amber-900/10 absolute top-4 right-4">03</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base mb-1">{t('steps.3.title')}</h4>
            <p className="text-xs text-stone-500">{t('steps.3.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative">
            <span className="text-4xl font-extrabold text-amber-900/10 absolute top-4 right-4">04</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base mb-1">{t('steps.4.title')}</h4>
            <p className="text-xs text-stone-500">{t('steps.4.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative">
            <span className="text-4xl font-extrabold text-amber-900/10 absolute top-4 right-4">05</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base mb-1">{t('steps.5.title')}</h4>
            <p className="text-xs text-stone-500">{t('steps.5.desc')}</p>
          </div>
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('featured.badge')}
            </span>
            <h2 className="font-display font-bold text-3xl text-stone-900 mt-2">
              {t('featured.title')}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {t('featured.subtitle')}
            </p>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-bold text-[#C85A32] hover:underline flex items-center space-x-1"
          >
            <span>{t('featured.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ARTISAN STORIES */}
      <section className="bg-[#FAF7F2] py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full uppercase">
              {t('spotlight.badge')}
            </span>
            <h2 className="font-display font-bold text-3xl text-stone-900">
              {t('spotlight.title')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('spotlight.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_ARTISANS.slice(0, 3).map((artisan) => (
              <div key={artisan.id} className="glass-card bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={artisan.avatar}
                    alt={artisan.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                  />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{artisan.name}</h4>
                    <p className="text-xs text-stone-500">{artisan.craftType} • {artisan.location}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 italic font-serif leading-relaxed">
                  "{artisan.story}"
                </p>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Experience: <strong className="text-stone-900">{artisan.experienceYears} yrs</strong></span>
                  <span className="text-emerald-700 font-bold">Verified Master</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <div 
          className="bg-gradient-to-r from-[#4A2E1B] to-[#C85A32] text-white p-12 rounded-3xl shadow-2xl space-y-6"
          style={{ background: 'linear-gradient(to right, #4A2E1B, #C85A32)', color: '#ffffff' }}
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            {t('cta.title')}
          </h2>
          <p className="text-sm text-amber-100 max-w-xl mx-auto">
            {t('cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleStartSelling}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all"
            >
              {t('cta.artisanBtn')}
            </button>

            <Link
              to="/marketplace"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3.5 rounded-2xl font-bold text-sm border border-white/30"
            >
              {t('cta.buyerBtn')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
