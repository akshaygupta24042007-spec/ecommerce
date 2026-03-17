import { X, MessageCircle, Instagram } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '../lib/api';
import { createWhatsAppLink, createInstagramLink } from '../utils/orderLinks';
import toast from 'react-hot-toast';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function OrderModal({ isOpen, onClose, message = 'Hello! I would like to place an order.' }: OrderModalProps) {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });

  if (!isOpen) return null;

  const handleWhatsApp = () => {
    if (!settings?.whatsapp_number) return toast.error('Store WhatsApp not configured');
    window.open(createWhatsAppLink(settings.whatsapp_number, message), '_blank');
    onClose();
  };

  const handleInstagram = () => {
    if (!settings?.instagram_username) return toast.error('Store Instagram not configured');
    navigator.clipboard.writeText(message).then(() => {
      toast.success('Message copied! Paste in the chat.');
      setTimeout(() => {
        window.open(createInstagramLink(settings.instagram_username!), '_blank');
        onClose();
      }, 1500);
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative pointer-events-auto animate-in fade-in zoom-in duration-200">
          <button onClick={onClose} className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center mb-6 mt-2">
            <h2 className="text-xl font-bold text-gray-900">Choose Order Method</h2>
            <p className="text-sm text-gray-500 mt-1">How would you like to place your order?</p>
          </div>
          
          <div className="space-y-3">
            {settings?.whatsapp_number && (
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-lg font-semibold transition-colors shadow-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Order via WhatsApp
              </button>
            )}
            {settings?.instagram_username && (
              <button
                onClick={handleInstagram}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white py-3.5 px-4 rounded-lg font-semibold transition-opacity shadow-sm"
              >
                <Instagram className="w-5 h-5" />
                Order via Instagram
              </button>
            )}
            
            {!settings?.whatsapp_number && !settings?.instagram_username && (
              <p className="text-red-500 text-sm text-center font-medium">No ordering methods currently enabled.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
