import { supabase } from './supabase';
import type { StoreSettings, Product, Category, Blog, BehindTheScene } from './types';

export async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Blog[];
}

export async function getBlog(slug: string): Promise<Blog> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Blog;
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images (*)')
    .eq('status', 'published')
    .eq('is_bestseller', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Product[];
}

// Generic fetcher
export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', '5d8d96f5-5981-48ed-bebd-0b2ad04bf1f0')
    .single();

  if (error) throw error;
  return data;
}

export async function getProducts(categoryId?: string, searchQuery?: string, page = 1, pageSize = 12, categorySlug?: string): Promise<{ products: Product[], count: number }> {
  // If we have a slug, resolve it to a category ID first
  let resolvedCategoryId = categoryId;
  if (categorySlug && !resolvedCategoryId) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    if (!cat) {
      return { products: [], count: 0 };
    }
    resolvedCategoryId = cat.id;
  }

  // Get current category AND its subcategories
  let categoryIdsToSearch: string[] = [];
  if (resolvedCategoryId) {
    categoryIdsToSearch.push(resolvedCategoryId);
    const { data: subcats } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', resolvedCategoryId);
    if (subcats && subcats.length > 0) {
      categoryIdsToSearch.push(...subcats.map(c => c.id));
    }
  }

  const categoryInner = categoryIdsToSearch.length > 0 ? '!inner' : '';
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (*),
      product_categories${categoryInner} (
        categories (*)
      )
    `, { count: 'exact' })
    .eq('status', 'published');

  if (categoryIdsToSearch.length > 0) {
    query = query.in('product_categories.category_id', categoryIdsToSearch);
  }

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`);
  }

  // Add pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;
  return { 
    products: data as Product[], 
    count: count || 0 
  };
}

export async function getProduct(idOrSlug: string): Promise<Product> {
  // First try slug, fallback to ID if it's a UUID format
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (*),
      product_variants (*),
      product_categories (
        categories (*)
      )
    `);

  if (isUuid) {
    query = query.eq('id', idOrSlug);
  } else {
    query = query.eq('slug', idOrSlug);
  }

  const { data, error } = await query.single();
  if (error) throw error;
  return data as Product;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  // Find the product's categories first
  const { data: catLinks } = await supabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', productId);

  if (!catLinks || catLinks.length === 0) {
    // No categories — just return latest products excluding current
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images (*)')
      .eq('status', 'published')
      .neq('id', productId)
      .limit(limit);
    if (error) throw error;
    return data as Product[];
  }

  const categoryIds = catLinks.map(c => c.category_id);

  const { data, error } = await supabase
    .from('products')
    .select('*, product_images (*), product_categories!inner (category_id)')
    .eq('status', 'published')
    .neq('id', productId)
    .in('product_categories.category_id', categoryIds)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function getBehindTheScenes(): Promise<BehindTheScene[]> {
  const { data, error } = await supabase
    .from('behind_the_scenes')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BehindTheScene[];
}

export async function getBehindTheScene(id: string): Promise<BehindTheScene> {
  const { data, error } = await supabase
    .from('behind_the_scenes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as BehindTheScene;
}
