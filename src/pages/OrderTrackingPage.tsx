import { useState } from 'react';
import { Package, Truck, CheckCircle, MapPin, Clock, Search, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TrackingStep {
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

const mockTrackingData: Record<string, { orderId: string; product: string; image: string; estimatedDelivery: string; steps: TrackingStep[] }> = {
  'STY001': {
    orderId: 'STY001',
    product: 'Classic Slim Fit Oxford Shirt',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop',
    estimatedDelivery: 'Apr 5, 2026',
    steps: [
      { status: 'Order Placed', location: 'Online', date: 'Mar 28, 2026', time: '10:30 AM', completed: true },
      { status: 'Order Confirmed', location: 'Warehouse - Mumbai', date: 'Mar 28, 2026', time: '11:45 AM', completed: true },
      { status: 'Shipped', location: 'Dispatch Center - Mumbai', date: 'Mar 29, 2026', time: '09:00 AM', completed: true },
      { status: 'In Transit', location: 'Hub - Gurugram', date: 'Mar 31, 2026', time: '02:30 PM', completed: true, current: true },
      { status: 'Out for Delivery', location: 'Local Hub', date: '', time: '', completed: false },
      { status: 'Delivered', location: 'Your Address', date: '', time: '', completed: false },
    ],
  },
  'STY002': {
    orderId: 'STY002',
    product: 'Leather Casual Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
    estimatedDelivery: 'Apr 3, 2026',
    steps: [
      { status: 'Order Placed', location: 'Online', date: 'Mar 15, 2026', time: '03:20 PM', completed: true },
      { status: 'Order Confirmed', location: 'Warehouse - Delhi', date: 'Mar 15, 2026', time: '04:00 PM', completed: true },
      { status: 'Shipped', location: 'Dispatch Center - Delhi', date: 'Mar 16, 2026', time: '08:00 AM', completed: true },
      { status: 'In Transit', location: 'Hub - Gurugram', date: 'Mar 17, 2026', time: '10:00 AM', completed: true },
      { status: 'Out for Delivery', location: 'Sector 15, Gurugram', date: 'Mar 18, 2026', time: '09:30 AM', completed: true, current: true },
      { status: 'Delivered', location: 'Your Address', date: '', time: '', completed: false },
    ],
  },
};

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState<typeof mockTrackingData[string] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) { toast.error('Please enter an order ID'); return; }
    setIsSearching(true);
    setTimeout(() => {
      const data = mockTrackingData[orderId.toUpperCase()];
      if (data) {
        setTracking(data);
      } else {
        toast.error('Order not found. Try STY001 or STY002');
        setTracking(null);
      }
      setIsSearching(false);
    }, 1000);
  };

  const completedSteps = tracking?.steps.filter(s => s.completed).length || 0;
  const totalSteps = tracking?.steps.length || 1;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 fashion-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck size={28} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Track Your Order</h1>
        <p className="text-muted-foreground font-body">Enter your order ID to see real-time delivery updates</p>
      </motion.div>

      {/* Search */}
      <motion.form onSubmit={handleTrack} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-lg mx-auto mb-10">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. STY001)"
              className="w-full pl-11 pr-4 py-3.5 border-2 border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary transition-colors"
            />
          </div>
          <motion.button type="submit" disabled={isSearching} whileTap={{ scale: 0.98 }} className="fashion-gradient text-primary-foreground px-6 py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60">
            {isSearching ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
            ) : (
              <>Track <ArrowRight size={16} /></>
            )}
          </motion.button>
        </div>
      </motion.form>

      {/* Tracking Result */}
      <AnimatePresence mode="wait">
        {tracking && (
          <motion.div key={tracking.orderId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
            {/* Order Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <img src={tracking.image} alt={tracking.product} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground font-body">{tracking.product}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">Order ID: {tracking.orderId}</p>
                  <p className="text-xs text-muted-foreground font-body">Estimated Delivery: <span className="text-primary font-semibold">{tracking.estimatedDelivery}</span></p>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-bold bg-fashion-blush text-primary px-3 py-1.5 rounded-full font-body">
                    <Package size={12} /> In Transit
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-body mb-2">
                  <span>Order Placed</span>
                  <span>Delivered</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full fashion-gradient rounded-full" />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Tracking Details</h3>
              <div className="space-y-0">
                {tracking.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    {/* Timeline dot & line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        step.current ? 'fashion-gradient text-primary-foreground animate-pulse' :
                        step.completed ? 'bg-green-500 text-background' : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.completed ? <CheckCircle size={16} /> : <Clock size={14} />}
                      </div>
                      {i < tracking.steps.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-300' : 'bg-border'}`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`pb-6 ${!step.completed && !step.current ? 'opacity-40' : ''}`}>
                      <p className={`text-sm font-bold font-body ${step.current ? 'text-primary' : 'text-foreground'}`}>{step.status}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-body">{step.location}</span>
                      </div>
                      {step.date && (
                        <p className="text-xs text-muted-foreground font-body mt-0.5">{step.date} at {step.time}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="mt-6 bg-fashion-blush rounded-2xl p-5 flex items-center gap-4">
              <Phone size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground font-body">Need help with your order?</p>
                <p className="text-xs text-muted-foreground font-body">Call us at 1800-123-4567 or chat with support</p>
              </div>
              <button className="text-sm text-primary font-semibold font-body hover:underline whitespace-nowrap">Get Help</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder when no tracking */}
      {!tracking && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-10">
          <p className="text-sm text-muted-foreground font-body">Try tracking order <button onClick={() => { setOrderId('STY001'); }} className="text-primary font-semibold hover:underline">STY001</button> or <button onClick={() => { setOrderId('STY002'); }} className="text-primary font-semibold hover:underline">STY002</button></p>
        </motion.div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
