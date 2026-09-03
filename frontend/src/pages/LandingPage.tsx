import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Mic, 
  Calculator, 
  ShoppingBag, 
  CheckCircle2,
  Languages,
  TrendingDown,
  Handshake
} from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';
import { MOCK_PRODUCTS, MOCK_ARTISANS } from '../services/mockData';
import { useApp } from '../context/AppContext';

const RURAL_CRAFTS = [
  {
    id: 'pottery',
    title: 'Handcrafted Terracotta & Pottery',
    titleHi: 'पारंपरिक हस्तनिर्मित मिट्टी के बर्तन एवं टेराकोटा',
    titleGu: 'પરંપરાગત માટીકામ અને ટેરાકોટા શિલ્પકળા',
    artisanRegion: 'Kutch & Saurashtra • Rural Gujarat',
    craftType: 'Clay Carving & Painting',
    image: '/crafts/rural-pottery-craft.jpg',
    description: 'Wheel-thrown natural clay pots, intricately carved and hand-painted by generational rural potters.',
    tag: 'Terracotta & Pottery',
    icon: '🏺',
  },
  {
    id: 'embroidery',
    title: 'Heritage Rural Needlework',
    titleHi: 'ग्रामीण पारंपरिक सुई-धागा कशीदाकारी',
    titleGu: 'ગ્રામીણ હસ્તકલા ભરતકામ અને કચ્છી સોયકામ',
    artisanRegion: 'Banni & Kutch Rural Communities',
    craftType: 'Authentic Hand Embroidery',
    image: '/crafts/rural-embroidery-craft.jpg',
    description: 'Meticulous threadwork stitched entirely by hand using traditional wooden hoops and organic threads.',
    tag: 'Rural Needlework',
    icon: '🪡',
  },
  {
    id: 'textile',
    title: 'Natural Dye Kalamkari & Block Print',
    titleHi: 'प्राकृतिक रंगों से बनी कलमकारी एवं ब्लॉक प्रिंट',
    titleGu: 'કુદરતી રંગોની કલમકારી અને પરંપરાગત વણાટકામ',
    artisanRegion: 'Heritage Artisanal Clusters • Rural India',
    craftType: 'Hand-Printed Sacred Motifs',
    image: '/crafts/rural-textile-craft.jpg',
    description: 'Hand-painted with bamboo pens and natural vegetable pigments, depicting peacocks, tigers, and sacred motifs.',
    tag: 'Kalamkari & Textile',
    icon: '🎨',
  },
];

export const LandingPage: React.FC = () => {
  const { role, currentUser, setRole, showToast, t, language } = useApp();
  const navigate = useNavigate();
  const [activeCraftIndex, setActiveCraftIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveCraftIndex((prev) => (prev + 1) % RURAL_CRAFTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeCraft = RURAL_CRAFTS[activeCraftIndex];

  const handleStartSelling = () => {
    if (!currentUser || role === 'GUEST') {
      showToast('Sign In Required 🔐', 'Please sign in or create an artisan account to start selling your products.', 'info');
      navigate('/login', { state: { role: 'ARTISAN', redirect: '/artisan/dashboard' } });
      return;
    }
    setRole('ARTISAN');
    navigate('/artisan/dashboard');
  };

  return (
    <div className="-mt-20 sm:-mt-24 space-y-20 pb-20 relative overflow-hidden">
      
      {/* Absolute Full-Width Video Background Layer (Top 0 to Behind Navbar) */}
      <div className="absolute top-0 inset-x-0 w-full h-[650px] sm:h-[720px] lg:h-[820px] z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-75 sm:opacity-80 transition-opacity duration-700"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Full Screen Vignette Overlays for Maximum Video Visibility with High Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/80 via-[#FAF7F2]/40 to-[#FAF7F2]/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF7F2]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-24 sm:pt-28 lg:pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Headline & CTA */}
          <div className="lg:col-span-7 space-y-6 ios-fade-up">
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
                className="bg-[#C85A32] hover:bg-[#b04b27] active:scale-[0.97] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 group"
              >
                <span>{t('hero.startSelling')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <Link
                to="/marketplace"
                className="glass-card bg-white/90 active:scale-[0.97] text-stone-800 hover:bg-white px-8 py-4 rounded-2xl font-bold text-base border border-stone-300 flex items-center justify-center space-x-2 shadow-sm transition-all"
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

            {/* Voice AI Active Live Preview Card on Left Column */}
            <div className="glass-card bg-white/95 p-3.5 rounded-2xl shadow-md border border-amber-900/10 max-w-lg space-y-1.5 flex items-start space-x-3 mt-4 hover:shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#C85A32] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Mic className="w-5 h-5 text-[#C85A32] animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#4A2E1B]">
                  <span>{t('hero.voiceActive')}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Live</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {language === 'gu' ? 'ટ્રાન્સક્રિપ્શન: "કચ્છની પરંપરાગત વણાટ કામગીરી" → અંગ્રેજી લિસ્ટિંગ તૈયાર ✨' : language === 'hi' ? 'ट्रांसक्रिप्शन: "कच्छ की पारंपरिक बुनाई" → इंग्लिश लिस्टिंग तैयार ✨' : 'Transcribed: "Traditional Kutch weave" → English Listing Generated ✨'}
                </p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card: Authentic Rural Crafts Showcase (No Pricing, 100% Handmade Heritage) */}
          <div className="lg:col-span-5 relative ios-fade-up ios-delay-2">
            <div className="relative mx-auto max-w-md">
              
              {/* Subtle Ambient Glass Glow Behind Frame */}
              <div className="absolute -top-8 -right-8 w-44 h-44 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-8 w-48 h-48 bg-[#C85A32]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Main Frame Card with Frosted Glassmorphism */}
              <div className="relative rounded-3xl p-5 sm:p-6 bg-white/55 backdrop-blur-2xl backdrop-saturate-200 border border-white/80 shadow-[0_20px_50px_rgba(74,46,27,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-4 hover:shadow-[0_28px_60px_rgba(74,46,27,0.18)] transition-all duration-300">
                
                {/* Top Header Pill */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/50 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C85A32]">
                      Authentic Rural Heritage
                    </span>
                  </div>
                  <span className="bg-white/75 backdrop-blur-md text-[#4A2E1B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white shadow-2xs">
                    ✋ 100% Handmade
                  </span>
                </div>

                {/* Featured Craft Image Display with Glass Reflection */}
                <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md border border-white/70 shadow-inner flex items-center justify-center p-2.5 group">
                  <img
                    key={activeCraft.id}
                    src={activeCraft.image}
                    alt={activeCraft.title}
                    className="max-h-full max-w-full object-contain rounded-xl transition-all duration-700 group-hover:scale-105 animate-in fade-in zoom-in-95"
                  />
                  
                  {/* Floating Glass Tag */}
                  <div className="absolute top-3 left-3 bg-stone-950/75 backdrop-blur-md text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-400/30 flex items-center space-x-1.5 shadow-sm">
                    <span>{activeCraft.icon}</span>
                    <span>{activeCraft.tag}</span>
                  </div>

                  {/* Craft Type Glass Badge */}
                  <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md text-stone-900 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/80 shadow-xs">
                    {activeCraft.craftType}
                  </div>
                </div>

                {/* 3 Craft Thumbnail Selector Tabs (Glassy Pills) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {RURAL_CRAFTS.map((craft, idx) => (
                    <button
                      key={craft.id}
                      type="button"
                      onClick={() => setActiveCraftIndex(idx)}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center text-center group ${
                        activeCraftIndex === idx
                          ? 'border-[#C85A32] bg-white/95 shadow-md ring-2 ring-[#C85A32]/25 scale-[1.02]'
                          : 'border-white/70 bg-white/35 backdrop-blur-md hover:bg-white/70 hover:border-white'
                      }`}
                    >
                      <img
                        src={craft.image}
                        alt={craft.title}
                        className="w-full h-14 object-cover rounded-lg mb-1.5 border border-white/80"
                      />
                      <span className={`text-[10px] font-bold leading-tight line-clamp-1 ${
                        activeCraftIndex === idx ? 'text-[#C85A32]' : 'text-stone-700'
                      }`}>
                        {craft.tag}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Craft Title & Description (No Pricing!) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                    <span>📍 {activeCraft.artisanRegion}</span>
                    <span className="text-emerald-700 font-bold">Living Heritage</span>
                  </div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-stone-900 leading-snug">
                    {language === 'gu' ? activeCraft.titleGu : language === 'hi' ? activeCraft.titleHi : activeCraft.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {activeCraft.description}
                  </p>
                </div>

                {/* Heritage Value Badges with Glass Styling */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200/50">
                  <span className="text-[10px] font-bold text-stone-700 bg-white/65 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/80 shadow-2xs">
                    🌿 Natural Materials
                  </span>
                  <span className="text-[10px] font-bold text-stone-700 bg-white/65 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/80 shadow-2xs">
                    🏛️ Generational Lineage
                  </span>
                  <span className="text-[10px] font-bold text-[#C85A32] bg-amber-50/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-300/60 shadow-2xs">
                    ✨ Direct from Rural Masters
                  </span>
                </div>

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
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200/90 space-y-3 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 hover:border-amber-300/80 group">
              <div className="w-11 h-11 rounded-xl bg-amber-100/90 text-[#C85A32] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Languages className="w-5 h-5 text-[#C85A32]" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C85A32] transition-colors">{t('problems.item1.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item1.desc')}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200/90 space-y-3 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 hover:border-amber-300/80 group">
              <div className="w-11 h-11 rounded-xl bg-amber-100/90 text-[#C85A32] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-[#C85A32]" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C85A32] transition-colors">{t('problems.item2.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item2.desc')}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200/90 space-y-3 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 hover:border-amber-300/80 group">
              <div className="w-11 h-11 rounded-xl bg-amber-100/90 text-[#C85A32] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <TrendingDown className="w-5 h-5 text-[#C85A32]" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C85A32] transition-colors">{t('problems.item3.title')}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('problems.item3.desc')}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200/90 space-y-3 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 hover:border-amber-300/80 group">
              <div className="w-11 h-11 rounded-xl bg-amber-100/90 text-[#C85A32] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Handshake className="w-5 h-5 text-[#C85A32]" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#C85A32] transition-colors">{t('problems.item4.title')}</h4>
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
          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 absolute top-4 right-4 tracking-tighter group-hover:text-[#C85A32] transition-colors">01</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base mb-1.5">{t('steps.1.title')}</h4>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">{t('steps.1.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 absolute top-4 right-4 tracking-tighter group-hover:text-[#C85A32] transition-colors">02</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base mb-1.5">{t('steps.2.title')}</h4>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">{t('steps.2.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 absolute top-4 right-4 tracking-tighter group-hover:text-[#C85A32] transition-colors">03</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base mb-1.5">{t('steps.3.title')}</h4>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">{t('steps.3.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 absolute top-4 right-4 tracking-tighter group-hover:text-[#C85A32] transition-colors">04</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base mb-1.5">{t('steps.4.title')}</h4>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">{t('steps.4.desc')}</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-stone-200 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 absolute top-4 right-4 tracking-tighter group-hover:text-[#C85A32] transition-colors">05</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base mb-1.5">{t('steps.5.title')}</h4>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">{t('steps.5.desc')}</p>
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
