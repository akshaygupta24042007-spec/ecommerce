import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getStoreSettings } from '../lib/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ 
    queryKey: ['settings'], 
    queryFn: getStoreSettings 
  });

  const [formData, setFormData] = useState({
    store_name: '',
    store_tagline: '',
    contact_email: '',
    whatsapp_number: '',
    instagram_username: '',
    theme_color: '#2563eb',
    currency_symbol: '₹',
    whatsapp_enabled: true,
    instagram_enabled: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name || '',
        store_tagline: settings.store_tagline || '',
        contact_email: settings.contact_email || '',
        whatsapp_number: settings.whatsapp_number || '',
        instagram_username: settings.instagram_username || '',
        theme_color: settings.theme_color || '#2563eb',
        currency_symbol: settings.currency_symbol || '₹',
        whatsapp_enabled: settings.whatsapp_enabled ?? true,
        instagram_enabled: settings.instagram_enabled ?? true,
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (newSettings: typeof formData) => {
      const { error } = await supabase
        .from('store_settings')
        .update(newSettings)
        .eq('id', '5d8d96f5-5981-48ed-bebd-0b2ad04bf1f0');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (err: any) => {
      toast.error('Failed to update settings: ' + err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <SEO title="Admin Settings" noindex={true} />
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 shadow-sm border rounded-lg">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">General Information</h3>
          <p className="mt-1 text-sm text-gray-500">Basic details about your storefront.</p>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700">Store Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="store_name"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Tagline</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="store_tagline"
                  value={formData.store_tagline}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Currency Symbol</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="currency_symbol"
                  value={formData.currency_symbol}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Theme Color</label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  name="theme_color"
                  value={formData.theme_color}
                  onChange={handleChange}
                  className="h-9 w-9 border-0 p-0 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">{formData.theme_color}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Communication Channels</h3>
            <p className="mt-1 text-sm text-gray-500">How customers will reach out to you.</p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4 mt-2">
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  name="contact_email"
                  placeholder="hello@yourstore.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Customers can use this email to reach you for inquiries.</p>
            </div>

            <div className="sm:col-span-4 mt-4">
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="whatsapp_number"
                  placeholder="+919876543210"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Include country code (e.g. +91)</p>
            </div>

            <div className="sm:col-span-6 flex items-center">
              <input
                id="whatsapp_enabled"
                name="whatsapp_enabled"
                type="checkbox"
                checked={formData.whatsapp_enabled}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="whatsapp_enabled" className="ml-2 block text-sm text-gray-900">
                Enable WhatsApp Orders
              </label>
            </div>

            <div className="sm:col-span-4 mt-4">
              <label className="block text-sm font-medium text-gray-700">Instagram Username</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  @
                </span>
                <input
                  type="text"
                  name="instagram_username"
                  value={formData.instagram_username}
                  onChange={handleChange}
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 border"
                />
              </div>
            </div>

            <div className="sm:col-span-6 flex items-center">
              <input
                id="instagram_enabled"
                name="instagram_enabled"
                type="checkbox"
                checked={formData.instagram_enabled}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="instagram_enabled" className="ml-2 block text-sm text-gray-900">
                Enable Instagram Orders
              </label>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="ml-3 inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {mutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
