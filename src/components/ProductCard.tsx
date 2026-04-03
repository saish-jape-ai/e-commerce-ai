import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRequireLogin } from '@/hooks/useRequireLogin';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const wishlisted = isInWishlist(product.id);
  const requireLogin = useRequireLogin();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
          
          {/* Quick add button */}
          <motion.div
            initial={false}
            className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3"
          >
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (requireLogin('Please login to add items to bag')) return;
                addToCart(product, product.sizes[0], product.colors[0]);
                toast.success('Added to bag!');
              }}
              className="w-full flex items-center justify-center gap-2 bg-background/95 backdrop-blur-sm text-foreground py-2.5 rounded-lg text-xs font-bold font-body shadow-lg hover:bg-background transition-colors"
            >
              <ShoppingBag size={14} /> QUICK ADD
            </button>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded font-body">
                {product.discount}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="bg-fashion-gold text-foreground text-[10px] font-bold px-2 py-0.5 rounded font-body">
                NEW
              </span>
            )}
            {product.isTrending && !product.isNew && (
              <span className="bg-fashion-navy text-background text-[10px] font-bold px-2 py-0.5 rounded font-body">
                TRENDING
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist button with animation */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => {
          e.preventDefault();
          if (requireLogin('Please login to use wishlist')) return;
          toggleWishlist(product.id, { platformProductId: product.platformProductId, platformVariantId: product.platformVariantId });
        }}
        className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors z-10"
      >
        <Heart size={16} className={`transition-colors ${wishlisted ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
      </motion.button>

      <div className="mt-3 px-1">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider font-body">{product.brand}</p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 font-body">{product.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-foreground font-body">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-xs text-muted-foreground line-through font-body">₹{product.originalPrice.toLocaleString()}</span>
              <span className="text-xs font-semibold text-primary font-body">({product.discount}% off)</span>
            </>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-green-600 text-background px-1.5 py-0.5 rounded font-body">
              {product.rating} <Star size={10} fill="currentColor" />
            </span>
            <span className="text-xs text-muted-foreground font-body">({product.reviews.toLocaleString()})</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
