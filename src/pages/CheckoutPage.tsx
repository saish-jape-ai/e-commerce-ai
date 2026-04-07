import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Truck, Shield, ChevronRight, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { evaluateCoupon } from '@/lib/coupons';
import { storageGetJson } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { platformApi } from '@/lib/platform/client';
import type { PlatformUserAddress } from '@/lib/platform/types';
import { getPlatformConfig } from '@/lib/platform/config';

const paymentMethods = [
  { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
  { id: 'wallet', label: 'Wallet', desc: 'Paytm, Amazon Pay', icon: '👛' },
];

const addrKey = (a: PlatformUserAddress) =>
  [
    a.type,
    a.tag,
    a.house_no,
    a.house,
    a.village,
    a.street,
    a.locality,
    a.city,
    a.state,
    a.country,
    a.zip_code,
    a.zipcode,
  ].filter(Boolean).join('|');

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { accessToken, user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedAddressKey, setSelectedAddressKey] = useState<string>('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<PlatformUserAddress>({
    type: 'D',
    tag: 'Home',
    house_no: '',
    village: '',
    street: '',
    locality: '',
    city: '',
    state: '',
    country: 'India',
    zip_code: '',
  });
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const userQuery = useQuery({
    queryKey: ['platform', 'user', { userId: user?.id }],
    enabled: Boolean(accessToken && user?.id),
    queryFn: ({ signal }) => platformApi.userGet({ accessToken: accessToken!, userId: user!.id, signal }),
    staleTime: 1000 * 15,
  });

  const savedAddresses = userQuery.data?.user?.user_address ?? [];

  useEffect(() => {
    if (!selectedAddressKey && savedAddresses.length > 0) {
      setSelectedAddressKey(addrKey(savedAddresses[0]));
    }
  }, [savedAddresses, selectedAddressKey]);

  const saveAddressMutation = useMutation({
    mutationFn: async (next: PlatformUserAddress) => {
      if (!accessToken || !user?.id) throw new Error('Please login to save address');
      const existing = savedAddresses;
      const nextList = [next, ...existing.filter(a => addrKey(a) !== addrKey(next))];
      return platformApi.userUpdateProfileInfo({
        accessToken,
        userId: user.id,
        userAddress: nextList,
        addresses: nextList.map(a => ({ ...a, zipcode: a.zipcode || a.zip_code, house: a.house || a.house_no })),
      });
    },
    onSuccess: () => {
      userQuery.refetch();
    },
  });

  useEffect(() => {
    const stored = storageGetJson<string | null>('stylora_coupon_v1');
    if (typeof stored === 'string' && stored) setAppliedCoupon(stored);
  }, []);

  const couponResult = useMemo(() => {
    if (!appliedCoupon) return null;
    const res = evaluateCoupon(totalPrice, appliedCoupon);
    return res.ok ? res : null;
  }, [appliedCoupon, totalPrice]);

  const discount = couponResult?.discountAmount || 0;
  const deliveryFee = couponResult?.freeShipping ? 0 : (totalPrice > 999 ? 0 : 99);
  const finalTotal = Math.max(0, totalPrice - discount + deliveryFee);
  const selectedAddress = savedAddresses.find(a => addrKey(a) === selectedAddressKey) || null;

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken || !user) throw new Error('Please login first');
      if (!selectedAddress) throw new Error('Please select an address');

      const cfg = getPlatformConfig();
      const today = new Date();
      const toYmd = (d: Date) => d.toISOString().slice(0, 10);
      const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

      const orderItems = items.map(i => {
        const productId = i.product.platformProductId || i.product.id;
        const variantId = i.product.platformVariantId ?? null;
        if (!productId) throw new Error('Missing platform product id for an item');
        return {
          product_id: productId,
          product_variant_id: variantId,
          quantity: i.quantity,
          discount_ids: [],
          gst: 0,
        };
      });

      const addr: PlatformUserAddress = {
        type: selectedAddress.type,
        tag: selectedAddress.tag,
        house_no: selectedAddress.house_no || selectedAddress.house || '',
        village: selectedAddress.village || '',
        street: selectedAddress.street || '',
        locality: selectedAddress.locality || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        country: selectedAddress.country || 'India',
        zip_code: selectedAddress.zip_code || selectedAddress.zipcode || '',
      };

      const generate11Alphanumeric = () => {
        return (Date.now().toString(36) + Math.random().toString(36).substring(2)).toUpperCase().substring(0, 11);
      };
      
      const billNumber = `INV${generate11Alphanumeric()}`;
      const trackingNumber = `TRK${generate11Alphanumeric()}`;

      const orderRes = await platformApi.orderCreate({
        accessToken,
        body: {
          currency: 'INR',
          bill_number: billNumber,
          order_date: toYmd(today),
          payment_method: selectedPayment,
          payment_status: 'pending',
          paid_amount: 0,
          gst: 0,
          shipping_fee: deliveryFee,
          order_status: 'pending',
          tracking_number: trackingNumber,
          delivery_date: toYmd(addDays(today, 7)),
          due_date: toYmd(addDays(today, 1)),
          price_type: 'regular_price',
          customer: {
            first_name: user.firstName,
            last_name: user.lastName,
            phone_number: user.phone || '',
            email: user.email,
            country_code: '+91',
          },
          order_items: orderItems,
          shipping_address: addr,
          billing_address: addr,
          client_id: cfg.ordersClientId,
          user_id: user.id,
          created_by: user.id,
          updated_by: user.id,
          payment_id: '',
        },
      });

      const resData = orderRes.data as any;
      const orderId = resData?.id || resData?.order_id || resData?.reference_id || (Array.isArray(resData) ? resData[0]?.order_id || resData[0]?.id : undefined);

      if (selectedPayment !== 'cod' && orderId) {
        const credsRes = await platformApi.paymentCredentialsList({ accessToken });
        const dataArr = credsRes.data?.data || credsRes.data || [];
        const creds = Array.isArray(dataArr) ? dataArr : [];
        const easebuzzCred = creds.find((c: any) => c.gateway === 'easebuzz') || creds[0];

        if (easebuzzCred) {
          const retUrl = new URL(window.location.origin + `/order-success?payment_success=true&order_id=${orderId}`);
          
          const genRes = await platformApi.paymentGenerateLink({
            accessToken,
            gateway: 'easebuzz',
            body: {
              amount: finalTotal, // assuming finalTotal is correct amount or backend checks
              client_id: cfg.ordersClientId,
              user_id: user.id,
              payment_credential_id: easebuzzCred.id,
              provider_id: easebuzzCred.payment_provider_id || easebuzzCred.provider_id,
              gateway: 'easebuzz',
              reference_id: orderId,
              return_url: retUrl.toString(),
              payment_mode: selectedPayment,
              requested_by: user.id,
              date: new Date().toISOString(),
              type: 'order',
              payment_id: ''
            }
          });
          
          const paymentData = genRes.data as any;
          const urlStr = paymentData?.url || paymentData?.link || paymentData?.payment_url || (typeof paymentData === 'string' && paymentData.startsWith('http') ? paymentData : null);
          if (urlStr) {
            return { redirectUrl: urlStr };
          }
        }
      }

      return { redirectUrl: '/order-success' };
    },
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">No items to checkout</h1>
        <Link to="/products" className="text-primary font-semibold font-body hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  // Order placement is handled in step 3 via Platform API.

  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Payment', icon: CreditCard },
    { num: 3, label: 'Review', icon: Check },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-8 max-w-lg mx-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <motion.div
              animate={{ scale: step >= s.num ? 1 : 0.9 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-body transition-colors ${
                step >= s.num ? 'fashion-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <s.icon size={16} />
              <span className="hidden sm:inline">{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 transition-colors ${step > s.num ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Select Delivery Address</h2>
                <div className="space-y-3">
                  {!accessToken && (
                    <div className="border border-border rounded-xl p-4 text-sm text-muted-foreground font-body">
                      Please <Link to="/login" className="text-primary font-semibold hover:underline">login</Link> to use saved addresses and place an order.
                    </div>
                  )}

                  {userQuery.isLoading && (
                    <div className="text-sm text-muted-foreground font-body">Loading addresses…</div>
                  )}
                  {userQuery.isError && (
                    <div className="text-sm text-destructive font-body">Failed to load addresses.</div>
                  )}

                  {savedAddresses.map(addr => {
                    const key = addrKey(addr);
                    const line1 = [addr.house_no || addr.house, addr.street].filter(Boolean).join(', ');
                    const line2 = [addr.village, addr.locality, addr.city].filter(Boolean).join(', ');
                    const pin = addr.zip_code || addr.zipcode;

                    return (
                      <label
                        key={key}
                        className={`block border rounded-xl p-4 cursor-pointer transition-colors ${
                          selectedAddressKey === key ? 'border-primary bg-fashion-blush' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressKey === key}
                            onChange={() => setSelectedAddressKey(key)}
                            className="accent-primary mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-foreground font-body text-sm">{addr.tag || 'Address'}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded font-body">
                                {addr.type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 font-body">{line1 || '—'}</p>
                            <p className="text-sm text-muted-foreground font-body">{line2 || '—'}</p>
                            <p className="text-sm text-muted-foreground font-body">{[addr.state, pin].filter(Boolean).join(' - ')}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowAddAddress(v => !v)}
                    className="w-full border-2 border-dashed border-border rounded-xl p-4 text-sm text-primary font-semibold font-body hover:border-primary hover:bg-fashion-blush transition-colors flex items-center justify-center gap-2"
                    disabled={!accessToken}
                  >
                    <Plus size={16} /> {showAddAddress ? 'Close' : 'Add New Address'}
                  </button>

                  <AnimatePresence>
                    {showAddAddress && (
                      <motion.div
                        key="add-address"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="border border-border rounded-xl p-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={addressForm.tag || ''}
                            onChange={e => setAddressForm(a => ({ ...a, tag: e.target.value }))}
                            placeholder="Tag (Home/Work)"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.house_no || ''}
                            onChange={e => setAddressForm(a => ({ ...a, house_no: e.target.value }))}
                            placeholder="House No"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.street || ''}
                            onChange={e => setAddressForm(a => ({ ...a, street: e.target.value }))}
                            placeholder="Street"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.village || ''}
                            onChange={e => setAddressForm(a => ({ ...a, village: e.target.value }))}
                            placeholder="Village/Area"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.city || ''}
                            onChange={e => setAddressForm(a => ({ ...a, city: e.target.value }))}
                            placeholder="City"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.state || ''}
                            onChange={e => setAddressForm(a => ({ ...a, state: e.target.value }))}
                            placeholder="State"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.zip_code || ''}
                            onChange={e => setAddressForm(a => ({ ...a, zip_code: e.target.value }))}
                            placeholder="Zip Code"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                          <input
                            value={addressForm.country || ''}
                            onChange={e => setAddressForm(a => ({ ...a, country: e.target.value }))}
                            placeholder="Country"
                            className="px-3 py-2 border border-border rounded-lg text-sm font-body bg-background"
                          />
                        </div>

                        <div className="flex gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setShowAddAddress(false)}
                            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold font-body hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await saveAddressMutation.mutateAsync(addressForm);
                                toast.success('Address saved');
                                setShowAddAddress(false);
                                setSelectedAddressKey(addrKey(addressForm));
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to save address');
                              }
                            }}
                            className="flex-1 fashion-gradient text-primary-foreground py-3 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity disabled:opacity-60"
                            disabled={saveAddressMutation.isPending}
                          >
                            {saveAddressMutation.isPending ? 'Saving…' : 'Save Address'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => {
                    if (!accessToken) { toast.error('Please login first'); return; }
                    if (!selectedAddressKey) { toast.error('Please select an address'); return; }
                    setStep(2);
                  }}
                  className="w-full mt-6 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map(pm => (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition-colors ${
                        selectedPayment === pm.id ? 'border-primary bg-fashion-blush' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input type="radio" name="payment" checked={selectedPayment === pm.id} onChange={() => setSelectedPayment(pm.id)} className="accent-primary" />
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-body">{pm.label}</p>
                        <p className="text-xs text-muted-foreground font-body">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {selectedPayment === 'card' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-3 border border-border rounded-xl p-4">
                    <input placeholder="Card Number" className="w-full px-4 py-3 border border-border rounded-lg text-sm font-body bg-background outline-none focus:border-primary transition-colors" />
                    <div className="flex gap-3">
                      <input placeholder="MM/YY" className="flex-1 px-4 py-3 border border-border rounded-lg text-sm font-body bg-background outline-none focus:border-primary transition-colors" />
                      <input placeholder="CVV" className="w-24 px-4 py-3 border border-border rounded-lg text-sm font-body bg-background outline-none focus:border-primary transition-colors" />
                    </div>
                    <input placeholder="Name on Card" className="w-full px-4 py-3 border border-border rounded-lg text-sm font-body bg-background outline-none focus:border-primary transition-colors" />
                  </motion.div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold font-body hover:bg-muted transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Review Your Order</h2>

                {/* Delivery info */}
                <div className="border border-border rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground font-body">Estimated Delivery</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-body">3-5 business days | Free delivery on orders above ₹999</p>
                </div>

                {/* Items preview */}
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3 border border-border rounded-xl p-3">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-20 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1 font-body">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{item.size} | {item.color} | Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-foreground mt-1 font-body">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-fashion-blush rounded-xl">
                  <Shield size={16} className="text-primary" />
                  <p className="text-xs text-foreground font-body">Your payment information is secure and encrypted</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold font-body hover:bg-muted transition-colors">Back</button>
                  <motion.button
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        const res = await orderMutation.mutateAsync();
                        clearCart();
                        toast.success('Order placed successfully');
                        if (res.redirectUrl && res.redirectUrl.startsWith('http')) {
                          window.location.href = res.redirectUrl;
                        } else {
                          navigate(res.redirectUrl || '/order-success');
                        }
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Failed to place order');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing || orderMutation.isPending}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                    ) : (
                      <>Place Order — ₹{finalTotal.toLocaleString()}</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-72 shrink-0">
          <div className="border border-border rounded-xl p-5 bg-card sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 font-body">Order Summary</h3>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between"><span className="text-muted-foreground">Items ({items.length})</span><span>₹{totalPrice.toLocaleString()}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon</span>
                  <span className="text-foreground font-semibold">{appliedCoupon}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coupon Discount</span>
                <span className={discount > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                  {discount > 0 ? `-₹${discount.toLocaleString()}` : '₹0'}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
