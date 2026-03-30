import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Category } from '../lib/types';
import { Plus, Pencil, Trash2, GripVertical, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [editParentId, setEditParentId] = useState('');

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
      let slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check for duplicate slug
      const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
      if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const { error } = await supabase.from('categories').insert({
        name: newName.trim(),
        slug: slug,
        icon: newIcon.trim() || null,
        display_order: maxOrder + 1,
        parent_id: newParentId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setNewIcon('');
      setNewParentId('');
      setIsAdding(false);
      toast.success('Category created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      let newSlug = editSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (newSlug) {
        const { data: existing } = await supabase.from('categories').select('id').eq('slug', newSlug).neq('id', id).maybeSingle();
        if (existing) {
          newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }
      }

      const { error } = await supabase
        .from('categories')
        .update({ 
          name: editName.trim(), 
          icon: editIcon.trim() || null,
          slug: newSlug || null,
          parent_id: editParentId || null
        })
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
    setEditSlug(cat.slug || '');
    setEditParentId(cat.parent_id || '');
  };

  return (
    <div className="p-6 max-w-2xl">
      <SEO title="Admin Categories" noindex={true} />
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
            className="w-16 border rounded-md px-2 py-1.5 text-center text-lg shadow-sm"
          />
          <input
            placeholder="Category name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 border rounded-md px-3 py-1.5 shadow-sm"
            autoFocus
          />
          <div className="flex flex-col relative group/select">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute -top-5 left-1">Parent Category</span>
            <select
              value={newParentId}
              onChange={e => setNewParentId(e.target.value)}
              className="w-48 border rounded-md px-2 py-1.5 shadow-sm text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">-- Make Top Level --</option>
              {categories?.filter(c => !c.parent_id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => newName.trim() && addMutation.mutate()}
            disabled={addMutation.isPending}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition shadow-sm"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewName(''); setNewIcon(''); setNewParentId(''); }}
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
            <div key={cat.id} className="bg-white border rounded-lg px-4 py-3 flex flex-col gap-2 group hover:shadow-md transition">
              <div className="flex items-center gap-3 w-full">
                <GripVertical className="w-4 h-4 text-gray-300" />
                
                {editingId === cat.id ? (
                  <div className="flex-1 flex flex-col gap-3 p-1">
                    <div className="flex items-center gap-3">
                      <input
                        value={editIcon}
                        onChange={e => setEditIcon(e.target.value)}
                        className="w-12 border rounded-md px-2 py-1 text-center text-lg bg-gray-50"
                        placeholder="Icon"
                      />
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 border rounded-md px-3 py-1 font-medium"
                        placeholder="Category Name"
                        autoFocus
                      />
                      <div className="flex flex-col relative group/select">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute -top-4 left-1">Parent Category</span>
                        <select
                          value={editParentId}
                          onChange={e => setEditParentId(e.target.value)}
                          className="w-40 border rounded-md px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                        >
                          <option value="">-- Make Top Level --</option>
                          {categories?.filter(c => !c.parent_id && c.id !== cat.id).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider">URL Slug</label>
                      <input
                        value={editSlug}
                        onChange={e => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                        className="w-full border rounded-md px-3 py-1 text-sm font-mono bg-gray-50 text-gray-600"
                        placeholder="category-slug"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => updateMutation.mutate({ id: cat.id })}
                        className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-lg w-8 text-center">{cat.icon || '📁'}</span>
                    <div className="flex-1 flex flex-col">
                      <span className="font-bold text-gray-900 leading-tight">
                        {cat.parent_id ? <span className="text-gray-400 font-normal mr-2">↳</span> : null}
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter mt-0.5">slug: {cat.slug || 'none'} {cat.parent_id ? `| parent: ${categories?.find(c => c.id === cat.parent_id)?.name}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition shadow-sm bg-white border border-gray-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            deleteMutation.mutate(cat.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition shadow-sm bg-white border border-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
