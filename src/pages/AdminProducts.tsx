import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import type { Product, Category } from '../lib/types';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    full_description: '',
    status: 'published',
    is_available: true,
    is_bestseller: false,
    images: [] as string[],
  });
  const [files, setFiles] = useState<File[]>([]);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_categories(category_id)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([formData])
        .select()
        .single();
      
      if (productError) throw productError;

      // 2. Upload images if exist
      if (files.length > 0 && product) {
        setUploading(true);
        const uploadedUrls: string[] = [];

        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${product.id}-${Math.random()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('store-assets')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('store-assets')
            .getPublicUrl(filePath);
          
          uploadedUrls.push(publicUrlData.publicUrl);

          // Save image record in product_images (legacy support)
          await supabase
            .from('product_images')
            .insert([{
              product_id: product.id,
              url: publicUrlData.publicUrl,
              is_primary: uploadedUrls.length === 1
            }]);
        }

        // Update product images array
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: uploadedUrls })
          .eq('id', product.id);
        
        if (updateError) throw updateError;
        setUploading(false);
      }

      // 4. Save Category associations
      if (selectedCategories.length > 0 && product) {
        const { error: catError } = await supabase
          .from('product_categories')
          .insert(selectedCategories.map(catId => ({
            product_id: product.id,
            category_id: catId
          })));
        if (catError) throw catError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created!');
      setIsAdding(false);
      setFormData({ name: '', slug: '', short_description: '', full_description: '', status: 'published', is_available: true, is_bestseller: false, images: [] });
      setSelectedCategories([]);
      setFiles([]);
    },
    onError: (err: any) => {
      toast.error('Error: ' + err.message);
      setUploading(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProduct) return;

      // 1. Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);
      
      if (productError) throw productError;

      // 2. Handle image updates if exist
      let currentImages = [...formData.images];
      
      if (files.length > 0) {
        setUploading(true);
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${editingProduct.id}-${Math.random()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('store-assets')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('store-assets')
            .getPublicUrl(filePath);

          currentImages.push(publicUrlData.publicUrl);

          // Sync with product_images (legacy support)
          await supabase
            .from('product_images')
            .insert([{
              product_id: editingProduct.id,
              url: publicUrlData.publicUrl,
              is_primary: currentImages.length === 1
            }]);
        }
        
        // Update product with all images
        await supabase
          .from('products')
          .update({ images: currentImages })
          .eq('id', editingProduct.id);

        setUploading(false);
      }

      // 3. Sync Categories
      // Delete old ones
      await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', editingProduct.id);

      // Insert new ones
      if (selectedCategories.length > 0) {
        const { error: catError } = await supabase
          .from('product_categories')
          .insert(selectedCategories.map(catId => ({
            product_id: editingProduct.id,
            category_id: catId
          })));
        if (catError) throw catError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated!');
      setEditingProduct(null);
      setFormData({ name: '', slug: '', short_description: '', full_description: '', status: 'published', is_available: true, is_bestseller: false, images: [] });
      setSelectedCategories([]);
      setFiles([]);
    },
    onError: (err: any) => {
      toast.error('Error updating: ' + err.message);
      setUploading(false);
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <SEO title="Admin Products" noindex={true} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => {
            if (editingProduct) {
              setEditingProduct(null);
              setFormData({ name: '', slug: '', short_description: '', full_description: '', status: 'published', is_available: true, is_bestseller: false, images: [] });
              setSelectedCategories([]);
            } else {
              setIsAdding(!isAdding);
            }
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          {isAdding || editingProduct ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Product</>}
        </button>
      </div>

      {(isAdding || editingProduct) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-medium mb-4">
            {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Product'}
          </h2>
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (editingProduct) updateMutation.mutate();
              else createMutation.mutate(); 
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    const newName = e.target.value;
                    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData(prev => ({
                      ...prev, 
                      name: newName,
                      slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === prev.slug || !prev.slug
                        ? newSlug 
                        : prev.slug
                    }));
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-mono text-xs uppercase tracking-wider">URL Slug</label>
                <input
                  required
                  type="text"
                  value={formData.slug}
                  placeholder="product-url-identifier"
                  onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border font-mono text-sm bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={e => setFormData({...formData, short_description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Description</label>
                <textarea
                  rows={4}
                  value={formData.full_description}
                  onChange={e => setFormData({...formData, full_description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  placeholder="Can use HTML tags like <br> or <strong>"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={e => setFormData({...formData, is_available: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-gray-700 cursor-pointer">
                  In Stock / Available for Order
                </label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_bestseller"
                  checked={formData.is_bestseller}
                  onChange={e => setFormData({...formData, is_bestseller: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="is_bestseller" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Bestseller Product
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Images
                    </label>
                    <p className="mt-1.5 text-xs text-gray-500 font-medium">
                      Hold <kbd className="bg-gray-100 px-1 rounded border">Ctrl</kbd> or <kbd className="bg-gray-100 px-1 rounded border">Shift</kbd> to select multiple!
                    </p>
                  </div>
                  {files.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 font-semibold bg-blue-50 px-2 py-1 rounded">
                        {files.length} new staged
                      </span>
                      <button 
                        type="button"
                        onClick={() => setFiles([])}
                        className="text-xs text-red-600 hover:text-red-700 font-bold uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {categories?.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || uploading}
                className="bg-gray-900 text-white px-4 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-70"
              >
                {createMutation.isPending || updateMutation.isPending || uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products?.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {product.product_images?.[0]?.url ? (
                            <img className="h-10 w-10 object-cover" src={product.product_images[0].url} alt="" />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku || 'No SKU'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!!product.is_bestseller && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        Bestseller
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                         setFormData({
                          name: product.name,
                          slug: product.slug || '',
                          short_description: product.short_description || '',
                          full_description: product.full_description || '',
                          status: product.status,
                          is_available: product.is_available,
                          is_bestseller: !!product.is_bestseller,
                          images: product.images || [],
                        });
                        setSelectedCategories(product.product_categories?.map((pc: any) => pc.category_id) || []);
                        setIsAdding(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
