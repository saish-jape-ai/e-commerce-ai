import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Clock } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';

const trendingSearches = ['Summer Dresses', 'White Sneakers', 'Slim Fit Shirts', 'Kurtas', 'Denim Jacket', 'Running Shoes'];
const recentSearches = ['Blue jeans', 'Nike shoes', 'Floral dress'];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    );
  }, [query]);

  const handleSearch = (val: string) => {
    setInputValue(val);
    setSearchParams(val ? { q: val } : {});
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search for products, brands, categories..."
            autoFocus
            className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-base font-body bg-background outline-none focus:border-primary transition-colors"
          />
          {inputValue && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground font-body">
              <Sparkles size={14} className="text-fashion-gold" /> AI suggestions
            </div>
          )}
        </div>
      </div>

      {!query ? (
        <div className="max-w-2xl mx-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 font-body flex items-center gap-2">
                <Clock size={16} /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-4 py-2 bg-muted rounded-full text-sm text-foreground font-body hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 font-body flex items-center gap-2">
              <TrendingUp size={16} /> Trending Now
            </h3>
            <div className="space-y-2">
              {trendingSearches.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSearch(s)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-bold text-muted-foreground font-body w-6">{i + 1}</span>
                  <span className="text-sm text-foreground font-body">{s}</span>
                  {i < 3 && <span className="ml-auto text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded font-body">HOT</span>}
                </motion.button>
              ))}
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="bg-fashion-blush rounded-2xl p-6 text-center">
            <Sparkles size={24} className="text-fashion-gold mx-auto mb-2" />
            <h3 className="text-lg font-display font-bold text-foreground mb-1">AI-Powered Search</h3>
            <p className="text-sm text-muted-foreground font-body">Try natural language: "red dress for wedding" or "casual sneakers under 3000"</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-foreground">
              {results.length > 0 ? `Results for "${query}"` : `No results for "${query}"`}
            </h2>
            <p className="text-sm text-muted-foreground font-body mt-1">{results.length} products found</p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {results.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-body mb-4">We couldn't find anything matching your search.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {trendingSearches.slice(0, 4).map(s => (
                  <button key={s} onClick={() => handleSearch(s)} className="px-4 py-2 border border-border rounded-full text-sm text-foreground font-body hover:border-primary transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
