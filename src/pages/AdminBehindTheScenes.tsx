import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getBehindTheScenes } from '../lib/api';
import { Video, Trash2, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BehindTheScene } from '../lib/types';

export default function AdminBehindTheScenes() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: media, isLoading } = useQuery<BehindTheScene[]>({
    queryKey: ['admin-behind-the-scenes'],
    queryFn: getBehindTheScenes
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Find the item first to get the URL
      const itemToDelete = media?.find((m: BehindTheScene) => m.id === id);
      if (!itemToDelete) throw new Error('Item not found');

      // 1. Delete from Storage
      const path = itemToDelete.url.split('/').pop();
      if (path) {
        await supabase.storage.from('behind-the-scenes').remove([path]);
      }

      // 2. Delete from Database
      const { error } = await supabase
        .from('behind_the_scenes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behind-the-scenes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-behind-the-scenes'] });
      toast.success('Media deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting: ${error.message}`);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const type = file.type.startsWith('video/') ? 'video' : 'image';

        // 1. Upload to Storage
        const { data: _storageData, error: storageError } = await supabase.storage
          .from('behind-the-scenes')
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('behind-the-scenes')
          .getPublicUrl(fileName);

        // 3. Insert into Database
        const { error: dbError } = await supabase
          .from('behind_the_scenes')
          .insert([
            {
              url: publicUrl,
              type,
              display_order: (media?.length || 0) + i,
              caption: ''
            }
          ]);

        if (dbError) throw dbError;
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      queryClient.invalidateQueries({ queryKey: ['behind-the-scenes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-behind-the-scenes'] });
      toast.success('Media uploaded successfully');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const updateCaption = async (id: string, caption: string) => {
    const { error } = await supabase
      .from('behind_the_scenes')
      .update({ caption })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update caption');
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-behind-the-scenes'] });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            Behind the Scenes Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload images and videos for your store's gallery</p>
        </div>
        
        <label className={`
          flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer h-12
          ${isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'}
        `}>
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading {uploadProgress}%
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Media
            </>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,video/*" 
            multiple 
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {media?.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
            <div className="aspect-[4/5] relative bg-gray-50 flex items-center justify-center">
              {item.type === 'image' ? (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video 
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  muted
                  preload="metadata"
                  crossOrigin="anonymous"
                >
                  <source src={item.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3">
              <input 
                type="text"
                defaultValue={item.caption || ''}
                placeholder="Add a caption..."
                onBlur={(e) => updateCaption(item.id, e.target.value)}
                className="w-full text-xs bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-blue-500 p-2 italic text-gray-600"
              />
            </div>
          </div>
        ))}

        {(!media || media.length === 0) && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No media uploaded yet</p>
            <p className="text-gray-400 text-sm">Upload images or videos to show your process</p>
          </div>
        )}
      </div>
    </div>
  );
}
