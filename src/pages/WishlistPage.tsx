import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-6 font-body">Save items you love to come back to them later.</p>
        <Link to="/products" className="inline-flex items-center gap-2 fashion-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm font-body">
          Explore Products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">My Wishlist ({wishlistProducts.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {wishlistProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative"
          >
            <Link to={`/product/${product.id}`} className="block">
              <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-muted">
                <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded font-body">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-3 right-3 p-1.5 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
            >
              <Heart size={16} className="fill-primary text-primary" />
            </button>
            <div className="mt-3 px-1">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider font-body">{product.brand}</p>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 font-body">{product.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-bold text-foreground font-body">₹{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-muted-foreground line-through font-body">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <button
                onClick={() => {
                  addToCart(product, product.sizes[0], product.colors[0]);
                  toast.success('Moved to bag!');
                }}
                className="w-full mt-3 flex items-center justify-center gap-1.5 border border-primary text-primary py-2 rounded-lg text-xs font-semibold font-body hover:bg-fashion-blush transition-colors"
              >
                <ShoppingBag size={14} /> Move to Bag
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
