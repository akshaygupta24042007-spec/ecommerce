import { useState, useEffect } from 'react';
import { useCartStore } from '../lib/store';
import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '../lib/api';
import { X, Trash2, Plus, Minus, MessageCircle, Instagram } from 'lucide-react';
import { generateCartOrderMessage, createWhatsAppLink, createInstagramLink } from '../utils/orderLinks';
import toast from 'react-hot-toast';

function CartItemRow({ item }: { item: any }) {
  const { removeItem, updateQuantity } = useCartStore();
  const [localQuantity, setLocalQuantity] = useState<number | string>(item.quantity);
  const image = item.product.product_images?.[0]?.url || 'https://via.placeholder.com/150';

  // Sync local state with store if item in store changes (e.g. from elsewhere)
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity, setLocalQuantity]);

  const handleUpdate = (val: number | string) => {
    setLocalQuantity(val);
    const num = parseInt(val.toString());
    if (!isNaN(num) && num >= 1) {
      updateQuantity(item.cartItemId, num);
    }
  };

  const handleBlur = () => {
    const num = parseInt(localQuantity.toString());
    if (isNaN(num) || num < 1) {
      setLocalQuantity(item.quantity);
    }
  };

  return (
    <div className="flex gap-4">
      <img src={image} alt={item.product.name} className="w-20 h-20 object-cover rounded-md border" />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
        {item.variant && <p className="text-sm text-gray-500">{item.variant.variant_group}: {item.variant.name}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 border rounded-md overflow-hidden h-8">
            <button 
              onClick={() => handleUpdate(item.quantity - 1)} 
              className="px-2 h-full hover:bg-gray-50 text-gray-500 border-r"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input 
              type="number"
              value={localQuantity}
              onChange={(e) => handleUpdate(e.target.value)}
              onBlur={handleBlur}
              className="w-10 text-center text-sm font-bold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
            />
            <button 
              onClick={() => handleUpdate(item.quantity + 1)} 
              className="px-2 h-full hover:bg-gray-50 text-gray-500 border-l"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="font-medium">
          </div>
        </div>
      </div>
      <button onClick={() => removeItem(item.cartItemId)} className="text-gray-400 hover:text-red-500 transition-colors self-start p-1">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Cart() {
  const { items, isOpen, setIsOpen, clearCart } = useCartStore();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });

  if (!isOpen) return null;


  const handleWhatsAppCheckout = () => {
    if (!settings?.whatsapp_number) return toast.error('Store WhatsApp not configured');
    if (items.length === 0) return;

    const message = generateCartOrderMessage(items, settings.order_message_prefix || undefined, settings.order_message_suffix || undefined);
    window.open(createWhatsAppLink(settings.whatsapp_number, message), '_blank');
    clearCart();
    setIsOpen(false);
  };

  const handleInstagramCheckout = () => {
    if (!settings?.instagram_username) return toast.error('Store Instagram not configured');
    if (items.length === 0) return;

    const message = generateCartOrderMessage(items, settings.order_message_prefix || undefined, settings.order_message_suffix || undefined);
    navigator.clipboard.writeText(message).then(() => {
      toast.success('Order details copied! Paste in the chat.');
      setTimeout(() => {
        window.open(createInstagramLink(settings.instagram_username!), '_blank');
      }, 1500);
    });
    clearCart();
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="px-4 py-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.cartItemId} item={item} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 pb-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
            </div>
            
            <div className="space-y-3">
              {settings?.whatsapp_enabled !== false && (
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Checkout on WhatsApp
                </button>
              )}
              {settings?.instagram_enabled !== false && (
                <button
                  onClick={handleInstagramCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white py-3 px-4 rounded-lg font-semibold transition-opacity shadow-sm"
                >
                  <Instagram className="w-5 h-5" />
                  Checkout on Instagram
                </button>
              )}
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              Delivery and payment details will be discussed in the chat.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
