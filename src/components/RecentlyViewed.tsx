import { Link } from "react-router-dom";
import type { Product } from "@/data/products";

const RecentlyViewed = ({ products }: { products: Product[] }) => {
  if (products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-body">
          Recently Viewed
        </h2>
        <Link to="/wishlist" className="text-sm font-semibold text-primary font-body hover:opacity-80 transition-opacity">
          View wishlist
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pr-1 -mr-1 overscroll-contain">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="min-w-[160px] max-w-[160px] rounded-xl border border-border bg-card hover-lift"
          >
            <div className="aspect-[3/4] rounded-t-xl overflow-hidden bg-muted">
              <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body line-clamp-1">
                {product.brand}
              </p>
              <p className="text-sm text-foreground font-body line-clamp-2 mt-1">{product.name}</p>
              <p className="text-sm font-bold text-foreground font-body mt-2">
                ₹{product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;

