import { useMemo } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { platformApi } from '@/lib/platform/client';
import { platformProductToUiProduct } from '@/lib/platform/mappers';
import type { PlatformCategory, PlatformProduct } from '@/lib/platform/types';
import type { Product } from '@/data/products';

export const platformQueryKeys = {
  categories: (input: { k: string; clientId?: string }) => ['platform', 'categories', input] as const,
  products: (input: { k: string; clientId?: string; limit?: number; offset?: number }) => ['platform', 'products', input] as const,
};

export const usePlatformCategories = (input?: { k?: string; clientId?: string }) => {
  const k = input?.k ?? '';
  return useQuery({
    queryKey: platformQueryKeys.categories({ k, clientId: input?.clientId }),
    queryFn: ({ signal }) => platformApi.publicCategories({ clientId: input?.clientId, k, signal }).then(r => r.data),
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
}): UseQueryResult<PlatformProductsResult> => {
  const k = input?.k ?? '';
  const limit = input?.limit;
  const offset = input?.offset;

  return useQuery({
    queryKey: platformQueryKeys.products({ k, clientId: input?.clientId, limit, offset }),
    queryFn: async ({ signal }) => {
      const res = await platformApi.publicProducts({ clientId: input?.clientId, k, limit, offset, signal });
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

