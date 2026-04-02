import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products, subcategoryMap } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import RecentlyViewed from '@/components/RecentlyViewed';
import { getRecentlyViewedIds } from '@/lib/recentlyViewed';

const sortOptions = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Discount', value: 'discount' },
  { label: 'Rating', value: 'rating' },
];

const genderFilters = ['All', 'Men', 'Women', 'Kids', 'Unisex'];
const categoryFilters = ['All', 'Topwear', 'Bottomwear', 'Footwear', 'Accessories', 'Ethnic', 'Beauty'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchString = searchParams.toString();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [query, setQuery] = useState('');
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const skipNextUrlSyncRef = useRef(true);

  const areSearchParamsEqual = (a: URLSearchParams, b: URLSearchParams) => {
    const aEntries = Array.from(a.entries()).sort(([ak, av], [bk, bv]) =>
      ak === bk ? av.localeCompare(bv) : ak.localeCompare(bk)
    );
    const bEntries = Array.from(b.entries()).sort(([ak, av], [bk, bv]) =>
      ak === bk ? av.localeCompare(bv) : ak.localeCompare(bk)
    );
    if (aEntries.length !== bEntries.length) return false;
    for (let i = 0; i < aEntries.length; i++) {
      if (aEntries[i][0] !== bEntries[i][0] || aEntries[i][1] !== bEntries[i][1]) return false;
    }
    return true;
  };

  useEffect(() => {
    setRecentlyViewedIds(getRecentlyViewedIds());
  }, []);

  useEffect(() => {
    // We are applying state based on URL params; skip the URL-sync effect once so it
    // doesn't write stale default state back into the URL in the same effect flush.
    skipNextUrlSyncRef.current = true;

    const params = new URLSearchParams(searchString);

    const genderParam = (params.get('gender') || '').trim();
    const categoryParam = (params.get('category') || '').trim();
    const subcategoryParam = (params.get('sub') || '').trim();
    const qParam = (params.get('q') || '').trim();
    const sortParam = (params.get('sort') || '').trim();
    const hasMin = params.has('min');
    const hasMax = params.has('max');
    const minParam = hasMin ? Number(params.get('min')) : 0;
    const maxParam = hasMax ? Number(params.get('max')) : 10000;

    const slugToGender: Record<string, string> = { men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Unisex' };
    const slugToCategory: Record<string, string> = {
      topwear: 'Topwear',
      bottomwear: 'Bottomwear',
      footwear: 'Footwear',
      accessories: 'Accessories',
      ethnic: 'Ethnic',
      beauty: 'Beauty',
    };

    const normalizedGender =
      genderFilters.find(g => g.toLowerCase() === genderParam.toLowerCase()) ||
      (slugToGender[categoryParam.toLowerCase()] ?? 'All');

    const allSubcategories = Object.values(subcategoryMap).flat();
    const subToCategory = new Map<string, string>();
    Object.entries(subcategoryMap).forEach(([cat, subs]) => subs.forEach(s => subToCategory.set(s.toLowerCase(), cat)));

    const subFromCategoryParam = allSubcategories.find(s => s.toLowerCase() === categoryParam.toLowerCase()) || null;
    const subFromSubParam = allSubcategories.find(s => s.toLowerCase() === subcategoryParam.toLowerCase()) || null;
    const inferredCategory =
      (subFromCategoryParam && subToCategory.get(subFromCategoryParam.toLowerCase())) ||
      (subFromSubParam && subToCategory.get(subFromSubParam.toLowerCase())) ||
      null;

    const normalizedCategory =
      inferredCategory ||
      categoryFilters.find(c => c.toLowerCase() === categoryParam.toLowerCase()) ||
      (slugToCategory[categoryParam.toLowerCase()] ?? undefined) ||
      'All';

    const normalizedSubcategory = subFromSubParam || subFromCategoryParam || 'All';

    const normalizedSort = sortOptions.some(o => o.value === sortParam) ? sortParam : 'recommended';

    if (selectedGender !== normalizedGender) setSelectedGender(normalizedGender);
    if (selectedCategory !== normalizedCategory) setSelectedCategory(normalizedCategory);
    if (selectedSubcategory !== normalizedSubcategory) setSelectedSubcategory(normalizedSubcategory);
    if (query !== qParam) setQuery(qParam);
    if (sortBy !== normalizedSort) setSortBy(normalizedSort);

    const nextPriceRange: [number, number] = [
      Number.isFinite(minParam) ? minParam : 0,
      Number.isFinite(maxParam) ? maxParam : 10000,
    ];
    if (priceRange[0] !== nextPriceRange[0] || priceRange[1] !== nextPriceRange[1]) setPriceRange(nextPriceRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (sortBy !== 'recommended') next.set('sort', sortBy);
    if (selectedGender !== 'All') next.set('gender', selectedGender.toLowerCase());
    if (selectedCategory !== 'All') next.set('category', selectedCategory);
    if (selectedSubcategory !== 'All') next.set('sub', selectedSubcategory);
    if (priceRange[0] !== 0) next.set('min', String(priceRange[0]));
    if (priceRange[1] !== 10000) next.set('max', String(priceRange[1]));

    const current = new URLSearchParams(searchString);
    if (!areSearchParamsEqual(next, current)) setSearchParams(next, { replace: true });
  }, [query, sortBy, selectedGender, selectedCategory, selectedSubcategory, priceRange, searchString, setSearchParams]);

  const onClearAll = () => {
    setSortBy('recommended');
    setSelectedGender('All');
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setPriceRange([0, 10000]);
    setQuery('');
  };

  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    return subcategoryMap[selectedCategory] || [];
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedGender !== 'All') {
      result = result.filter(p => p.gender === selectedGender.toLowerCase());
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (selectedSubcategory !== 'All') {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'discount': result.sort((a, b) => b.discount - a.discount); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [query, selectedGender, selectedCategory, selectedSubcategory, priceRange, sortBy]);

  const recentlyViewedProducts = useMemo(() => {
    if (recentlyViewedIds.length === 0) return [];
    const map = new Map(products.map(p => [p.id, p]));
    return recentlyViewedIds.map(id => map.get(id)).filter(Boolean);
  }, [recentlyViewedIds]);

  return (
    <div className="container mx-auto py-6 px-4">
      {recentlyViewedProducts.length > 0 && (
        <RecentlyViewed products={recentlyViewedProducts} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">All Products</h1>
          <p className="text-sm text-muted-foreground font-body">{filtered.length} items found</p>
        </div>
        <div className="flex items-center gap-3 justify-between sm:justify-end">
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

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search in products..."
            className="w-full pl-10 pr-10 py-3 border border-border rounded-xl bg-background font-body outline-none focus:border-primary transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {(selectedGender !== 'All' || selectedCategory !== 'All' || selectedSubcategory !== 'All' || priceRange[0] !== 0 || priceRange[1] !== 10000 || sortBy !== 'recommended') && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity font-body"
            >
              Clear all
            </button>
          )}
          {selectedGender !== 'All' && (
            <span className="px-3 py-1 rounded-full bg-muted text-sm font-body">{selectedGender}</span>
          )}
          {selectedCategory !== 'All' && (
            <span className="px-3 py-1 rounded-full bg-muted text-sm font-body">{selectedCategory}</span>
          )}
          {selectedSubcategory !== 'All' && (
            <span className="px-3 py-1 rounded-full bg-muted text-sm font-body">{selectedSubcategory}</span>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== 10000) && (
            <span className="px-3 py-1 rounded-full bg-muted text-sm font-body">₹{priceRange[0]}–₹{priceRange[1]}</span>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters (desktop) */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-y-auto pr-2 overscroll-contain">
          <FilterPanel
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            selectedCategory={selectedCategory}
            setSelectedCategory={(v) => { setSelectedCategory(v); setSelectedSubcategory('All'); }}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            availableSubcategories={availableSubcategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onClearAll={onClearAll}
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
                className="w-[85vw] max-w-sm h-full bg-background overflow-y-auto p-6"
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
                  setSelectedCategory={(v) => { setSelectedCategory(v); setSelectedSubcategory('All'); }}
                  selectedSubcategory={selectedSubcategory}
                  setSelectedSubcategory={setSelectedSubcategory}
                  availableSubcategories={availableSubcategories}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  onClearAll={() => { onClearAll(); setFiltersOpen(false); }}
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
  selectedSubcategory: string;
  setSelectedSubcategory: (v: string) => void;
  availableSubcategories: string[];
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  onClearAll: () => void;
}

const FilterPanel = ({
  selectedGender,
  setSelectedGender,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  availableSubcategories,
  priceRange,
  setPriceRange,
  onClearAll,
}: FilterPanelProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-body">Filters</h3>
      <button onClick={onClearAll} className="text-sm font-semibold text-primary font-body">Reset</button>
    </div>
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

    {availableSubcategories.length > 0 && (
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 font-body">Subcategory</h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
          {['All', ...availableSubcategories].map(s => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="subcategory"
                checked={selectedSubcategory === s}
                onChange={() => setSelectedSubcategory(s)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground font-body">{s}</span>
            </label>
          ))}
        </div>
      </div>
    )}
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
