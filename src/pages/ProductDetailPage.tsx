import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { addRecentlyViewedId } from '@/lib/recentlyViewed';
import { useQueryClient } from '@tanstack/react-query';
import type { PlatformProductsResult } from '@/hooks/usePlatformCatalog';
import { usePlatformProducts } from '@/hooks/usePlatformCatalog';

const ProductDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const platformProducts = useMemo(() => {
    const entries = queryClient.getQueriesData({ queryKey: ['platform', 'products'] });
    const all: Product[] = [];
    for (const [, data] of entries) {
      const cast = data as PlatformProductsResult | undefined;
      if (cast?.ui?.length) all.push(...cast.ui);
    }
    return all;
  }, [queryClient]);

  const platformProduct = useMemo(
    () => platformProducts.find(p => p.id === id),
    [id, platformProducts]
  );

  const fallbackQuery = usePlatformProducts({ k: '', limit: 200, offset: 0 });
  const fallbackProduct = useMemo(
    () => (fallbackQuery.data?.ui ?? []).find(p => p.id === id),
    [fallbackQuery.data, id]
  );

  const product = platformProduct || fallbackProduct;
  const sourceProducts = platformProduct ? platformProducts : (fallbackQuery.data?.ui ?? []);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (product) addRecentlyViewedId(product.id);
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-display font-bold">Product Not Found</h1>
        <p className="text-sm text-muted-foreground font-body mt-2">This product may not be in the currently loaded page.</p>
        <Link to="/products" className="text-primary mt-4 inline-block font-body">← Back to Products</Link>
      </div>
    );
  }

  const relatedProducts = sourceProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor && product.colors.length > 0) { toast.error('Please select a color'); return; }
    addToCart(product, selectedSize, selectedColor || product.colors[0]);
    toast.success('Added to bag!');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-body">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-primary">Products</Link>
        <ChevronRight size={14} />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-xl bg-muted aspect-[3/4]"
        >
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded font-body">
              {product.discount}% OFF
            </span>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider font-body">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mt-1">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 bg-green-600 text-background text-sm font-bold px-2 py-0.5 rounded font-body">
              {product.rating} <Star size={12} fill="currentColor" />
            </span>
            <span className="text-sm text-muted-foreground font-body">{product.reviews.toLocaleString()} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-foreground font-body">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through font-body">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-lg font-semibold text-primary font-body">({product.discount}% off)</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-body">inclusive of all taxes</p>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold uppercase tracking-wider text-foreground mb-2 font-body">Color</p>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm font-body transition-colors ${
                      selectedColor === color ? 'border-primary bg-fashion-blush text-primary' : 'border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold uppercase tracking-wider text-foreground font-body">Select Size</p>
              <button className="text-sm text-primary font-semibold font-body">Size Guide</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border rounded-lg text-sm font-semibold font-body transition-colors ${
                    selectedSize === size ? 'border-primary bg-fashion-blush text-primary' : 'border-border text-foreground hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 fashion-gradient text-primary-foreground py-3.5 rounded-lg font-semibold text-sm font-body hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={18} /> Add to Bag
            </button>
            <button
              onClick={() => toggleWishlist(product.id, { platformProductId: product.platformProductId, platformVariantId: product.platformVariantId })}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm border font-body transition-colors ${
                wishlisted ? 'bg-fashion-blush border-primary text-primary' : 'border-border text-foreground hover:border-primary'
              }`}
            >
              <Heart size={18} className={wishlisted ? 'fill-primary' : ''} />
              Wishlist
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <Truck size={20} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground font-body">Free Delivery</p>
            </div>
            <div className="text-center">
              <RotateCcw size={20} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground font-body">Easy Returns</p>
            </div>
            <div className="text-center">
              <Shield size={20} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground font-body">Genuine Product</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2 font-body">Product Details</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-body">{product.description}</p>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
