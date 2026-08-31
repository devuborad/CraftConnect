import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OUR MISSION & PURPOSE</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl text-stone-900">
          Empowering Rural Indian Artisans
        </h1>
        <p className="text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          CraftConnect AI was built to eliminate digital complexity for traditional craftsmen, weavers, potters, and folk artists.
        </p>
      </div>

      <div className="glass-card bg-white p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
        <h2 className="font-display font-bold text-2xl text-stone-900">
          The Problem We Solve
        </h2>
        <p className="text-xs text-stone-700 leading-relaxed">
          Over 200 million rural artisans across India preserve century-old cultural heritage. However, existing e-commerce platforms require English fluency, professional cameras, and pricing expertise. CraftConnect AI replaces these hurdles with a friendly voice assistant that works in Gujarati and Hindi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm">Voice AI Cataloguer</h4>
            <p className="text-[11px] text-stone-500 mt-1">Artisans speak naturally in Gujarati or Hindi to build listings.</p>
          </div>
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm">AI Image Studio</h4>
            <p className="text-[11px] text-stone-500 mt-1">Transforms basic mobile photos into studio catalog standards.</p>
          </div>
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm">Fair Price Engine</h4>
            <p className="text-[11px] text-stone-500 mt-1">Guarantees 50-60% artisan living wage margins on every sale.</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/marketplace"
          className="bg-[#C85A32] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md inline-flex items-center space-x-2"
        >
          <span>Explore Handmade Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
