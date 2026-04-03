import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getVerifiedBuyerChats } from '../lib/api';
import { Trash2, Loader2, Plus, X, AlertTriangle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { VerifiedBuyerChat } from '../lib/types';

export default function AdminVerifiedChats() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: chats, isLoading } = useQuery<VerifiedBuyerChat[]>({
    queryKey: ['admin-verified-buyer-chats'],
    queryFn: getVerifiedBuyerChats
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const itemToDelete = chats?.find((m: VerifiedBuyerChat) => m.id === id);
      if (!itemToDelete) throw new Error('Item not found');

      // 1. Delete from Storage
      const urlParts = itemToDelete.url.split('/storage/v1/object/public/store-assets/');
      if (urlParts.length > 1) {
        const path = urlParts[1];
        await supabase.storage.from('store-assets').remove([path]);
      }

      // 2. Delete from Database
      const { error } = await supabase
        .from('verified_buyer_chats')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verified-buyer-chats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verified-buyer-chats'] });
      toast.success('Chat screenshot deleted');
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
        const fileName = `verified-chats/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: storageError } = await supabase.storage
          .from('store-assets')
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('store-assets')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('verified_buyer_chats')
          .insert([
            {
              url: publicUrl,
              display_order: (chats?.length || 0) + i,
              caption: ''
            }
          ]);

        if (dbError) throw dbError;
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      queryClient.invalidateQueries({ queryKey: ['verified-buyer-chats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verified-buyer-chats'] });
      toast.success('Chat screenshots uploaded');
    } catch (error: Error | unknown) {
      toast.error(`Upload failed: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const updateCaption = async (id: string, caption: string) => {
    const { error } = await supabase
      .from('verified_buyer_chats')
      .update({ caption })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update caption');
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-buyer-chats'] });
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
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Verified Buyer Chats
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload screenshots of satisfied customer chats to build trust</p>
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
              Add Screenshots
            </>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chats?.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="aspect-[3/4] relative bg-gray-50 flex items-center justify-center overflow-hidden">
              <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
            </div>
            
            <div className="p-3 space-y-2">
              <input 
                type="text"
                id={`caption-${item.id}`}
                defaultValue={item.caption || ''}
                placeholder="Add a customer name or note..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 italic text-gray-600"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const input = document.getElementById(`caption-${item.id}`) as HTMLInputElement;
                    if (input) updateCaption(item.id, input.value);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save
                </button>

                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!chats || chats.length === 0) && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No screenshots uploaded yet</p>
            <p className="text-gray-400 text-sm">Customer satisfaction proof will appear here</p>
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
                <h3 className="text-lg font-bold text-gray-900">Delete Screenshot</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this chat screenshot?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
