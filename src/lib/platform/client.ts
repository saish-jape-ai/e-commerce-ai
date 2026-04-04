import { getPlatformConfig } from './config';
import { platformFetchJson } from './http';
import type {
  PlatformApiResponse,
  PlatformCart,
  PlatformCartItemInput,
  PlatformCategory,
  PlatformSubcategory,
  PlatformLoginResponse,
  PlatformOrdersListResponse,
  PlatformOrderCreateRequest,
  PlatformOrderCreateResponse,
  PlatformProduct,
  PlatformProductDetailResponse,
  PlatformUserGetResponse,
  PlatformUserProfileInfoUpdateResponse,
  PlatformUserAddress,
  PlatformWishlistListResponse,
  PlatformWishlistToggleResponse,
} from './types';

const joinUrl = (baseUrl: string, path: string) => `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

const withQuery = (url: string, query: Record<string, string | number | undefined | null>) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

const postJson = async <T>(url: string, body: unknown, init?: RequestInit & { timeoutMs?: number }) => {
  return platformFetchJson<T>(url, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body ?? {}),
  });
};

const putJson = async <T>(url: string, body: unknown, init?: RequestInit & { timeoutMs?: number }) => {
  return platformFetchJson<T>(url, {
    method: 'PUT',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body ?? {}),
  });
};

const authHeaders = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

const tryPostThenGet = async <T>(url: string, body: unknown, init?: RequestInit & { timeoutMs?: number }) => {
  try {
    return await postJson<T>(url, body, init);
  } catch (err: unknown) {
    const status =
      (err && typeof err === 'object' && 'status' in err && typeof (err as { status?: unknown }).status === 'number')
        ? (err as { status: number }).status
        : undefined;
    // Some endpoints are GET-only and return 404/405 on POST.
    if (status === 404 || status === 405 || status === 415) {
      return platformFetchJson<T>(url, {
        method: 'GET',
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }
    throw err;
  }
};

const tryGetThenPost = async <T>(url: string, body: unknown, init?: RequestInit & { timeoutMs?: number }) => {
  try {
    return await platformFetchJson<T>(url, { method: 'GET', ...init });
  } catch (err: unknown) {
    const status =
      (err && typeof err === 'object' && 'status' in err && typeof (err as { status?: unknown }).status === 'number')
        ? (err as { status: number }).status
        : undefined;
    if (status === 404 || status === 405 || status === 415) {
      return postJson<T>(url, body, init);
    }
    throw err;
  }
};

export const platformApi = {
  async publicCategories(input?: { clientId?: string; k?: string; limit?: number; offset?: number; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input?.clientId || cfg.categoriesClientId;
    const base = joinUrl(cfg.baseUrl, `/auth/api/public/client/${clientId}/categories`);
    const url = withQuery(base, { k: input?.k ?? '', limit: input?.limit, offset: input?.offset });

    // Prefer GET (your curl shows POST returns: "Route POST ... not found")
    try {
      return await platformFetchJson<PlatformApiResponse<PlatformCategory[]>>(url, { method: 'GET', signal: input?.signal });
    } catch (err: unknown) {
      // Fallback for environments that only support POST.
      const payload = { k: input?.k ?? '', limit: input?.limit, offset: input?.offset };
      return tryPostThenGet<PlatformApiResponse<PlatformCategory[]>>(base, payload, { signal: input?.signal });
    }
  },

  async publicSubcategories(input: { categoryIds: string | string[]; clientId?: string; limit?: number; offset?: number; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.categoriesClientId;
    const base = joinUrl(cfg.baseUrl, `/auth/api/public/client/${clientId}/subcategories`);

    const categoryIds = Array.isArray(input.categoryIds) ? input.categoryIds : [input.categoryIds];
    const payload = { category_ids: categoryIds.join(',') };

    // Curl example uses POST (because --data is present); fallback to GET-only environments.
    try {
      return await postJson<PlatformApiResponse<PlatformSubcategory[]>>(base, payload, { signal: input.signal });
    } catch (err: unknown) {
      return tryGetThenPost<PlatformApiResponse<PlatformSubcategory[]>>(base, payload, { signal: input.signal });
    }
  },

  async publicProducts(input?: { clientId?: string; k?: string; limit?: number; offset?: number; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input?.clientId || cfg.productsClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/public/client/${clientId}/get-products`);
    const payload = { k: input?.k ?? '', limit: input?.limit, offset: input?.offset };
    return postJson<PlatformApiResponse<PlatformProduct[]>>(url, payload, { signal: input?.signal });
  },

  async publicProductDetail(input: { productId: string; clientId?: string; k?: string; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.productDetailsClientId;
    const base = joinUrl(cfg.baseUrl, `/auth/api/public/client/${clientId}/product/${input.productId}`);
    const url = withQuery(base, { k: input.k ?? '' });
    return tryGetThenPost<PlatformProductDetailResponse>(url, { k: input.k ?? '' }, { signal: input.signal, headers: { 'Content-Type': 'application/json' } });
  },

  async login(input: { email: string; password: string; captchaToken?: string | null; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const url = joinUrl(cfg.baseUrl, `/auth/api/auth/login`);
    const payload = { email: input.email, password: input.password, captchaToken: input.captchaToken ?? null };
    return postJson<PlatformLoginResponse>(url, payload, { signal: input.signal });
  },

  async cartAdd(input: {
    accessToken: string;
    userId: string;
    clientId?: string;
    cartItems: PlatformCartItemInput[];
    signal?: AbortSignal;
  }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.cartClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/cart/client/${clientId}/add`);
    return putJson<PlatformApiResponse<PlatformCart>>(
      url,
      { user_id: input.userId, cart_items: input.cartItems },
      { signal: input.signal, headers: authHeaders(input.accessToken) }
    );
  },

  async cartDeleteItems(input: { accessToken: string; clientId?: string; cartItemIds: string[]; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.cartClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/cart/client/${clientId}/cart-items/delete`);
    return putJson<PlatformApiResponse<unknown>>(
      url,
      { cart_item_ids: input.cartItemIds },
      { signal: input.signal, headers: authHeaders(input.accessToken) }
    );
  },

  async cartUpdateItemQuantity(input: {
    accessToken: string;
    clientId?: string;
    cartItemId: string;
    quantity: number;
    cartItemIds: string[];
    signal?: AbortSignal;
  }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.cartClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/cart/client/${clientId}/cart-item/${input.cartItemId}`);
    return putJson<PlatformApiResponse<unknown>>(
      url,
      { quantity: input.quantity, cart_item_ids: input.cartItemIds },
      { signal: input.signal, headers: authHeaders(input.accessToken) }
    );
  },

  async wishlistList(input: { accessToken: string; userId: string; clientId?: string; page?: number; limit?: number; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.wishlistClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/wishlist/client/${clientId}/wishlists`);
    const payload = { page: input.page ?? 1, limit: input.limit ?? 20, user_id: input.userId, client_id: clientId };
    return postJson<PlatformWishlistListResponse>(url, payload, { signal: input.signal, headers: authHeaders(input.accessToken) });
  },

  async wishlistToggle(input: {
    accessToken: string;
    userId: string;
    productId: string;
    productVariantId?: string | null;
    clientId?: string;
    signal?: AbortSignal;
  }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.wishlistClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/wishlist/client/${clientId}/wishlist/toggle`);
    const payload = {
      product_id: input.productId,
      user_id: input.userId,
      client_id: clientId,
      product_variant_id: input.productVariantId ?? null,
    };
    return postJson<PlatformWishlistToggleResponse>(url, payload, { signal: input.signal, headers: authHeaders(input.accessToken) });
  },

  async ordersList(input: { accessToken: string; clientId?: string; page?: number; limit?: number; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.ordersClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/order/client/${clientId}/orders/list`);
    const payload = { page: input.page ?? 1, limit: input.limit ?? 10 };
    return postJson<PlatformOrdersListResponse>(url, payload, { signal: input.signal, headers: authHeaders(input.accessToken) });
  },

  async userGet(input: { accessToken: string; userId: string; clientId?: string; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.usersClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/users/client/${clientId}/user/${input.userId}`);
    return platformFetchJson<PlatformUserGetResponse>(url, { method: 'GET', signal: input.signal, headers: authHeaders(input.accessToken) });
  },

  async userUpdateProfileInfo(input: {
    accessToken: string;
    userId: string;
    clientId?: string;
    userAddress: PlatformUserAddress[];
    addresses?: PlatformUserAddress[];
    signal?: AbortSignal;
  }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.usersClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/users/client/${clientId}/user/${input.userId}/profile-info`);
    const payload = { user_address: input.userAddress, addresses: input.addresses ?? input.userAddress };
    return putJson<PlatformUserProfileInfoUpdateResponse>(url, payload, { signal: input.signal, headers: authHeaders(input.accessToken) });
  },

  async orderCreate(input: { accessToken: string; clientId?: string; body: PlatformOrderCreateRequest; signal?: AbortSignal }) {
    const cfg = getPlatformConfig();
    const clientId = input.clientId || cfg.ordersClientId;
    const url = joinUrl(cfg.baseUrl, `/auth/api/order/client/${clientId}/order`);
    return postJson<PlatformOrderCreateResponse>(url, input.body, { signal: input.signal, headers: authHeaders(input.accessToken) });
  },
};
