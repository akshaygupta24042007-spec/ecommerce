import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategoryBySlug, getStoreSettings, getCategories } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { ChevronLeft, LayoutGrid } from 'lucide-react';
import SEO from '../components/SEO';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getStoreSettings,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', 'category', slug],
    queryFn: () => getProducts(undefined, undefined, 1, 50, slug),
    enabled: !!slug,
  });

  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoadingCategory || isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <LayoutGrid className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
        <p className="text-gray-500 mb-8">The category you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          Back to Store
        </Link>
      </div>
    );
  }

  const products = productsData?.products || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO 
        title={settings ? `${category.name} | ${settings.store_name}` : category.name} 
        description={`Browse our exclusive collection of ${category.name}. Premium handmade clothing and accessories at Hiya Wear.`} 
        path={`/category/${slug}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.hiyawear.com' },
          { name: category.name, url: `https://www.hiyawear.com/category/${slug}` }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Shop
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 capitalize">
            {category.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-6">
            Explore our curated selection of {category.name.toLowerCase()}. Each piece is handcrafted with care and attention to detail.
          </p>

          {allCategories && category && (
            <div className="flex flex-wrap gap-2 mt-4">
              {allCategories.filter(c => c.parent_id === category.id).map(sub => (
                <Link
                  key={sub.id}
                  to={`/category/${sub.slug}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors shadow-sm"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <LayoutGrid className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">We don't have any products in this category at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
