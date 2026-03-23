import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Package, Eye, MessageCircle, Instagram, Plus, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  const { data: productCount } = useQuery({
    queryKey: ['admin-product-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !loading,
  });

  const { data: publishedCount } = useQuery({
    queryKey: ['admin-published-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      if (error) throw error;
      return count || 0;
    },
    enabled: !loading,
  });

  const { data: categoryCount } = useQuery({
    queryKey: ['admin-category-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !loading,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, status, product_images(url, is_primary)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  if (loading) return null;

  const stats = [
    { name: 'Total Products', stat: String(productCount ?? '—'), icon: Package, color: 'bg-blue-50 text-blue-600' },
    { name: 'Published', stat: String(publishedCount ?? '—'), icon: Eye, color: 'bg-green-50 text-green-600' },
    { name: 'Categories', stat: String(categoryCount ?? '—'), icon: MessageCircle, color: 'bg-purple-50 text-purple-600' },
    { name: 'Draft Products', stat: String((productCount ?? 0) - (publishedCount ?? 0)), icon: Instagram, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <SEO title="Admin Dashboard" noindex={true} />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/admin/products"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-white p-5 shadow-sm border rounded-xl">
            <div className={`inline-flex p-2.5 rounded-lg ${item.color} mb-3`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.stat}</p>
            <p className="text-sm text-gray-500 mt-1">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/products" className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Manage Products</h3>
              <p className="text-sm text-gray-500 mt-1">Add, edit, or remove products</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </div>
        </Link>
        <Link to="/admin/categories" className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Categories</h3>
              <p className="text-sm text-gray-500 mt-1">Organize your product catalogue</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </div>
        </Link>
        <Link to="/admin/settings" className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Store Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Branding, contacts, theme</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Products</h2>
        </div>
        {topProducts && topProducts.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topProducts.map((p: any) => {
                const img = p.product_images?.find((i: any) => i.is_primary)?.url || p.product_images?.[0]?.url;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {img && <img src={img} alt="" className="w-10 h-10 rounded-md object-cover" />}
                        <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-8 text-center text-gray-500 text-sm">
            No products yet. Add your first product to get started!
          </div>
        )}
      </div>
    </div>
  );
}
