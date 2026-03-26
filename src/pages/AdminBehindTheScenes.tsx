import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Image as ImageIcon, Video, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { getBehindTheScenes } from '../lib/api';
import type { BehindTheScene } from '../lib/types';

export default function AdminBehindTheScenes() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    display_order: 0,
    type: 'image' as 'image' | 'video',
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-behind-the-scenes'],
    queryFn: getBehindTheScenes
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a file');

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `behind-the-scenes/${fileName}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('behind-the-scenes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('behind-the-scenes')
        .getPublicUrl(filePath);

      // 3. Insert record
      const { error: dbError } = await supabase
        .from('behind_the_scenes')
        .insert([{
          url: publicUrlData.publicUrl,
          type: formData.type,
          caption: formData.caption || null,
          display_order: formData.display_order
        }]);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-behind-the-scenes'] });
      toast.success('Uploaded successfully!');
      setIsAdding(false);
      setFile(null);
      setFormData({ caption: '', display_order: 0, type: 'image' });
      setUploading(false);
    },
    onError: (err: any) => {
      toast.error('Error: ' + err.message);
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: BehindTheScene) => {
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from('behind_the_scenes')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;

      // 2. Delete from storage (extract path from URL)
      const path = item.url.split('/').pop();
      if (path) {
        await supabase.storage
          .from('behind-the-scenes')
          .remove([`behind-the-scenes/${path}`]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-behind-the-scenes'] });
      toast.success('Deleted successfully');
    },
    onError: (err: any) => {
      toast.error('Error: ' + err.message);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-detect type
      if (selectedFile.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, type: 'video' }));
      } else if (selectedFile.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, type: 'image' }));
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <SEO title="Admin Behind the Scenes" noindex={true} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Behind the Scenes</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Item</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-medium mb-4">Add New Media</h2>
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              uploadMutation.mutate(); 
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">File (Image or Video)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="media-upload"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="media-upload"
                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {file ? (
                      <div className="flex flex-col items-center">
                        {formData.type === 'video' ? <Video className="w-8 h-8 text-blue-500" /> : <ImageIcon className="w-8 h-8 text-blue-500" />}
                        <span className="mt-2 text-sm text-gray-900 font-medium">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); setFile(null); }}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 font-bold"
                        >
                          Change File
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">Click to upload image or video</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as 'image' | 'video'})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Caption (Optional)</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={e => setFormData({...formData, caption: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  placeholder="Behind the scenes at the factory..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={uploading || !file}
                className="bg-gray-900 text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Media'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items?.map((item) => (
            <div key={item.id} className="relative group bg-white rounded-xl overflow-hidden shadow-sm border group">
              <div className="aspect-square overflow-hidden bg-gray-100">
                {item.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Video className="w-10 h-10 text-white shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{item.caption || 'No caption'}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{item.type} • Order: {item.display_order}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this item?')) {
                    deleteMutation.mutate(item);
                  }
                }}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items?.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
              No items yet. Click "Add Item" to start uploading.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
