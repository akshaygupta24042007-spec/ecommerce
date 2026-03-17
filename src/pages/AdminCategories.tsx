import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Category } from '../lib/types';
import { Plus, Pencil, Trash2, GripVertical, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const maxOrder = categories?.length ? Math.max(...categories.map(c => c.display_order || 0)) : 0;
      const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error } = await supabase.from('categories').insert({
        name: newName.trim(),
        slug,
        icon: newIcon.trim() || null,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setNewIcon('');
      setIsAdding(false);
      toast.success('Category created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name: editName.trim(), icon: editIcon.trim() || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      toast.success('Category updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon || '');
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add New Category */}
      {isAdding && (
        <div className="bg-white border rounded-lg p-4 mb-4 flex items-center gap-3">
          <input
            placeholder="Emoji icon"
            value={newIcon}
            onChange={e => setNewIcon(e.target.value)}
            className="w-16 border rounded-md px-2 py-1.5 text-center text-lg"
          />
          <input
            placeholder="Category name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 border rounded-md px-3 py-1.5"
            autoFocus
          />
          <button
            onClick={() => newName.trim() && addMutation.mutate()}
            disabled={addMutation.isPending}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewName(''); setNewIcon(''); }}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Category List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-lg h-14 border" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No categories yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories?.map(cat => (
            <div key={cat.id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3 group hover:shadow-sm transition">
              <GripVertical className="w-4 h-4 text-gray-300" />
              
              {editingId === cat.id ? (
                <>
                  <input
                    value={editIcon}
                    onChange={e => setEditIcon(e.target.value)}
                    className="w-12 border rounded-md px-2 py-1 text-center text-lg"
                  />
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 border rounded-md px-3 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => updateMutation.mutate({ id: cat.id })}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-lg w-8 text-center">{cat.icon || '📁'}</span>
                  <span className="flex-1 font-medium text-gray-900">{cat.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name}"?`)) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
