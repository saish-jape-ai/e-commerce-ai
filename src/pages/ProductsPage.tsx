import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';

const sortOptions = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Discount', value: 'discount' },
  { label: 'Rating', value: 'rating' },
];

const genderFilters = ['All', 'Men', 'Women', 'Kids', 'Unisex'];
const categoryFilters = ['All', 'Topwear', 'Bottomwear', 'Footwear', 'Accessories', 'Ethnic'];

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedGender !== 'All') {
      result = result.filter(p => p.gender === selectedGender.toLowerCase());
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'discount': result.sort((a, b) => b.discount - a.discount); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [selectedGender, selectedCategory, priceRange, sortBy]);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">All Products</h1>
          <p className="text-sm text-muted-foreground font-body">{filtered.length} items found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-body"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm bg-background font-body outline-none"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters (desktop) */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-y-auto pr-2 overscroll-contain">
          <FilterPanel
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </aside>

        {/* Mobile Filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/50 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="w-80 h-full bg-background overflow-y-auto p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-bold">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
                </div>
                <FilterPanel
                  selectedGender={selectedGender}
                  setSelectedGender={setSelectedGender}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground font-body">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterPanelProps {
  selectedGender: string;
  setSelectedGender: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
}

const FilterPanel = ({ selectedGender, setSelectedGender, selectedCategory, setSelectedCategory, priceRange, setPriceRange }: FilterPanelProps) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 font-body">Gender</h4>
      <div className="space-y-2">
        {genderFilters.map(g => (
          <label key={g} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              checked={selectedGender === g}
              onChange={() => setSelectedGender(g)}
              className="accent-primary"
            />
            <span className="text-sm text-foreground font-body">{g}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="border-t border-border pt-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 font-body">Category</h4>
      <div className="space-y-2">
        {categoryFilters.map(c => (
          <label key={c} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === c}
              onChange={() => setSelectedCategory(c)}
              className="accent-primary"
            />
            <span className="text-sm text-foreground font-body">{c}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="border-t border-border pt-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 font-body">Price Range</h4>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={priceRange[0]}
          onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
          className="w-20 px-2 py-1 border border-border rounded text-sm font-body bg-background"
          placeholder="Min"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-20 px-2 py-1 border border-border rounded text-sm font-body bg-background"
          placeholder="Max"
        />
      </div>
    </div>
  </div>
);

export default ProductsPage;
