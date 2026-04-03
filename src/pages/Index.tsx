import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Truck, RotateCcw, Shield, Tag, Star, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { usePlatformCategories, usePlatformProducts } from '@/hooks/usePlatformCatalog';
import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';

const heroSlides = [
  { image: hero1, title: 'Summer Collection', subtitle: 'Up to 50% Off on Summer Essentials', cta: 'Shop Now', link: '/products' },
  { image: hero2, title: 'Premium Menswear', subtitle: 'Elevate Your Style with Premium Brands', cta: 'Explore', link: '/products?gender=men' },
  { image: hero3, title: 'End of Season Sale', subtitle: 'Biggest Discounts of the Year', cta: 'Shop Sale', link: '/products' },
];

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Shield, title: '100% Genuine', desc: 'Authentic products only' },
  { icon: Tag, title: 'Best Prices', desc: 'Guaranteed lowest prices' },
];

const testimonials = [
  { name: "Ananya S.", rating: 5, text: "Absolutely love the collection! The AI recommendations are spot on.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" },
  { name: "Rahul M.", rating: 5, text: "Best online shopping experience. Fast delivery and great quality.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" },
  { name: "Priya K.", rating: 4, text: "Love the ethnic wear collection. So many options at amazing prices!", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" },
];

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsQuery = usePlatformProducts({ k: '', limit: 80, offset: 0 });
  const categoriesQuery = usePlatformCategories();

  const products = useMemo(() => productsQuery.data?.ui ?? [], [productsQuery.data]);

  const trendingProducts = useMemo(() => products.filter(p => p.isTrending).slice(0, 10), [products]);
  const newArrivals = useMemo(() => products.filter(p => p.isNew).slice(0, 12), [products]);
  const bestSellers = useMemo(() => products.filter(p => p.tags.includes('bestseller')).slice(0, 8), [products]);
  const ethnicWear = useMemo(() => products.filter(p => p.category.toLowerCase() === 'ethnic').slice(0, 4), [products]);
  const beautyProducts = useMemo(() => products.filter(p => p.category.toLowerCase() === 'beauty').slice(0, 4), [products]);

  const categoryCards = useMemo(() => {
    const cats = categoriesQuery.data || [];
    const placeholder = (seed: string) =>
      `https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=300&fit=crop&auto=format&q=70&sig=${encodeURIComponent(seed)}`;
    return cats.map(c => {
      const count = products.filter(p => p.category === c.category_name).length;
      return {
        id: c.id,
        name: c.category_name,
        image: c.presigned_image_url || placeholder(c.id),
        count,
      };
    });
  }, [categoriesQuery.data, products]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0">
            <img src={heroSlides[currentSlide].image} alt={heroSlides[currentSlide].title} className="w-full h-full object-cover" width={1920} height={800} />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="max-w-lg">
                  <h1 className="text-4xl md:text-6xl font-display font-bold text-background mb-4">{heroSlides[currentSlide].title}</h1>
                  <p className="text-lg md:text-xl text-background/80 mb-6 font-body">{heroSlides[currentSlide].subtitle}</p>
                  <Link to={heroSlides[currentSlide].link} className="inline-flex items-center gap-2 fashion-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity font-body">
                    {heroSlides[currentSlide].cta} <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <button onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm p-2 rounded-full hover:bg-background/40 transition-colors">
          <ChevronLeft size={24} className="text-background" />
        </button>
        <button onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm p-2 rounded-full hover:bg-background/40 transition-colors">
          <ChevronRight size={24} className="text-background" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-background' : 'w-1.5 bg-background/50'}`} />
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 justify-center md:justify-start">
                <f.icon size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground font-body">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground font-body">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground mt-2 font-body">Find your perfect style</p>
        </div>
        <div className="overflow-x-scroll overflow-y-hidden pb-3">
          <div className="flex gap-5 min-w-max px-1">
            {categoryCards.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="shrink-0 w-24"
              >
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="group block text-center">
                  <div className="relative overflow-hidden rounded-full aspect-square w-20 h-20 mx-auto mb-2 border-2 border-transparent group-hover:border-primary transition-colors">
                    <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <p className="text-xs font-semibold text-foreground font-body line-clamp-1">{cat.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{cat.count} items</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="fashion-gradient py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary-foreground" size={28} />
            <div>
              <p className="text-primary-foreground font-display text-2xl font-bold">Flash Sale Live!</p>
              <p className="text-primary-foreground/80 text-sm font-body">Up to 70% off on top brands • Ends tonight</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/coupons" className="bg-background/20 text-primary-foreground px-5 py-2 rounded-full font-semibold text-sm font-body hover:bg-background/30 transition-colors border border-primary-foreground/30">
              View Coupons
            </Link>
            <Link to="/products" className="bg-background text-foreground px-6 py-2 rounded-full font-semibold text-sm hover:bg-background/90 transition-colors font-body">
              Shop the Sale →
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 fashion-gradient rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Trending Now</h2>
              <p className="text-muted-foreground text-sm font-body">What everyone's wearing</p>
            </div>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline font-body">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Brands removed (API doesn't expose brands reliably) */}

      {/* Best Sellers */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 fashion-gold-gradient rounded-lg flex items-center justify-center">
              <Star size={16} className="text-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Best Sellers</h2>
              <p className="text-muted-foreground text-sm font-body">Most loved by our customers</p>
            </div>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline font-body">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Ethnic & Beauty Side by Side */}
      {(ethnicWear.length > 0 || beautyProducts.length > 0) && (
        <section className="container mx-auto py-6 px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {ethnicWear.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-bold text-foreground">Ethnic Wear</h3>
                  <Link to="/products?category=Ethnic" className="text-xs font-semibold text-primary hover:underline font-body">View All →</Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ethnicWear.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </div>
            )}
            {beautyProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-bold text-foreground">Beauty & Skincare</h3>
                  <Link to="/products?category=Beauty" className="text-xs font-semibold text-primary hover:underline font-body">View All →</Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {beautyProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">New Arrivals</h2>
            <p className="text-muted-foreground text-sm font-body">Fresh drops just for you</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline font-body">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground text-center font-body mb-8">Join 10M+ happy shoppers</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className={j < t.rating ? 'text-fashion-gold fill-fashion-gold' : 'text-border'} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-body mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                  <span className="text-sm font-semibold text-foreground font-body">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Stylist CTA */}
      <section className="container mx-auto py-12 px-4">
        <div className="relative overflow-hidden rounded-2xl bg-fashion-navy p-8 md:p-12">
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-fashion-gold" size={24} />
              <span className="text-fashion-gold font-semibold text-sm uppercase tracking-wider font-body">AI Powered</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-background mb-4">Your Personal AI Stylist</h2>
            <p className="text-background/70 mb-6 font-body">Get personalized outfit recommendations, style tips, and curated looks powered by artificial intelligence.</p>
            <button className="fashion-gold-gradient text-foreground px-6 py-3 rounded-full font-semibold text-sm font-body hover:opacity-90 transition-opacity">Try AI Stylist →</button>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-l from-primary to-transparent" />
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="container mx-auto py-12 px-4">
        <div className="bg-fashion-blush rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Download the Stylora App</h2>
            <p className="text-muted-foreground font-body mb-4">Get exclusive app-only deals, faster checkout, and real-time order tracking.</p>
            <div className="flex gap-3">
              <button className="bg-foreground text-background px-5 py-2.5 rounded-lg font-semibold text-sm font-body flex items-center gap-2">
                <span className="text-lg">🍎</span> App Store
              </button>
              <button className="bg-foreground text-background px-5 py-2.5 rounded-lg font-semibold text-sm font-body flex items-center gap-2">
                <span className="text-lg">▶️</span> Google Play
              </button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">4.8 ★</p>
            <p className="text-xs text-muted-foreground font-body">50K+ ratings</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
