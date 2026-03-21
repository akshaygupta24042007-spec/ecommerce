import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Blog } from '../lib/types';

export default function AdminBlogs() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    image: '',
    alt_text: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Blog[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = '';

      if (file) {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `blogs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: blogError } = await supabase
        .from('blogs')
        .insert([{ ...formData, image: imageUrl || formData.image }]);
      
      if (blogError) throw blogError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog created!');
      setIsAdding(false);
      setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', image: '', alt_text: '' });
      setFile(null);
      setUploading(false);
    },
    onError: (err: any) => {
      toast.error('Error: ' + err.message);
      setUploading(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingBlog) return;

      let imageUrl = formData.image;
      
      if (file) {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `blog-${editingBlog.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `blogs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('blogs')
        .update({
          ...formData,
          image: imageUrl
        })
        .eq('id', editingBlog.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog updated!');
      setEditingBlog(null);
      setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', image: '', alt_text: '' });
      setFile(null);
      setUploading(false);
    },
    onError: (err: any) => {
      toast.error('Error updating: ' + err.message);
      setUploading(false);
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Blog deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <button
          onClick={() => {
            if (editingBlog) {
              setEditingBlog(null);
              setFormData({ title: '', slug: '', content: '', meta_title: '', meta_description: '', image: '', alt_text: '' });
              setFile(null);
            } else {
              setIsAdding(!isAdding);
            }
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          {isAdding || editingBlog ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Blog</>}
        </button>
      </div>

      {(isAdding || editingBlog) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-medium mb-4">
            {editingBlog ? `Edit Blog` : 'Add New Blog'}
          </h2>
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (editingBlog) updateMutation.mutate();
              else createMutation.mutate(); 
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => {
                    const newTitle = e.target.value;
                    const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData(prev => ({
                      ...prev, 
                      title: newTitle,
                      slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === prev.slug || !prev.slug
                        ? newSlug 
                        : prev.slug
                    }));
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 font-mono text-xs uppercase tracking-wider">URL Slug</label>
                <input
                  required
                  type="text"
                  value={formData.slug}
                  placeholder="blog-url-identifier"
                  onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border font-mono text-sm bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  placeholder="Support for plain text or basic HTML..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={e => setFormData({...formData, meta_title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <input
                  type="text"
                  value={formData.meta_description}
                  onChange={e => setFormData({...formData, meta_description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                
                {formData.image && !file && (
                  <div className="mb-4 relative group w-48 rounded-lg overflow-hidden border">
                    <img src={formData.image} alt="" className="w-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {formData.image ? 'Change Image' : 'Upload Image'}
                    </label>
                  </div>
                  {file && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 font-semibold bg-blue-50 px-2 py-1 rounded">
                        {file.name}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-xs text-red-600 hover:text-red-700 font-bold uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alt Text for Image</label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={e => setFormData({...formData, alt_text: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || uploading}
                className="bg-gray-900 text-white px-4 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-70"
              >
                {createMutation.isPending || updateMutation.isPending || uploading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Save Blog'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog Post</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs?.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {blog.image ? (
                            <img className="h-10 w-10 object-cover" src={blog.image} alt={blog.alt_text || ''} />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4 truncate max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{blog.title}</div>
                        <div className="text-sm text-gray-500 truncate">/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(blog.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        setEditingBlog(blog);
                        setFormData({
                          title: blog.title,
                          slug: blog.slug,
                          content: blog.content || '',
                          meta_title: blog.meta_title || '',
                          meta_description: blog.meta_description || '',
                          image: blog.image || '',
                          alt_text: blog.alt_text || ''
                        });
                        setIsAdding(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(blog.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {blogs?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No blogs found. Click "Add Blog" to create one.
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
