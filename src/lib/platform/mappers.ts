import type { Product } from '@/data/products';
import type { PlatformProduct, PlatformProductDetail } from './types';

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const placeholderImage = (seed: string) =>
  `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop&auto=format&q=70&sig=${encodeURIComponent(seed)}`;

const pickMasterVariant = (p: PlatformProduct) => p.variants.find(v => v.is_master_variant) || p.variants[0];

const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export const platformProductToUiProduct = (p: PlatformProduct): Product => {
  const variant = pickMasterVariant(p);
  const price = variant?.discounted_price ?? variant?.regular_price ?? variant?.member_price ?? 0;
  const originalPrice = variant?.market_price ?? variant?.regular_price ?? price;
  const discount =
    (typeof variant?.total_discount_percentage === 'number' && Number.isFinite(variant.total_discount_percentage))
      ? Math.round(variant.total_discount_percentage)
      : originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

  const productImages = (p.media || []).map(m => m.media_url);
  const variantImages = (variant?.media || []).map(m => m.media_url);
  const images = uniq([...productImages, ...variantImages]);
  const image = images[0] || placeholderImage(p.product_id);

  const colors = uniq(
    p.variants
      .map(v => v.options?.color)
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  );

  const sizes = uniq(
    p.variants
      .map(v => v.options?.size)
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  );

  const descriptionRaw = p.value?.description || '';
  const description = descriptionRaw.includes('<') ? stripHtml(descriptionRaw) : descriptionRaw;

  const category = p.product_category?.[0]?.name || 'Other';
  const subcategory = p.product_subcategory?.[0]?.name || 'All';
  const tagNames = uniq((p.tags || []).map(t => t.name));

  const createdAt = Date.parse(p.created_at);
  const isNew = Number.isFinite(createdAt) ? Date.now() - createdAt < 1000 * 60 * 60 * 24 * 14 : false;
  const isTrending = discount >= 30;

  return {
    id: p.product_id,
    name: p.name,
    brand: p.product_category?.[0]?.name || tagNames[0] || 'Brand',
    price,
    originalPrice,
    discount: Math.max(0, discount),
    image,
    images: images.length ? images : undefined,
    category,
    subcategory,
    gender: 'unisex',
    sizes: sizes.length ? sizes : ['Default'],
    colors: colors.length ? colors : ['Default'],
    rating: 0,
    reviews: 0,
    description: description || '—',
    tags: tagNames,
    isNew,
    isTrending,
    platformProductId: p.product_id,
    platformVariantId: variant?.product_variant_id ?? null,
  };
};

const pickMasterVariantFromDetail = (p: PlatformProductDetail) => p.variants.find(v => v.is_master_variant) || p.variants[0];

export const platformProductDetailToUiProduct = (p: PlatformProductDetail): Product => {
  const variant = pickMasterVariantFromDetail(p);
  const price = variant?.discounted_price ?? variant?.regular_price ?? variant?.member_price ?? 0;
  const originalPrice = variant?.market_price ?? variant?.regular_price ?? price;
  const discount =
    (typeof variant?.total_discount_percentage === 'number' && Number.isFinite(variant.total_discount_percentage))
      ? Math.round(variant.total_discount_percentage)
      : originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

  const productImages = (p.media || []).map(m => m.media_url);
  const variantImages = (variant?.media || []).map(m => m.media_url);
  const images = uniq([...productImages, ...variantImages]);
  const image = images[0] || placeholderImage(p.product_id);

  const colors = uniq(
    (p.variants || [])
      .map(v => v.options?.color)
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  );

  const sizes = uniq(
    (p.variants || [])
      .map(v => v.options?.size)
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  );

  const descriptionRaw = p.value?.description || '';
  const description = descriptionRaw.includes('<') ? stripHtml(descriptionRaw) : descriptionRaw;

  const category = p.product_category?.[0]?.name || 'Other';
  const subcategory = p.product_subcategory?.[0]?.name || 'All';
  const tagNames = uniq((p.tags || []).map(t => t.name));

  const createdAt = Date.parse(p.created_at);
  const isNew = Number.isFinite(createdAt) ? Date.now() - createdAt < 1000 * 60 * 60 * 24 * 14 : false;
  const isTrending = discount >= 30;

  const rating = p.rating?.average ?? 0;
  const reviews = p.rating?.count ?? 0;

  return {
    id: p.product_id,
    name: p.name,
    brand: p.product_category?.[0]?.name || tagNames[0] || 'Brand',
    price,
    originalPrice,
    discount: Math.max(0, discount),
    image,
    images: images.length ? images : undefined,
    category,
    subcategory,
    gender: 'unisex',
    sizes: sizes.length ? sizes : ['Default'],
    colors: colors.length ? colors : ['Default'],
    rating,
    reviews,
    description: description || '—',
    tags: tagNames,
    isNew,
    isTrending,
    platformProductId: p.product_id,
    platformVariantId: variant?.product_variant_id ?? null,
  };
};

export const platformWishlistItemToUiProduct = (item: {
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  media: Array<{ media_url: string }>;
  regular_price: number | null;
  market_price: number | null;
  product_rating_average: number | null;
  value?: { description?: string };
}): Product => {
  const images = (item.media || []).map(m => m.media_url).filter(Boolean);
  const image = images[0] || placeholderImage(item.product_id);
  const price = item.regular_price ?? 0;
  const originalPrice = item.market_price ?? price;
  const discount = originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100)) : 0;
  const description = item.value?.description || '—';

  return {
    id: item.product_id,
    name: item.product_name,
    brand: 'Wishlist',
    price,
    originalPrice,
    discount,
    image,
    images: images.length ? images : undefined,
    category: 'Wishlist',
    subcategory: 'Wishlist',
    gender: 'unisex',
    sizes: ['Default'],
    colors: ['Default'],
    rating: item.product_rating_average ?? 0,
    reviews: 0,
    description,
    tags: [],
    isNew: false,
    isTrending: discount >= 30,
    platformProductId: item.product_id,
    platformVariantId: item.product_variant_id,
  };
};
