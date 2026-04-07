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
  const isAuthed = Boolean(accessToken && user?.id);

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
    const storedWishlist = storageGetJson<string[]>("stylora_wishlist_v1");
    if (Array.isArray(storedWishlist)) setWishlist(storedWishlist);
  }, []);

  const cartQuery = useQuery({
    queryKey: ['platform', 'cart', { userId: user?.id }],
    enabled: Boolean(accessToken && user?.id),
    queryFn: ({ signal }) => platformApi.cartList({ accessToken: accessToken!, signal }),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isAuthed) return;
    
    if (cartQuery.data?.success && Array.isArray(cartQuery.data.data)) {
       const serverCarts = cartQuery.data.data;
       if (serverCarts.length > 0) {
         const serverItems = serverCarts[0].items || [];
         const mapped: CartItem[] = serverItems.map((ci: any) => {
            const variantOptions = ci.variants?.[0]?.options || {};
            const mrp = ci.mrp || ci.price || 0;
            const price = ci.price || 0;
            const d = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
            
            return {
              product: {
                id: ci.product_id,
                platformProductId: ci.product_id,
                platformVariantId: ci.variants?.[0]?.product_variant_id ?? null,
                name: ci.product_name,
                price: price,
                originalPrice: mrp,
                image: ci.media?.[0]?.media_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=300&fit=crop',
                brand: 'Stylora',
                category: '',
                subcategory: '',
                description: '',
                features: [],
                tags: [],
                rating: 0,
                reviewsCount: 0,
                isNew: false,
                isTrending: false,
                gender: '',
                discount: d,
              },
              quantity: ci.quantity || 1,
              size: variantOptions.size || 'M',
              color: variantOptions.color || 'Black',
              platformCartItemId: ci.cart_item_ids?.[0], 
            };
         });
         setItems(mapped);
       } else {
         setItems([]);
       }
    }
  }, [cartQuery.data, isAuthed]);

  useEffect(() => {
    if (!isAuthed) {
      setItems([]);
      storageSetJson("stylora_cart_v1", []);
      return;
    }

    // Optional: Could fall back to local storage before API fetch finishes
    if (!cartQuery.data) {
      const storedItems = storageGetJson<CartItem[]>("stylora_cart_v1");
      if (Array.isArray(storedItems)) setItems(storedItems);
    }
  }, [isAuthed, cartQuery.data]);

  useEffect(() => {
    if (!isAuthed) return;
    storageSetJson("stylora_cart_v1", items);
  }, [isAuthed, items]);

  useEffect(() => {
    storageSetJson("stylora_wishlist_v1", wishlist);
  }, [wishlist]);

  const addToCart = useCallback((product: Product, size: string, color: string) => {
    if (!isAuthed) {
      return;
    }

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

    if (product.platformProductId) {
      platformApi
        .cartAdd({
          accessToken,
          userId: user.id,
          cartItems: [
            {
              quantity: 1,
              check_inventory: false,
              product_id: product.platformProductId,
              // API curl uses null here; we only have a "display" variant today, not an explicit selection.
              product_variant_id: null,
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
          queryClient.invalidateQueries({ queryKey: ['platform', 'cart'] });
        })
        .catch(err => {
          toast.error(err instanceof Error ? err.message : 'Failed to sync cart');
        });
    } else {
      toast.error('Missing platform product id');
    }
  }, [accessToken, isAuthed, user?.id, queryClient]);

  const removeFromCart = useCallback((productId: string) => {
    if (!isAuthed) return;
    setItems(prev => {
      const toDelete = prev.filter(i => i.product.id === productId).map(i => i.platformCartItemId).filter(Boolean) as string[];
      if (accessToken && toDelete.length) {
        platformApi.cartDeleteItems({ accessToken, cartItemIds: toDelete })
          .then(() => queryClient.invalidateQueries({ queryKey: ['platform', 'cart'] }))
          .catch(() => {
          // Keep UI responsive
        });
      }
      return prev.filter(i => i.product.id !== productId);
    });
  }, [accessToken, isAuthed, queryClient]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!isAuthed) return;
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
        platformApi.cartUpdateItemQuantity({ accessToken, cartItemId, quantity, cartItemIds })
          .then(() => queryClient.invalidateQueries({ queryKey: ['platform', 'cart'] }))
          .catch(() => {
          // Keep UI responsive; server failures can be retried later.
        });
      }
      return next;
    });
  }, [accessToken, isAuthed, queryClient]);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string, meta?: { platformProductId?: string; platformVariantId?: string | null }) => {
    if (!isAuthed) return;
    const already = effectiveWishlist.includes(productId);

    // Optimistic UI update
    setWishlist(prev => (prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]));

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
  }, [accessToken, effectiveWishlist, isAuthed, queryClient, user?.id]);

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
