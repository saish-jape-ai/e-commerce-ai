import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const megaMenuData = {
  Men: {
    Topwear: ['T-Shirts', 'Shirts', 'Jackets', 'Sweatshirts'],
    Bottomwear: ['Jeans', 'Trousers', 'Joggers', 'Shorts'],
    Footwear: ['Sneakers', 'Formal Shoes', 'Sports Shoes', 'Sandals'],
    Accessories: ['Watches', 'Sunglasses', 'Bags', 'Belts'],
  },
  Women: {
    Topwear: ['Tops', 'Dresses', 'Kurtas', 'Jackets'],
    Bottomwear: ['Jeans', 'Palazzos', 'Skirts', 'Leggings'],
    Footwear: ['Heels', 'Flats', 'Sneakers', 'Boots'],
    Accessories: ['Handbags', 'Jewelry', 'Scarves', 'Sunglasses'],
  },
  Kids: {
    Boys: ['T-Shirts', 'Jeans', 'Shorts', 'Shoes'],
    Girls: ['Dresses', 'Tops', 'Skirts', 'Shoes'],
    Infants: ['Rompers', 'Sets', 'Bodysuits'],
  },
  Beauty: {
    Makeup: ['Lipstick', 'Foundation', 'Mascara', 'Eyeshadow'],
    Skincare: ['Moisturizer', 'Serum', 'Sunscreen', 'Cleanser'],
    Haircare: ['Shampoo', 'Conditioner', 'Hair Oil', 'Masks'],
  },
};

type MenuKey = keyof typeof megaMenuData;

const buildProductsLink = (input: { gender?: string; category?: string; sub?: string; q?: string }) => {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (input.gender) params.set('gender', input.gender.toLowerCase());
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/products') return;
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get('q') || '');
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
    setActiveMenu(null);
    navigate(params.toString() ? `/products?${params.toString()}` : '/products');
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
              {(Object.keys(megaMenuData) as MenuKey[]).map(key => (
                <div
                  key={key}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveMenu(key)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className={`px-4 py-2 text-sm font-semibold font-body tracking-wide uppercase transition-colors hover:text-primary ${activeMenu === key ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}>
                    {key}
                  </button>
                </div>
              ))}
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
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 bg-background border-t border-border shadow-lg z-50"
              onMouseEnter={() => setActiveMenu(activeMenu)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div className="container mx-auto py-8 px-8">
                <div className="grid grid-cols-4 gap-8">
                  {Object.entries(megaMenuData[activeMenu]).map(([subcat, items]) => (
                    <div key={subcat}>
                      <h3 className="text-sm font-bold text-primary uppercase mb-3 font-body">{subcat}</h3>
                      <ul className="space-y-2">
                        {items.map(item => (
                          <li key={item}>
                            <Link
                              to={buildProductsLink({
                                gender: ['Men', 'Women', 'Kids'].includes(activeMenu) ? activeMenu : undefined,
                                category: activeMenu === 'Beauty' ? 'Beauty' : subcat,
                                sub: item,
                              })}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                              onClick={() => setActiveMenu(null)}
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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
              {(Object.keys(megaMenuData) as MenuKey[]).map(key => (
                <div key={key} className="mb-4">
                  <p className="text-sm font-bold uppercase text-primary mb-2 font-body">{key}</p>
                  {Object.entries(megaMenuData[key]).map(([subcat, items]) => (
                    <div key={subcat} className="ml-2 mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{subcat}</p>
                      {items.map(item => (
                        <Link
                          key={item}
                          to={buildProductsLink({
                            gender: ['Men', 'Women', 'Kids'].includes(key) ? key : undefined,
                            category: key === 'Beauty' ? 'Beauty' : subcat,
                            sub: item,
                          })}
                          className="block py-1 text-sm text-foreground hover:text-primary font-body"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
