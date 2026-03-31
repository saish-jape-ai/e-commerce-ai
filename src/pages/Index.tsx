import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products, categories, brands } from '@/data/products';
import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';

const heroSlides = [
  { image: hero1, title: 'Summer Collection', subtitle: 'Up to 50% Off on Summer Essentials', cta: 'Shop Now', link: '/products' },
  { image: hero2, title: 'Premium Menswear', subtitle: 'Elevate Your Style with Premium Brands', cta: 'Explore', link: '/products?gender=men' },
  { image: hero3, title: 'End of Season Sale', subtitle: 'Biggest Discounts of the Year', cta: 'Shop Sale', link: '/products' },
];

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const trendingProducts = products.filter(p => p.isTrending);
  const newArrivals = products.filter(p => p.isNew || true).slice(0, 8);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img src={heroSlides[currentSlide].image} alt={heroSlides[currentSlide].title} className="w-full h-full object-cover" width={1920} height={800} />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-lg"
                >
                  <h1 className="text-4xl md:text-6xl font-display font-bold text-background mb-4">
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p className="text-lg md:text-xl text-background/80 mb-6 font-body">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <Link
                    to={heroSlides[currentSlide].link}
                    className="inline-flex items-center gap-2 fashion-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity font-body"
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm p-2 rounded-full hover:bg-background/40 transition-colors"
        >
          <ChevronLeft size={24} className="text-background" />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm p-2 rounded-full hover:bg-background/40 transition-colors"
        >
          <ChevronRight size={24} className="text-background" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-background' : 'w-1.5 bg-background/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground mt-2 font-body">Find your perfect style</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/products?category=${cat.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                  <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <p className="absolute bottom-3 left-0 right-0 text-center text-sm font-bold text-background uppercase tracking-wider font-body">
                    {cat.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="fashion-gradient py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary-foreground" size={28} />
            <div>
              <p className="text-primary-foreground font-display text-2xl font-bold">Flash Sale Live!</p>
              <p className="text-primary-foreground/80 text-sm font-body">Up to 70% off on top brands</p>
            </div>
          </div>
          <Link
            to="/products"
            className="bg-background text-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-background/90 transition-colors font-body"
          >
            Shop the Sale →
          </Link>
        </div>
      </section>

      {/* Trending Now */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Trending Now</h2>
            <p className="text-muted-foreground mt-1 font-body">What everyone's wearing</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline font-body">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Brands */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">Featured Brands</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-background rounded-lg p-4 flex items-center justify-center hover-lift cursor-pointer"
              >
                <span className="text-sm font-bold text-foreground font-body">{brand.logo}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">New Arrivals</h2>
            <p className="text-muted-foreground mt-1 font-body">Fresh drops just for you</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline font-body">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
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
            <h2 className="text-3xl md:text-4xl font-display font-bold text-background mb-4">
              Your Personal AI Stylist
            </h2>
            <p className="text-background/70 mb-6 font-body">
              Get personalized outfit recommendations, style tips, and curated looks powered by artificial intelligence.
            </p>
            <button className="fashion-gold-gradient text-foreground px-6 py-3 rounded-full font-semibold text-sm font-body hover:opacity-90 transition-opacity">
              Try AI Stylist →
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-l from-primary to-transparent" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
