import { useState } from 'react';
import { Tag, Copy, Check, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { coupons } from '@/data/products';

const allCoupons = [
  ...coupons.map(c => ({ ...c, expires: 'Apr 30, 2026', category: 'All' })),
  { code: "ETHNIC20", discount: 20, type: "percent" as const, minOrder: 1499, description: "20% off on ethnic wear", expires: "Apr 15, 2026", category: "Ethnic" },
  { code: "SHOES30", discount: 30, type: "percent" as const, minOrder: 1999, description: "30% off on footwear (Max ₹800)", maxDiscount: 800, expires: "Apr 20, 2026", category: "Footwear" },
  { code: "BEAUTY15", discount: 15, type: "percent" as const, minOrder: 499, description: "15% off on beauty products", expires: "Apr 25, 2026", category: "Beauty" },
  { code: "NEWUSER", discount: 200, type: "flat" as const, minOrder: 799, description: "₹200 off for new users", expires: "Dec 31, 2026", category: "All" },
];

const CouponsPage = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Ethnic', 'Footwear', 'Beauty'];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filtered = activeFilter === 'All' ? allCoupons : allCoupons.filter(c => c.category === activeFilter || c.category === 'All');

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 fashion-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Tag size={28} className="text-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Coupons & Offers</h1>
        <p className="text-muted-foreground font-body">Save big with our exclusive deals and promo codes</p>
      </motion.div>

      {/* Flash Sale Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto mb-8">
        <div className="fashion-gradient rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-primary-foreground" size={20} />
            <span className="text-primary-foreground font-bold text-lg font-body">Flash Sale — Extra 10% Off!</span>
          </div>
          <p className="text-primary-foreground/80 text-sm font-body mb-3">Use code FLASH50 on orders above ₹1999. Limited time only!</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-2 rounded-full text-sm font-semibold font-body hover:bg-background/90 transition-colors">
            Shop Now <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold font-body transition-colors ${
              activeFilter === f ? 'fashion-gradient text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {filtered.map((coupon, i) => (
          <motion.div
            key={coupon.code}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-fashion-blush text-primary px-2 py-0.5 rounded font-body">
                    {coupon.type === 'percent' ? `${coupon.discount}% OFF` : coupon.type === 'flat' ? `₹${coupon.discount} OFF` : 'FREE SHIPPING'}
                  </span>
                  {coupon.category !== 'All' && (
                    <span className="text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded font-body ml-2">
                      {coupon.category}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground font-body mb-1">{coupon.description}</p>
              <p className="text-xs text-muted-foreground font-body">Min. order: ₹{coupon.minOrder}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-body">Expires: {coupon.expires}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-border px-5 py-3 flex items-center justify-between bg-muted/30">
              <code className="text-sm font-bold text-primary font-body tracking-wider">{coupon.code}</code>
              <button
                onClick={() => handleCopy(coupon.code)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary font-body hover:underline"
              >
                {copiedCode === coupon.code ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CouponsPage;
