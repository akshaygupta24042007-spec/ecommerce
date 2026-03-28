import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getBehindTheScenes } from '../lib/api';
import { Video, Trash2, Loader2, Plus, Image as ImageIcon, RefreshCw, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BehindTheScene } from '../lib/types';

export default function AdminBehindTheScenes() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { data: media, isLoading } = useQuery<BehindTheScene[]>({
    queryKey: ['admin-behind-the-scenes'],
    queryFn: getBehindTheScenes
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast.error(`Error deleting: ${error.message}`);
      setDeleteConfirmId(null);
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

        const { data: _storageData, error: storageError } = await supabase.storage
          .from('behind-the-scenes')
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('behind-the-scenes')
          .getPublicUrl(fileName);

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
    } catch (error: Error | unknown) {
      toast.error(`Upload failed: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const itemToReplace = media?.find((m: BehindTheScene) => m.id === itemId);
    if (!itemToReplace) return;

    setReplacingId(itemId);

    try {
      // 1. Delete old file from Storage
      const oldPath = itemToReplace.url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('behind-the-scenes').remove([oldPath]);
      }

      // 2. Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const newType = file.type.startsWith('video/') ? 'video' : 'image';

      const { error: storageError } = await supabase.storage
        .from('behind-the-scenes')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 3. Get new Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('behind-the-scenes')
        .getPublicUrl(fileName);

      // 4. Update database record
      const { error: dbError } = await supabase
        .from('behind_the_scenes')
        .update({
          url: publicUrl,
          type: newType
        })
        .eq('id', itemId);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['behind-the-scenes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-behind-the-scenes'] });
      toast.success('Media replaced successfully');
    } catch (error: Error | unknown) {
      toast.error(`Replace failed: ${(error as Error).message}`);
    } finally {
      setReplacingId(null);
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
      toast.success('Caption updated');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            Behind the Scenes Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload, edit, or delete images and videos for your store's gallery</p>
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

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {media?.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            {/* Media Preview */}
            <div className="aspect-[4/5] relative bg-gray-50 flex items-center justify-center">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
              ) : (
                <video 
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              )}

              {/* Replacing overlay */}
              {replacingId === item.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">Replacing...</p>
                  </div>
                </div>
              )}

              {/* Type badge */}
              <div className="absolute top-2 left-2">
                <span className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold shadow-sm
                  ${item.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}
                `}>
                  {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  {item.type === 'video' ? 'Video' : 'Image'}
                </span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="p-3 space-y-3">
              {/* Caption input */}
              <input 
                type="text"
                defaultValue={item.caption || ''}
                placeholder="Add a caption..."
                onBlur={(e) => updateCaption(item.id, e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 italic text-gray-600"
              />

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Replace Button */}
                <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-amber-200">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                  <input
                    ref={replaceInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleReplaceFile(e, item.id)}
                  />
                </label>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Media</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this media? It will be permanently removed from both storage and the gallery.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <X className="w-4 h-4" />
                  Cancel
                </span>
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-1.5">
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
