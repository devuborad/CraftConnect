import React, { useState, useEffect } from 'react';
import { Search, Sparkles, MapPin } from 'lucide-react';
import { ProductCard } from '../components/marketplace/ProductCard';
import { BulkInquiryModal } from '../components/marketplace/BulkInquiryModal';
import { productService } from '../services/products';
import type { Product } from '../types';

export const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  useEffect(() => {
    productService.getProducts().then((res) => setProducts(res));
  }, []);

  const categories = ['ALL', 'Textiles', 'Pottery', 'Woodcraft', 'Jewellery', 'Handicrafts', 'Art', 'Home Decor'];
  const locations = ['ALL', 'Gujarat', 'Rajasthan', 'Bihar', 'Karnataka'];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.artisanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.craftType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
    const matchesLocation = selectedLocation === 'ALL' || prod.origin.includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AUTHENTIC INDIAN CRAFT MARKETPLACE</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
          Discover Handmade India
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Directly connect with rural Indian artisans. Verified authentic handloom, pottery, woodcraft, and traditional folk art.
        </p>
      </div>

      {/* Search Bar & Location Filter */}
      <div className="glass-card bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search handwoven sarees, blue pottery, Madhubani art..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
          />
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <MapPin className="w-4 h-4 text-[#C85A32]" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-800 focus:outline-none"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === 'ALL' ? 'All States / Regions' : loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#4A2E1B] text-white shadow'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBulkInquiry={(prod) => setInquiryProduct(prod)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200">
          <div className="text-4xl">🔍</div>
          <h3 className="font-bold text-stone-900 text-lg">No matching craft products found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different category or state filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedLocation('ALL');
            }}
            className="bg-[#C85A32] text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bulk Inquiry Modal */}
      {inquiryProduct && (
        <BulkInquiryModal
          product={inquiryProduct}
          onClose={() => setInquiryProduct(null)}
        />
      )}
    </div>
  );
};
