import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { storageGetJson } from '@/lib/storage';
import { storageSetJson } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { platformApi } from '@/lib/platform/client';
import { getPlatformConfig } from '@/lib/platform/config';
import type { PlatformPaymentCredential } from '@/lib/platform/types';
import { toast } from 'sonner';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { accessToken, user } = useAuth();
  const LAST_ORDER_KEY = 'stylora_last_order_v1';
  const PAYMENT_UPDATED_KEY = 'stylora_payment_updated_order_id_v1';

  const urlOrderId = searchParams.get('order_id');
  const stored = storageGetJson<{
    orderId?: string | null;
    paymentMode?: string | null;
    paymentUrl?: string | null;
    paymentId?: string | null;
    amount?: number | null;
  }>(LAST_ORDER_KEY);

  const orderId = urlOrderId || stored?.orderId || `STY${Date.now().toString(36).toUpperCase()}`;
  const paymentMode = (searchParams.get('payment_mode') || stored?.paymentMode || '').toLowerCase();
  const platformPaymentMethod = (() => {
    switch (paymentMode) {
      case 'cod':
        return 'cash';
      case 'upi':
        return 'upi';
      case 'wallet':
        return 'wallet';
      case 'card':
        return 'credit card';
      default:
        return paymentMode || 'upi';
    }
  })();

  const isPaymentSuccess = useMemo(() => {
    const explicit = searchParams.get('payment_success');
    if (explicit === 'true') return true;

    const statusRaw =
      searchParams.get('status') ||
      searchParams.get('payment_status') ||
      searchParams.get('txn_status') ||
      searchParams.get('result') ||
      searchParams.get('response') ||
      '';

    const status = String(statusRaw).trim().toLowerCase();
    return ['success', 'successful', 'paid', 'completed', 'complete', 'captured', 'approved', 'ok', 'true', '1'].includes(status);
  }, [searchParams]);

  const isCod = paymentMode === 'cod';
  const showConfirmed = isCod || isPaymentSuccess;

  useEffect(() => {
    if (!isPaymentSuccess) return;
    if (paymentMode === 'cod') return;
    if (!accessToken || !user) return;

    const id = urlOrderId || stored?.orderId;
    if (!id) return;

    const already = storageGetJson<string | null>(PAYMENT_UPDATED_KEY);
    if (already === id) return;

    const amount = typeof stored?.amount === 'number' ? stored.amount : 0;

    (async () => {
      try {
        const cfg = getPlatformConfig();
        await platformApi.orderUpdate({
          accessToken,
          clientId: cfg.ordersClientId,
          orderId: id,
          body: {
            payment_status: 'paid',
            paid_amount: amount,
            order_status: 'confirmed',
            payment_method: platformPaymentMethod,
            payment_id: stored?.paymentId || '',
            updated_by: user.id,
          },
        });

        storageSetJson(PAYMENT_UPDATED_KEY, id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update order status');
      }
    })();
  }, [isPaymentSuccess, paymentMode, platformPaymentMethod, accessToken, user, urlOrderId, stored]);

  useEffect(() => {
    if (showConfirmed) clearCart();
  }, [showConfirmed, clearCart]);

  const getAppOriginForReturnUrl = () => {
    const env = import.meta.env as unknown as Record<string, unknown>;
    const raw = typeof env.VITE_APP_ORIGIN === 'string' ? env.VITE_APP_ORIGIN : '';
    const value = (raw || window.location.origin).trim();
    return value.replace(/\/+$/, '');
  };

  const regeneratePaymentLink = async () => {
    if (!accessToken || !user) throw new Error('Please login first');
    const orderId = urlOrderId || stored?.orderId;
    if (!orderId) throw new Error('Missing order id');
    const mode = paymentMode || 'upi';
    if (mode === 'cod') throw new Error('COD does not require payment');

    const amount = typeof stored?.amount === 'number' ? stored.amount : null;
    if (!amount || amount <= 0) throw new Error('Missing payment amount');

    const cfg = getPlatformConfig();

    const credsRes = await platformApi.paymentCredentialsList({ accessToken, page: 1, limit: 50 });
    const unwrapArray = (value: unknown): PlatformPaymentCredential[] => {
      if (Array.isArray(value)) return value as PlatformPaymentCredential[];
      if (value && typeof value === 'object' && 'data' in value) {
        return unwrapArray((value as { data?: unknown }).data);
      }
      return [];
    };
    const creds = unwrapArray((credsRes as unknown as { data?: unknown })?.data ?? credsRes);

    const gatewayName = (c: PlatformPaymentCredential) => {
      const rec = c as Record<string, unknown>;
      const paymentProvider = (rec.paymentProvider && typeof rec.paymentProvider === 'object') ? (rec.paymentProvider as Record<string, unknown>) : null;
      return String(
        rec.gateway ??
          rec.payment_gateway ??
          rec.gateway_name ??
          rec.name ??
          paymentProvider?.provider_name ??
          paymentProvider?.name ??
          ''
      )
        .trim()
        .toLowerCase();
    };
    const isEasebuzz = (c: PlatformPaymentCredential) => gatewayName(c).includes('easebuzz');
    const activeEasebuzzCred =
      creds.find((c) => isEasebuzz(c) && (c.is_active === true || c.is_active === 1)) || null;
    const easebuzzCred = activeEasebuzzCred || creds.find((c) => isEasebuzz(c)) || null;

    if (!easebuzzCred?.id) throw new Error('Easebuzz is not configured for this client');
    const providerId = easebuzzCred.payment_provider_id || easebuzzCred.provider_id;
    if (!providerId) throw new Error('Easebuzz payment provider id missing in credentials');

    const retUrl = new URL(getAppOriginForReturnUrl() + `/order-success`);
    retUrl.searchParams.set('order_id', String(orderId));
    retUrl.searchParams.set('payment_mode', String(mode));
    retUrl.searchParams.set('t', String(Date.now()));

    const genRes = await platformApi.paymentGenerateLink({
      accessToken,
      gateway: 'easebuzz',
      body: {
        amount: Math.round(amount),
        client_id: cfg.ordersClientId,
        user_id: user.id,
        payment_credential_id: easebuzzCred.id,
        provider_id: providerId,
        gateway: 'easebuzz',
        reference_id: String(orderId),
        return_url: retUrl.toString(),
        payment_mode: String(mode),
        requested_by: user.id,
        date: new Date().toISOString(),
        type: 'order',
        payment_id: '',
      },
    });

    const unwrapCandidate = (value: unknown): unknown => {
      if (!value) return value;
      if (typeof value !== 'object') return value;
      if ('data' in (value as Record<string, unknown>)) return (value as Record<string, unknown>).data;
      return value;
    };

    const paymentData: unknown = (genRes as unknown as { data?: unknown })?.data;
    const candidate = unwrapCandidate(paymentData ?? genRes);
    const cObj = (candidate && typeof candidate === 'object') ? (candidate as Record<string, unknown>) : null;
    const urlStr =
      (typeof cObj?.url === 'string' && cObj.url) ||
      (typeof cObj?.link === 'string' && cObj.link) ||
      (typeof cObj?.payment_url === 'string' && cObj.payment_url) ||
      (typeof candidate === 'string' && candidate ? candidate : null);
    if (!urlStr) throw new Error('Failed to generate Easebuzz payment link');

    const paymentId =
      (typeof cObj?.payment_id === 'string' && cObj.payment_id) ||
      (typeof cObj?.id === 'string' && cObj.id) ||
      null;

    storageSetJson(LAST_ORDER_KEY, { ...(stored || {}), orderId, paymentMode: mode, paymentUrl: urlStr, paymentId, amount });
    window.location.href = urlStr;
  };

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
            {showConfirmed ? (
              <CheckCircle size={48} className="text-primary-foreground" />
            ) : (
              <Package size={48} className="text-primary-foreground" />
            )}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">{showConfirmed ? 'Order Confirmed!' : 'Payment Pending'}</h1>
          <p className="text-muted-foreground font-body mb-6">
            {showConfirmed
              ? (isCod
                ? "Order placed with Cash on Delivery. We'll send you a confirmation message shortly."
                : "Payment received. We'll send you a confirmation email shortly.")
              : "Please complete payment to confirm your order. You can safely close this page and pay later from the same device."}
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
            {!showConfirmed && paymentMode !== 'cod' && (
              <button
                onClick={async () => {
                  try {
                    if (stored?.paymentUrl) {
                      window.location.href = stored.paymentUrl;
                    } else {
                      await regeneratePaymentLink();
                    }
                  } catch (err) {
                    // Keep UI simple: show error via alert to avoid adding toast dependency here.
                    alert(err instanceof Error ? err.message : 'Failed to start payment');
                  }
                }}
                className="flex-1 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity"
              >
                Complete Payment
              </button>
            )}
            <Link
              to="/products"
              className="flex-1 flex items-center justify-center gap-2 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
            <Link
              to="/"
              className="flex-1 py-3.5 border border-border rounded-xl text-sm font-semibold text-foreground font-body hover:bg-muted transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
