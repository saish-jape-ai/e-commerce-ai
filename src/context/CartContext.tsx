import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import type { Product } from '@/data/products';
import { storageGetJson, storageSetJson } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { platformApi } from '@/lib/platform/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  platformCartItemId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  wishlist: string[];
  toggleWishlist: (productId: string, meta?: { platformProductId?: string; platformVariantId?: string | null }) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const wishlistQuery = useQuery({
    queryKey: ['platform', 'wishlist', { userId: user?.id }],
    enabled: Boolean(accessToken && user?.id),
    queryFn: ({ signal }) => platformApi.wishlistList({ accessToken: accessToken!, userId: user!.id, signal }),
    staleTime: 1000 * 30,
  });

  const serverWishlistIds = useMemo(() => {
    const ids = wishlistQuery.data?.wishlists?.flatMap(w => (w.items || []).map(i => i.product_id)) ?? [];
    return Array.from(new Set(ids.filter(Boolean)));
  }, [wishlistQuery.data]);

  const effectiveWishlist = accessToken ? serverWishlistIds : wishlist;

  useEffect(() => {
    const storedItems = storageGetJson<CartItem[]>("stylora_cart_v1");
    if (Array.isArray(storedItems)) setItems(storedItems);

    const storedWishlist = storageGetJson<string[]>("stylora_wishlist_v1");
    if (Array.isArray(storedWishlist)) setWishlist(storedWishlist);
  }, []);

  useEffect(() => {
    storageSetJson("stylora_cart_v1", items);
  }, [items]);

  useEffect(() => {
    storageSetJson("stylora_wishlist_v1", wishlist);
  }, [wishlist]);

  const addToCart = useCallback((product: Product, size: string, color: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size && i.color === color);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, size, color }];
    });

    if (accessToken && user?.id && product.platformProductId) {
      platformApi
        .cartAdd({
          accessToken,
          userId: user.id,
          cartItems: [
            {
              quantity: 1,
              check_inventory: false,
              product_id: product.platformProductId,
              product_variant_id: product.platformVariantId ?? null,
              product_set: 'full',
            },
          ],
        })
        .then(res => {
          const serverItem = res.data?.cart_items?.find(ci => ci.product_id === product.platformProductId);
          if (serverItem?.cart_item_id) {
            setItems(prev =>
              prev.map(i =>
                i.product.id === product.id && i.size === size && i.color === color
                  ? { ...i, platformCartItemId: serverItem.cart_item_id }
                  : i
              )
            );
          }
        })
        .catch(err => {
          toast.error(err instanceof Error ? err.message : 'Failed to sync cart');
        });
    }
  }, [accessToken, user?.id]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => {
      const toDelete = prev.filter(i => i.product.id === productId).map(i => i.platformCartItemId).filter(Boolean) as string[];
      if (accessToken && toDelete.length) {
        platformApi.cartDeleteItems({ accessToken, cartItemIds: toDelete }).catch(() => {
          // Keep UI responsive; server failures can be retried later.
        });
      }
      return prev.filter(i => i.product.id !== productId);
    });
  }, [accessToken]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev => {
      const next = prev.map(i => i.product.id === productId ? { ...i, quantity } : i);
      const affected = next.filter(i => i.product.id === productId);
      const cartItemIds = affected.map(i => i.platformCartItemId).filter(Boolean) as string[];
      const cartItemId = cartItemIds[0];
      if (accessToken && cartItemId) {
        platformApi.cartUpdateItemQuantity({ accessToken, cartItemId, quantity, cartItemIds }).catch(() => {
          // Keep UI responsive; server failures can be retried later.
        });
      }
      return next;
    });
  }, [accessToken]);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string, meta?: { platformProductId?: string; platformVariantId?: string | null }) => {
    const already = effectiveWishlist.includes(productId);

    // Optimistic UI update (local list is used as immediate feedback even when authed)
    setWishlist(prev => (prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]));

    if (!accessToken || !user?.id) return;

    const platformProductId = meta?.platformProductId || productId;
    platformApi
      .wishlistToggle({
        accessToken,
        userId: user.id,
        productId: platformProductId,
        productVariantId: meta?.platformVariantId ?? null,
      })
      .then(res => {
        const inWishlist = typeof res.in_wishlist === 'boolean' ? res.in_wishlist : res.action === 'added';
        // Align local state with server truth
        setWishlist(prev => (inWishlist ? Array.from(new Set([...prev, productId])) : prev.filter(id => id !== productId)));
        queryClient.invalidateQueries({ queryKey: ['platform', 'wishlist'] });
      })
      .catch(err => {
        // rollback
        setWishlist(prev => (already ? Array.from(new Set([...prev, productId])) : prev.filter(id => id !== productId)));
        toast.error(err instanceof Error ? err.message : 'Failed to update wishlist');
      });
  }, [accessToken, effectiveWishlist, queryClient, user?.id]);

  const isInWishlist = useCallback((productId: string) => effectiveWishlist.includes(productId), [effectiveWishlist]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice, wishlist, toggleWishlist, isInWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
