import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative hover-lift"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded font-body">
              {product.discount}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-fashion-gold text-foreground text-[10px] font-bold px-2 py-0.5 rounded font-body">
              NEW
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 p-1.5 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors z-10"
      >
        <Heart size={16} className={wishlisted ? 'fill-primary text-primary' : 'text-muted-foreground'} />
      </button>
      <div className="mt-3 px-1">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider font-body">{product.brand}</p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 font-body">{product.name}</p>
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
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-semibold bg-green-600 text-background px-1.5 py-0.5 rounded font-body">
              {product.rating} ★
            </span>
            <span className="text-xs text-muted-foreground font-body">({product.reviews.toLocaleString()})</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
