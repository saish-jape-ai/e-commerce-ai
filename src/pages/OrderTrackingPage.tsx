import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Truck, CheckCircle, MapPin, Clock, Search, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { platformApi } from '@/lib/platform/client';
import { PlatformApiError } from '@/lib/platform/http';
import type { PlatformOrderTimelineEntry } from '@/lib/platform/types';

interface TrackingStep {
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

const formatStatus = (value: string) => {
  const s = String(value || '').trim();
  if (!s) return '—';
  return s
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const timelineToSteps = (entries: PlatformOrderTimelineEntry[]): TrackingStep[] => {
  const sorted = [...entries].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  return sorted.map((e, idx) => {
    const d = new Date(e.timestamp);
    const date = Number.isFinite(d.getTime()) ? d.toLocaleDateString() : '';
    const time = Number.isFinite(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return {
      status: formatStatus(e.status),
      location: e.notes || '—',
      date,
      time,
      completed: true,
      current: idx === sorted.length - 1,
    };
  });
};

const estimateProgress = (statusRaw: string) => {
  const s = String(statusRaw || '').trim().toLowerCase();
  if (!s) return 0;
  if (s.includes('cancel')) return 100;
  if (s.includes('deliver')) return 100;
  const order = ['pending', 'confirmed', 'packed', 'shipped', 'in transit', 'out for delivery', 'delivered'];
  const idx = order.findIndex((k) => s.includes(k));
  if (idx < 0) return 50;
  return Math.round((idx / (order.length - 1)) * 100);
};

const OrderTrackingPage = () => {
  const { accessToken, isReady } = useAuth();
  const [searchParams] = useSearchParams();
  const urlOrderId = (searchParams.get('order_id') || '').trim();

  const [orderId, setOrderId] = useState(urlOrderId);
  const [submittedOrderId, setSubmittedOrderId] = useState(urlOrderId);

  useEffect(() => {
    if (!urlOrderId) return;
    setOrderId(urlOrderId);
    setSubmittedOrderId(urlOrderId);
  }, [urlOrderId]);

  const timelineQuery = useQuery({
    queryKey: ['platform', 'order-timeline', { orderId: submittedOrderId }],
    enabled: Boolean(accessToken && submittedOrderId),
    queryFn: ({ signal }) => platformApi.orderTimeline({ accessToken: accessToken!, orderId: submittedOrderId, signal }).then(r => r.data),
    staleTime: 0,
  });

  const steps = useMemo(() => (Array.isArray(timelineQuery.data) ? timelineToSteps(timelineQuery.data) : []), [timelineQuery.data]);
  const currentStatus = steps.find(s => s.current)?.status || '';
  const progress = estimateProgress(currentStatus);

  const errorMessage = useMemo(() => {
    const err = timelineQuery.error;
    if (!err) return null;
    if (err instanceof PlatformApiError) {
      if (err.status === 401) return 'Session expired. Please login again.';
      if (err.status === 404) return 'Order not found. Please check the Order ID.';
      return err.message || `Request failed with status ${err.status}`;
    }
    return err instanceof Error ? err.message : 'Failed to load order timeline.';
  }, [timelineQuery.error]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) { toast.error('Please enter an order ID'); return; }
    if (!isReady) { toast.message('Loading sessionâ€¦'); return; }
    if (!accessToken) { toast.error('Please login to view order history'); return; }
    setSubmittedOrderId(orderId.trim());
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 fashion-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck size={28} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Track Your Order</h1>
        <p className="text-muted-foreground font-body">Enter your order ID to see order status history</p>
        {!accessToken && (
          <p className="text-sm text-muted-foreground font-body mt-2">
            Please <Link to="/login" className="text-primary font-semibold hover:underline">login</Link> to view your order timeline.
          </p>
        )}
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
              placeholder="Enter Order ID (e.g. 19d4e3f3-e874-4c4c-9d90-6d1db58ce644)"
              className="w-full pl-11 pr-4 py-3.5 border-2 border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary transition-colors"
            />
          </div>
          <motion.button type="submit" disabled={!isReady || timelineQuery.isFetching} whileTap={{ scale: 0.98 }} className="fashion-gradient text-primary-foreground px-6 py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60">
            {timelineQuery.isFetching ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
            ) : (
              <>Track <ArrowRight size={16} /></>
            )}
          </motion.button>
        </div>
      </motion.form>

      <AnimatePresence mode="wait">
        {submittedOrderId && (
          <motion.div key={submittedOrderId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
            {timelineQuery.isError && (
              <div className="text-sm text-destructive font-body mb-6">{errorMessage || 'Failed to load order timeline.'}</div>
            )}

            {timelineQuery.isSuccess && steps.length === 0 && (
              <div className="text-sm text-muted-foreground font-body mb-6">No timeline entries found for this order.</div>
            )}

            {steps.length > 0 && (
              <>
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground font-body">Order ID: {submittedOrderId}</p>
                      <p className="text-xs text-muted-foreground font-body mt-1">Latest Status: <span className="text-primary font-semibold">{currentStatus}</span></p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-bold bg-fashion-blush text-primary px-3 py-1.5 rounded-full font-body">
                        <Truck size={12} /> {currentStatus || 'Status'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-body mb-2">
                      <span>Created</span>
                      <span>Latest</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full fashion-gradient rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-display font-bold text-foreground mb-6">Order Timeline</h3>
                  <div className="space-y-0">
                    {steps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            step.current ? 'fashion-gradient text-primary-foreground animate-pulse' :
                            step.completed ? 'bg-green-500 text-background' : 'bg-muted text-muted-foreground'
                          }`}>
                            {step.completed ? <CheckCircle size={16} /> : <Clock size={14} />}
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-300' : 'bg-border'}`} />
                          )}
                        </div>
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
              </>
            )}

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

      {!submittedOrderId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-10">
          <p className="text-sm text-muted-foreground font-body">
            Example order id:{' '}
            <button onClick={() => { setOrderId('19d4e3f3-e874-4c4c-9d90-6d1db58ce644'); }} className="text-primary font-semibold hover:underline">
              19d4e3f3-e874-4c4c-9d90-6d1db58ce644
            </button>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
