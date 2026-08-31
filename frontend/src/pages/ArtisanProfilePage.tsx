import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../services/products';
import type { Artisan, Product } from '../types';
import { ProductCard } from '../components/marketplace/ProductCard';
import { MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const ArtisanProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      productService.getArtisanById(id).then((a) => {
        if (a) setArtisan(a);
      });
      productService.getProducts().then((prods) => {
        setProducts(prods.filter((p) => p.artisanId === id));
      });
    }
  }, [id]);

  if (!artisan) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-semibold">Loading artisan profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Profile Banner Card */}
      <div className="glass-card bg-white rounded-3xl p-8 border border-stone-200 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          
          <img
            src={artisan.avatar}
            alt={artisan.name}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-300 shadow-md shrink-0"
          />

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>VERIFIED MASTER ARTISAN</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{artisan.experienceYears} Years Craft Heritage</span>
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl text-stone-900">
              {artisan.name}
            </h1>

            <p className="text-xs text-stone-500 font-semibold flex items-center justify-center md:justify-start space-x-1">
              <MapPin className="w-4 h-4 text-[#C85A32]" />
              <span>{artisan.location}, {artisan.state}</span>
            </p>

            <p className="text-xs text-stone-700 italic font-serif max-w-2xl leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200">
              "{artisan.story}"
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-stone-600 font-semibold">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Craft Specialty</span>
                <span className="text-stone-900">{artisan.craftType}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Published Products</span>
                <span className="text-stone-900">{artisan.publishedCount} items</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Languages Spoken</span>
                <span className="text-stone-900">{artisan.languages.join(', ').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Products Collection */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-2xl text-stone-900">
          Handmade Products by {artisan.name}
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">No products published yet.</p>
        )}
      </div>
    </div>
  );
};
