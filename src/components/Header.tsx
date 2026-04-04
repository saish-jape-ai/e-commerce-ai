import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { usePlatformCategories, usePlatformSubcategories } from '@/hooks/usePlatformCatalog';
import type { PlatformCategory } from '@/lib/platform/types';

const buildProductsLink = (input: { category?: string; sub?: string; q?: string }) => {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (input.category) params.set('category', input.category);
  if (input.sub) params.set('sub', input.sub);
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
};

const Header = () => {
  const { totalItems, wishlist } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const categoriesQuery = usePlatformCategories();
  const categories = categoriesQuery.data ?? [];
  const topCategories = useMemo(() => categories.slice(0, 5), [categories]);
  const moreCategories = useMemo(() => categories.slice(5), [categories]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Pick<PlatformCategory, 'id' | 'category_name'> | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileActiveCategoryId, setMobileActiveCategoryId] = useState<string | null>(null);

  const subcategoriesQuery = usePlatformSubcategories(activeCategory?.id);
  const mobileSubcategoriesQuery = usePlatformSubcategories(mobileActiveCategoryId);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
      if (e.key === 'Escape') setMoreOpen(false);
      if (e.key === 'Escape') setActiveCategory(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/products') return;
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get('q') || '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMoreOpen(false);
    setActiveCategory(null);
  }, [location.pathname, location.search]);

  const onLogout = () => {
    logout();
    toast.success('Logged out');
    setUserMenuOpen(false);
    navigate('/', { replace: true });
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    setActiveCategory(null);
    setMoreOpen(false);
    navigate(params.toString() ? `/products?${params.toString()}` : '/products');
  };

  const toggleCategory = (category: Pick<PlatformCategory, 'id' | 'category_name'>) => {
    setMoreOpen(false);
    setActiveCategory((prev) => (prev?.id === category.id ? null : category));
  };

  return (
    <>
      {/* Top banner */}
      <div className="bg-fashion-coral text-primary-foreground text-center text-xs py-1.5 font-body font-medium tracking-wide">
        FREE SHIPPING on orders above ₹999 | Use code: <span className="font-bold">STYLE25</span>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 bg-background ${isScrolled ? 'shadow-md' : 'border-b border-border'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Mobile menu */}
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
              STYLORA
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 h-full">
              {topCategories.map((cat) => (
                <div key={cat.id} className="relative h-full flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleCategory({ id: cat.id, category_name: cat.category_name })}
                    className={`px-4 py-2 text-sm font-semibold font-body tracking-wide uppercase transition-colors hover:text-primary ${activeCategory?.id === cat.id ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}
                  >
                    {cat.category_name}
                  </button>
                </div>
              ))}

              {moreCategories.length > 0 && (
                <div className="relative h-full flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(v => !v);
                      setActiveCategory(null);
                    }}
                    className={`px-4 py-2 text-sm font-semibold font-body tracking-wide uppercase transition-colors hover:text-primary flex items-center gap-1 ${moreOpen ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}
                    aria-haspopup="menu"
                    aria-expanded={moreOpen}
                  >
                    More <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-64 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50"
                        onMouseLeave={() => setMoreOpen(false)}
                      >
                        <div className="max-h-[70vh] overflow-y-auto p-2">
                          {moreCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors"
                              onClick={() => {
                                setMoreOpen(false);
                                toggleCategory({ id: cat.id, category_name: cat.category_name });
                              }}
                            >
                              {cat.category_name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Link to="/products" className="px-4 py-2 text-sm font-semibold font-body tracking-wide uppercase text-fashion-coral hover:opacity-80 transition-opacity">
                Sale
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <form onSubmit={onSubmitSearch} className="hidden lg:flex items-center relative mr-2">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products, brands and more..."
                  className="w-[360px] xl:w-[460px] 2xl:w-[520px] pl-10 pr-10 py-2.5 border border-border rounded-full bg-background font-body outline-none focus:border-primary transition-colors"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => { setSearchValue(''); navigate('/products'); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
              <Link to="/wishlist" className="p-2 hover:bg-muted rounded-full transition-colors relative">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 hover:bg-muted rounded-full transition-colors relative">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <div className="relative hidden sm:flex">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Account menu"
                >
                  <User size={20} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-semibold text-foreground font-body line-clamp-1">
                          {isAuthenticated ? user?.name : 'Guest'}
                        </p>
                        <p className="text-xs text-muted-foreground font-body line-clamp-1">
                          {isAuthenticated ? user?.email : 'Sign in for orders & offers'}
                        </p>
                      </div>

                      {isAuthenticated ? (
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors"
                          >
                            My Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors"
                          >
                            Settings
                          </button>
                          <button
                            type="button"
                            onClick={onLogout}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      ) : (
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => { setUserMenuOpen(false); navigate('/login'); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors"
                          >
                            Login
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUserMenuOpen(false); navigate('/signup'); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-muted transition-colors"
                          >
                            Create account
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile inline search */}
          <div className="lg:hidden pb-3">
            <form onSubmit={onSubmitSearch} className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-2.5 border border-border rounded-full bg-background font-body outline-none focus:border-primary transition-colors"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => { setSearchValue(''); navigate('/products'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 bg-background border-t border-border shadow-lg z-50"
              onMouseEnter={() => setActiveCategory(activeCategory)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="container mx-auto py-8 px-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground font-body truncate">{activeCategory.category_name}</h3>
                    <p className="text-xs text-muted-foreground font-body">Browse subcategories</p>
                  </div>
                  <Link
                    to={buildProductsLink({ category: activeCategory.category_name })}
                    className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity font-body"
                    onClick={() => setActiveCategory(null)}
                  >
                    View all
                  </Link>
                </div>

                {subcategoriesQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground font-body">Loading...</div>
                ) : subcategoriesQuery.isError ? (
                  <div className="text-sm text-destructive font-body">Failed to load subcategories</div>
                ) : (subcategoriesQuery.data?.length ?? 0) === 0 ? (
                  <div className="text-sm text-muted-foreground font-body">No subcategories found</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-3">
                    {(subcategoriesQuery.data || []).map((sub) => (
                      <Link
                        key={sub.id}
                        to={buildProductsLink({ category: activeCategory.category_name, sub: sub.sub_category_name })}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                        onClick={() => setActiveCategory(null)}
                      >
                        {sub.sub_category_name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-background z-50 shadow-2xl overflow-y-auto lg:hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl font-bold">STYLORA</span>
                <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitSearch(e);
                  setMobileOpen(false);
                }}
                className="relative mb-6"
              >
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-full bg-background font-body outline-none focus:border-primary transition-colors"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              <div className="mb-6 border border-border rounded-xl p-3">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground font-body line-clamp-1">{user?.name}</p>
                      <p className="text-xs text-muted-foreground font-body line-clamp-1">{user?.email}</p>
                    </div>
                    <button onClick={() => { onLogout(); setMobileOpen(false); }} className="text-sm font-semibold text-destructive font-body">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); navigate('/login'); }}
                      className="flex-1 py-2 rounded-lg border border-border text-sm font-semibold font-body hover:bg-muted transition-colors"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); navigate('/signup'); }}
                      className="flex-1 py-2 rounded-lg fashion-gradient text-primary-foreground text-sm font-semibold font-body hover:opacity-90 transition-opacity"
                    >
                      Signup
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-2">
                <p className="text-sm font-bold uppercase text-primary mb-3 font-body">Categories</p>

                {categoriesQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground font-body">Loading...</p>
                ) : categoriesQuery.isError ? (
                  <p className="text-sm text-destructive font-body">Failed to load categories</p>
                ) : (
                  <>
                    {topCategories.map((cat) => (
                      <div key={cat.id} className="mb-2">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between py-2 text-sm font-semibold font-body"
                          onClick={() => setMobileActiveCategoryId((prev) => (prev === cat.id ? null : cat.id))}
                        >
                          <span className="truncate">{cat.category_name}</span>
                          <ChevronDown size={16} className={`transition-transform ${mobileActiveCategoryId === cat.id ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {mobileActiveCategoryId === cat.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden pl-3 pb-2"
                            >
                              {mobileSubcategoriesQuery.isLoading ? (
                                <p className="text-sm text-muted-foreground font-body py-1">Loading...</p>
                              ) : mobileSubcategoriesQuery.isError ? (
                                <p className="text-sm text-destructive font-body py-1">Failed to load</p>
                              ) : (mobileSubcategoriesQuery.data?.length ?? 0) === 0 ? (
                                <p className="text-sm text-muted-foreground font-body py-1">No subcategories</p>
                              ) : (
                                (mobileSubcategoriesQuery.data || []).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={buildProductsLink({ category: cat.category_name, sub: sub.sub_category_name })}
                                    className="block py-1 text-sm text-foreground hover:text-primary font-body"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {sub.sub_category_name}
                                  </Link>
                                ))
                              )}

                              <Link
                                to={buildProductsLink({ category: cat.category_name })}
                                className="block py-1 text-sm font-semibold text-primary font-body"
                                onClick={() => setMobileOpen(false)}
                              >
                                View all
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    {moreCategories.length > 0 && (
                      <div className="mt-2">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between py-2 text-sm font-semibold font-body"
                          onClick={() => setMobileMoreOpen(v => !v)}
                        >
                          <span>More</span>
                          <ChevronDown size={16} className={`transition-transform ${mobileMoreOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {mobileMoreOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden pl-2"
                            >
                              {moreCategories.map((cat) => (
                                <div key={cat.id} className="mb-2">
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between py-2 text-sm font-semibold font-body"
                                    onClick={() => setMobileActiveCategoryId((prev) => (prev === cat.id ? null : cat.id))}
                                  >
                                    <span className="truncate">{cat.category_name}</span>
                                    <ChevronDown size={16} className={`transition-transform ${mobileActiveCategoryId === cat.id ? 'rotate-180' : ''}`} />
                                  </button>

                                  <AnimatePresence>
                                    {mobileActiveCategoryId === cat.id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden pl-3 pb-2"
                                      >
                                        {mobileSubcategoriesQuery.isLoading ? (
                                          <p className="text-sm text-muted-foreground font-body py-1">Loading...</p>
                                        ) : mobileSubcategoriesQuery.isError ? (
                                          <p className="text-sm text-destructive font-body py-1">Failed to load</p>
                                        ) : (mobileSubcategoriesQuery.data?.length ?? 0) === 0 ? (
                                          <p className="text-sm text-muted-foreground font-body py-1">No subcategories</p>
                                        ) : (
                                          (mobileSubcategoriesQuery.data || []).map((sub) => (
                                            <Link
                                              key={sub.id}
                                              to={buildProductsLink({ category: cat.category_name, sub: sub.sub_category_name })}
                                              className="block py-1 text-sm text-foreground hover:text-primary font-body"
                                              onClick={() => setMobileOpen(false)}
                                            >
                                              {sub.sub_category_name}
                                            </Link>
                                          ))
                                        )}

                                        <Link
                                          to={buildProductsLink({ category: cat.category_name })}
                                          className="block py-1 text-sm font-semibold text-primary font-body"
                                          onClick={() => setMobileOpen(false)}
                                        >
                                          View all
                                        </Link>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
