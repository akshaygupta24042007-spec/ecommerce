export interface StoreSettings {
  id: string;
  store_name: string;
  store_tagline: string | null;
  store_logo_url: string | null;
  whatsapp_number: string | null;
  instagram_username: string | null;
  contact_email: string | null;
  whatsapp_enabled: boolean;
  instagram_enabled: boolean;
  order_message_prefix: string | null;
  order_message_suffix: string | null;
  theme_color: string;
  currency_symbol: string;
  locale: string;
  vercel_deploy_hook: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  parent_id?: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_group: string;
  name: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  image: string | null;
  alt_text: string | null;
  created_at: string;
}

export interface BehindTheScene {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  sku: string | null;
  status: 'published' | 'draft';
  whatsapp_enabled: boolean;
  instagram_enabled: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  created_at: string;
  images: string[];
  
  // Relations mapped by Supabase query
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  product_categories?: { category_id: string }[];
}
