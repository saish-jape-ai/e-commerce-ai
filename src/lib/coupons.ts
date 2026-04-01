import { coupons } from "@/data/products";

export type CouponResult =
  | { ok: true; code: string; discountAmount: number; freeShipping: boolean }
  | { ok: false; code: string; reason: string };

export const normalizeCouponCode = (code: string) => code.trim().toUpperCase();

export const evaluateCoupon = (subtotal: number, codeInput: string): CouponResult => {
  const code = normalizeCouponCode(codeInput);
  if (!code) return { ok: false, code, reason: "Enter a coupon code" };

  const coupon = coupons.find(c => c.code.toUpperCase() === code);
  if (!coupon) return { ok: false, code, reason: "Invalid coupon code" };

  if (subtotal < coupon.minOrder) {
    return { ok: false, code, reason: `Minimum order is ₹${coupon.minOrder.toLocaleString()}` };
  }

  if (coupon.type === "shipping") {
    return { ok: true, code, discountAmount: 0, freeShipping: true };
  }

  if (coupon.type === "flat") {
    return { ok: true, code, discountAmount: coupon.discount, freeShipping: false };
  }

  const raw = Math.round((subtotal * coupon.discount) / 100);
  const capped = typeof coupon.maxDiscount === "number" ? Math.min(raw, coupon.maxDiscount) : raw;
  return { ok: true, code, discountAmount: capped, freeShipping: false };
};

