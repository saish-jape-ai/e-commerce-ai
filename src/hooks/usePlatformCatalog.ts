import { useMemo } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { platformApi } from '@/lib/platform/client';
import { platformBestSellerToUiProduct, platformProductDetailToUiProduct, platformProductToUiProduct } from '@/lib/platform/mappers';
import type { PlatformBestSellerItem, PlatformCategory, PlatformProduct, PlatformProductDetail, PlatformSubcategory } from '@/lib/platform/types';
import type { Product } from '@/data/products';

export const platformQueryKeys = {
  categories: (input: { k: string; clientId?: string; limit?: number; offset?: number }) => ['platform', 'categories', input] as const,
  subcategories: (input: { categoryId: string; clientId?: string }) => ['platform', 'subcategories', input] as const,
  products: (input: { k: string; clientId?: string; limit?: number; offset?: number; categoryId?: string; subcategoryId?: string }) => ['platform', 'products', input] as const,
  productDetail: (input: { productId: string; clientId?: string }) => ['platform', 'product', input] as const,
  bestSellers: (input: { clientId?: string }) => ['platform', 'best-sellers', input] as const,
};

export const usePlatformCategories = (input?: { k?: string; clientId?: string; limit?: number; offset?: number }) => {
  const k = input?.k ?? '';
  const limit = input?.limit ?? 200;
  const offset = input?.offset ?? 0;
  return useQuery({
    queryKey: platformQueryKeys.categories({ k, clientId: input?.clientId, limit, offset }),
    queryFn: ({ signal }) => platformApi.publicCategories({ clientId: input?.clientId, k, limit, offset, signal }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePlatformSubcategories = (categoryId: string | null | undefined, input?: { clientId?: string }) => {
  return useQuery({
    queryKey: platformQueryKeys.subcategories({ categoryId: categoryId || '', clientId: input?.clientId }),
    enabled: Boolean(categoryId),
    queryFn: ({ signal }) => platformApi.publicSubcategories({ clientId: input?.clientId, categoryIds: categoryId!, signal }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });
};

export type PlatformProductsResult = {
  raw: PlatformProduct[];
  ui: Product[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  limit?: number;
};

export const usePlatformProducts = (input?: {
  k?: string;
  clientId?: string;
  limit?: number;
  offset?: number;
  categoryId?: string;
  subcategoryId?: string;
}): UseQueryResult<PlatformProductsResult> => {
  const k = input?.k ?? '';
  const limit = input?.limit;
  const offset = input?.offset;
  const categoryId = input?.categoryId;
  const subcategoryId = input?.subcategoryId;

  return useQuery({
    queryKey: platformQueryKeys.products({ k, clientId: input?.clientId, limit, offset, categoryId, subcategoryId }),
    queryFn: async ({ signal }) => {
      const res = await platformApi.publicProducts({ clientId: input?.clientId, k, limit, offset, categoryId, subcategoryId, signal });
      const raw = res.data ?? [];
      return {
        raw,
        ui: raw.map(platformProductToUiProduct),
        totalCount: res.total_count,
        totalPages: res.total_pages,
        currentPage: res.current_page,
        limit: res.limit,
      };
    },
    staleTime: 1000 * 30,
  });
};

export const usePlatformCategoryOptions = (categories?: PlatformCategory[]) => {
  return useMemo(() => {
    const names = (categories || []).map(c => c.category_name).filter(Boolean);
    const uniq = Array.from(new Set(names));
    uniq.sort((a, b) => a.localeCompare(b));
    return uniq;
  }, [categories]);
};

export type PlatformBestSellersResult = {
  raw: PlatformBestSellerItem[];
  ui: Product[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  limit?: number;
};

export const usePlatformBestSellers = (input?: { clientId?: string }): UseQueryResult<PlatformBestSellersResult> => {
  return useQuery({
    queryKey: platformQueryKeys.bestSellers({ clientId: input?.clientId }),
    queryFn: async ({ signal }) => {
      const res = await platformApi.publicBestSellers({ clientId: input?.clientId, signal });
      const raw = res.data ?? [];
      return {
        raw,
        ui: raw.map(platformBestSellerToUiProduct),
        totalCount: res.total_count,
        totalPages: res.total_pages,
        currentPage: res.current_page,
        limit: res.limit,
      };
    },
    staleTime: 1000 * 30,
  });
};

export const usePlatformProductDetail = (productId: string | undefined, input?: { clientId?: string; k?: string }) => {
  return useQuery({
    queryKey: platformQueryKeys.productDetail({ productId: productId || '', clientId: input?.clientId }),
    enabled: Boolean(productId),
    queryFn: async ({ signal }) => {
      const res = await platformApi.publicProductDetail({ productId: productId!, clientId: input?.clientId, k: input?.k, signal });
      const raw = res.data as PlatformProductDetail;
      return { raw, ui: platformProductDetailToUiProduct(raw) };
    },
    staleTime: 1000 * 30,
  });
};

