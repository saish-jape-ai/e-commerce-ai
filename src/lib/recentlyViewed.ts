import { storageGetJson, storageSetJson } from "@/lib/storage";

const RECENTLY_VIEWED_KEY = "stylora_recently_viewed_v1";
const MAX_ITEMS = 8;

export const getRecentlyViewedIds = (): string[] => {
  const ids = storageGetJson<string[]>(RECENTLY_VIEWED_KEY);
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
};

export const addRecentlyViewedId = (productId: string) => {
  if (!productId) return;
  const current = getRecentlyViewedIds();
  const next = [productId, ...current.filter(id => id !== productId)].slice(0, MAX_ITEMS);
  storageSetJson(RECENTLY_VIEWED_KEY, next);
};

