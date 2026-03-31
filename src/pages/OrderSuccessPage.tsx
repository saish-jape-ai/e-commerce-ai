import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccessPage = () => {
  const orderId = `STY${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="text-center max-w-md"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 fashion-gradient rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <CheckCircle size={48} className="text-primary-foreground" />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground font-body mb-6">
            Your order has been placed successfully. We'll send you a confirmation email shortly.
          </p>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-body">Order ID</span>
              <span className="text-sm font-bold text-foreground font-body">{orderId}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-body">Estimated Delivery</span>
              <span className="text-sm font-bold text-foreground font-body">3-5 Business Days</span>
            </div>
            <div className="flex items-center gap-3 bg-fashion-blush rounded-xl p-3">
              <Package size={20} className="text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground font-body">Track Your Order</p>
                <p className="text-xs text-muted-foreground font-body">We'll notify you when your order ships</p>
              </div>
            </div>
          </div>

          {/* Confetti-like floating elements */}
          <div className="relative mb-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -40, x: (i % 2 === 0 ? 1 : -1) * (20 + i * 10) }}
                transition={{ delay: 0.6 + i * 0.1, duration: 1.5 }}
                className="absolute top-0 left-1/2"
              >
                <Sparkles size={14} className="text-fashion-gold" />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/products" className="flex-1 flex items-center justify-center gap-2 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity">
              Continue Shopping <ArrowRight size={16} />
            </Link>
            <Link to="/" className="flex-1 py-3.5 border border-border rounded-xl text-sm font-semibold text-foreground font-body hover:bg-muted transition-colors text-center">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
