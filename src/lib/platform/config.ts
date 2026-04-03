const requireEnv = (key: string) => {
  const env = import.meta.env as unknown as Record<string, string | boolean | undefined>;
  const value = env[key];
  if (typeof value !== 'string') throw new Error(`Missing required env var: ${key}`);
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optionalEnv = (key: string) => {
  const env = import.meta.env as unknown as Record<string, string | boolean | undefined>;
  const value = env[key];
  return typeof value === 'string' ? value : undefined;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export type PlatformConfig = {
  baseUrl: string;
  publicClientId: string;
  categoriesClientId: string;
  productsClientId: string;
  productDetailsClientId: string;
  cartClientId: string;
  wishlistClientId: string;
  usersClientId: string;
  ordersClientId: string;
};

export const getPlatformConfig = (): PlatformConfig => {
  // Fallback helps local dev when .env isn't set yet. Still recommend setting it explicitly.
  const baseUrl = trimTrailingSlash(optionalEnv('VITE_PLATFORM_BASE_URL') || 'https://platform-development-dev.157.20.214.214.nip.io');
  const publicClientId = optionalEnv('VITE_PLATFORM_PUBLIC_CLIENT_ID') || '';
  const categoriesClientId = optionalEnv('VITE_PLATFORM_CATEGORIES_CLIENT_ID') || publicClientId;
  const productsClientId = optionalEnv('VITE_PLATFORM_PRODUCTS_CLIENT_ID') || publicClientId;
  const productDetailsClientId = optionalEnv('VITE_PLATFORM_PRODUCT_DETAILS_CLIENT_ID') || productsClientId || publicClientId;
  const wishlistClientId = optionalEnv('VITE_PLATFORM_WISHLIST_CLIENT_ID') || publicClientId;
  const cartClientId = optionalEnv('VITE_PLATFORM_CART_CLIENT_ID') || wishlistClientId || publicClientId;
  const usersClientId = optionalEnv('VITE_PLATFORM_USERS_CLIENT_ID') || wishlistClientId || publicClientId;
  const ordersClientId = optionalEnv('VITE_PLATFORM_ORDERS_CLIENT_ID') || productsClientId || publicClientId;

  if (!baseUrl) throw new Error('Missing required env var: VITE_PLATFORM_BASE_URL');
  if (!categoriesClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_CATEGORIES_CLIENT_ID)');
  if (!productsClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_PRODUCTS_CLIENT_ID)');
  if (!productDetailsClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_PRODUCT_DETAILS_CLIENT_ID)');
  if (!cartClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_CART_CLIENT_ID)');
  if (!wishlistClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_WISHLIST_CLIENT_ID)');
  if (!usersClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_USERS_CLIENT_ID)');
  if (!ordersClientId) throw new Error('Missing VITE_PLATFORM_PUBLIC_CLIENT_ID (or VITE_PLATFORM_ORDERS_CLIENT_ID)');

  return { baseUrl, publicClientId, categoriesClientId, productsClientId, productDetailsClientId, cartClientId, wishlistClientId, usersClientId, ordersClientId };
};
