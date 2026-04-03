export type PlatformApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  total_count?: number;
  total_pages?: number;
  current_page?: number;
  limit?: number;
  offset?: number;
};

export type PlatformCategory = {
  id: string;
  category_name: string;
  category_icon: string | null;
  presigned_image_url: string | null;
  description: string | null;
  client_id: string;
  tags: unknown[];
  created_at: string;
  updated_at: string;
};

export type PlatformTag = {
  id: string;
  name: string;
};

export type PlatformMedia = {
  id: string;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  media_owner_type: string;
};

export type PlatformVariant = {
  sku: string | null;
  media: PlatformMedia[];
  barcode: string | null;
  options: Record<string, string>;
  min_stock: number;
  product_id: string;
  buying_price: number | null;
  market_price: number | null;
  member_price: number | null;
  regular_price: number | null;
  total_quantity: number;
  product_details: unknown;
  inventory_status: string;
  is_master_variant: boolean;
  unique_identifier: string | null;
  product_variant_id: string;
  product_variant_name: string | null;
  discounted_price: number | null;
  discount_amount: number | null;
  applied_discounts: unknown[];
  total_discount_percentage: number | null;
};

export type PlatformProductCategoryRef = {
  id: string;
  name: string;
};

export type PlatformProduct = {
  product_id: string;
  name: string;
  client_id: string;
  value: {
    description: string;
    terms_and_conditions: string;
  };
  model: string | null;
  sku: string | null;
  hsn_number: string | null;
  slug: string | null;
  unique_number: string | null;
  gst: number | null;
  characteristics: string[];
  unit_of_measure: string | null;
  currency: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  reference_id: string | null;
  status: string;
  make_to_order: boolean;
  is_active: boolean;
  tags: PlatformTag[];
  total_quantity: string;
  min_stock: number;
  inventory_status: string;
  media: PlatformMedia[] | null;
  variants: PlatformVariant[];
  product_category: PlatformProductCategoryRef[];
  product_subcategory: PlatformProductCategoryRef[];
  buying_price: number | null;
  member_price: number | null;
  regular_price: number | null;
  market_price: number | null;
};

export type PlatformLoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    status: string;
  };
};

export type PlatformCartItemInput = {
  quantity: number;
  check_inventory: boolean;
  product_id: string;
  product_variant_id?: string | null;
  product_set: 'full' | string;
};

export type PlatformCartItem = {
  cart_item_id: string;
  cart_id: string;
  product_id: string;
  product_variant_id: string | null;
  quantity: number;
  product_set: string;
  is_deleted: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformCart = {
  cart_id: string;
  client_id: string;
  user_id: string;
  product_price: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  cart_items: PlatformCartItem[];
};

export type PlatformWishlistItem = {
  id: string;
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  value: { description: string; terms_and_conditions: string };
  product_variant_name: string | null;
  color: string | null;
  size: string | null;
  variety: string | null;
  product_details: unknown;
  buying_price: number | null;
  member_price: number | null;
  regular_price: number | null;
  market_price: number | null;
  is_master_variant: boolean;
  product_rating_average: number | null;
  media: Array<{ media_url: string; media_type: string; thumbnail_url: string | null }>;
};

export type PlatformWishlist = {
  id: string;
  client_id: string;
  user_id: string;
  name: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  user?: { id: string; first_name: string; last_name: string; email: string };
  items: PlatformWishlistItem[];
};

export type PlatformWishlistListResponse = {
  message: string;
  wishlists: PlatformWishlist[];
  totalCount: number;
  page: number;
  limit: number;
  offset: number;
};

export type PlatformWishlistToggleResponse = {
  success: boolean;
  action: 'added' | 'removed' | string;
  message: string;
  wishlist_id?: string;
  wishlist_name?: string;
  is_default_wishlist?: boolean;
  item_id?: string;
  in_wishlist?: boolean;
};

export type PlatformUserAddress = {
  type: string;
  tag?: string | null;
  house_no?: string | null;
  house?: string | null;
  village?: string | null;
  street?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;
  zipcode?: string | null;
};

export type PlatformUser = {
  id: string;
  title?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  status?: string;
  user_address: PlatformUserAddress[];
};

export type PlatformUserGetResponse = {
  message: string;
  user: PlatformUser;
};

export type PlatformUserProfileInfoUpdateResponse = {
  success?: boolean;
  message?: string;
  user?: PlatformUser;
};

export type PlatformOrderCreateRequest = {
  currency: string;
  bill_number?: string;
  order_date: string;
  payment_method: string;
  payment_status: string;
  paid_amount: number;
  gst: number;
  shipping_fee: number;
  order_status: string;
  tracking_number?: string;
  delivery_date?: string;
  due_date?: string;
  price_type?: string;
  customer: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    country_code?: string;
  };
  order_items: Array<{
    product_id: string;
    product_variant_id: string | null;
    quantity: number;
    discount_ids?: string[];
    gst?: number;
    discount?: number;
    discount_type?: string;
  }>;
  shipping_address: PlatformUserAddress;
  billing_address: PlatformUserAddress;
  client_id: string;
  user_id: string;
  created_by?: string;
  updated_by?: string;
  payment_id?: string;
};

export type PlatformOrderCreateResponse = PlatformApiResponse<unknown>;

export type PlatformOrdersListItem = {
  order_id: string;
  user_id: string;
  client_id: string;
  bill_number: string | null;
  order_date: string;
  payment_status: string;
  order_status: string;
  grand_total: string;
  updated_at: string;
};

export type PlatformOrdersListResponse = PlatformApiResponse<PlatformOrdersListItem[]>;

export type PlatformProductDetailVariant = {
  sku: string | null;
  media: PlatformMedia[];
  barcode: string | null;
  options: Record<string, string>;
  quantity: number;
  min_stock: number;
  product_id: string;
  buying_price: number | null;
  market_price: number | null;
  member_price: number | null;
  regular_price: number | null;
  inventory_status: string;
  is_master_variant: boolean;
  unique_identifier: string | null;
  product_variant_id: string;
  discounted_price: number | null;
  applied_discounts: unknown[];
  total_discount_percentage: number | null;
};

export type PlatformProductDetail = {
  product_id: string;
  name: string;
  client_id: string;
  value: { description: string; terms_and_conditions: string };
  model: string | null;
  sku: string | null;
  hsn_number: string | null;
  slug: string | null;
  unique_number: string | null;
  gst: number | null;
  characteristics: string[];
  unit_of_measure: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  make_to_order: boolean;
  is_active: boolean;
  total_quantity: number;
  min_stock: number;
  inventory_status: string;
  tags: PlatformTag[];
  variants: PlatformProductDetailVariant[];
  rating?: { average: number | null; count: number; reviews: unknown[] };
  product_category: PlatformProductCategoryRef[];
  product_subcategory: PlatformProductCategoryRef[];
  media: PlatformMedia[];
  in_wishlist?: boolean;
};

export type PlatformProductDetailResponse = PlatformApiResponse<PlatformProductDetail>;
