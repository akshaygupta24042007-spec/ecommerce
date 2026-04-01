import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = 'https://www.hiyawear.com';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables — skipping sitemap generation (using existing sitemap.xml)');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
  console.log('Fetching products from Supabase...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products.`);

  console.log('Fetching blogs from Supabase...');
  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('slug, created_at');

  if (blogsError) {
    console.error('Error fetching blogs:', blogsError);
    process.exit(1);
  }

  console.log(`Found ${blogs?.length || 0} blogs.`);

  console.log('Fetching categories from Supabase...');
  const { data: categories, error: catsError } = await supabase
    .from('categories')
    .select('slug');

  if (catsError) {
    console.error('Error fetching categories:', catsError);
    process.exit(1);
  }

  console.log(`Found ${categories?.length || 0} categories.`);

  console.log('Fetching behind the scenes from Supabase...');
  const { data: bts, error: btsError } = await supabase
    .from('behind_the_scenes')
    .select('id, created_at');

  if (btsError) {
    console.error('Error fetching behind the scenes:', btsError);
    process.exit(1);
  }

  console.log(`Found ${bts?.length || 0} behind the scenes items.`);

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/search', changefreq: 'daily', priority: '0.8' },
    { url: '/about', changefreq: 'monthly', priority: '0.5' },
    { url: '/contact', changefreq: 'monthly', priority: '0.5' },
    { url: '/faq', changefreq: 'monthly', priority: '0.5' },
    { url: '/blogs', changefreq: 'weekly', priority: '0.7' },
    { url: '/behind-the-scenes', changefreq: 'weekly', priority: '0.6' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${products.map(product => `
  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
    <lastmod>${new Date(product.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${(blogs || []).map(blog => `
  <url>
    <loc>${SITE_URL}/blogs/${blog.slug}</loc>
    <lastmod>${new Date(blog.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${(categories || []).map(cat => `
  <url>
    <loc>${SITE_URL}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${(bts || []).map(item => `
  <url>
    <loc>${SITE_URL}/behind-the-scenes/${item.id}</loc>
    <lastmod>${new Date(item.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  const sitemapPath = resolve(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
}

generateSitemap();
