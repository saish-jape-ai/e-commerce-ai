import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { evaluateCoupon } from '@/lib/coupons';
import { storageGetJson, storageSetJson } from '@/lib/storage';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const stored = storageGetJson<string | null>('stylora_coupon_v1');
    if (typeof stored === 'string' && stored) {
      setAppliedCoupon(stored);
      setCouponInput(stored);
    }
  }, []);

  useEffect(() => {
    storageSetJson('stylora_coupon_v1', appliedCoupon);
  }, [appliedCoupon]);

  const couponResult = useMemo(() => {
    if (!appliedCoupon) return null;
    const res = evaluateCoupon(totalPrice, appliedCoupon);
    return res.ok ? res : null;
  }, [appliedCoupon, totalPrice]);

  const discount = couponResult?.discountAmount || 0;
  const deliveryFee = couponResult?.freeShipping ? 0 : (totalPrice > 999 ? 0 : 99);
  const finalTotal = Math.max(0, totalPrice - discount + deliveryFee);

  const applyCoupon = () => {
    const res = evaluateCoupon(totalPrice, couponInput);
    if (res.ok === false) {
      toast.error(res.reason);
      return;
    }
    setAppliedCoupon(res.code);
    setCouponInput(res.code);
    toast.success(`Coupon "${res.code}" applied`);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your bag is empty</h1>
        <p className="text-muted-foreground mb-6 font-body">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-flex items-center gap-2 fashion-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm font-body">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Shopping Bag ({items.length})</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 p-4 border border-border rounded-xl bg-card"
            >
              <Link to={`/product/${item.product.id}`} className="shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-24 h-32 object-cover rounded-lg" loading="lazy" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-body">{item.product.brand}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2 font-body">{item.product.name}</p>
                <p className="text-xs text-muted-foreground mt-1 font-body">Size: {item.size} | Color: {item.color}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-foreground font-body">₹{item.product.price.toLocaleString()}</span>
                  {item.product.originalPrice > item.product.price && (
                    <span className="text-xs text-muted-foreground line-through font-body">₹{item.product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-semibold font-body">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="border border-border rounded-xl p-6 bg-card sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 font-body">Price Details</h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total MRP</span>
                <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coupon Discount</span>
                <span className={discount > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                  {discount > 0 ? `-₹${discount.toLocaleString()}` : '₹0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : 'text-foreground'}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                <span className="text-foreground">Total Amount</span>
                <span className="text-foreground">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground font-semibold font-body">
                <Tag size={16} className="text-primary" />
                Coupon
              </div>

              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. STYLE25)"
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm font-body outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-2 rounded-lg text-sm font-semibold font-body fashion-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-muted-foreground">
                    Applied: <span className="font-semibold text-foreground">{appliedCoupon}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponInput(''); toast.message('Coupon removed'); }}
                    className="text-primary font-semibold hover:opacity-80 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/checkout"
              className="block w-full mt-6 fashion-gradient text-primary-foreground py-3.5 rounded-lg font-semibold text-sm font-body hover:opacity-90 transition-opacity text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
