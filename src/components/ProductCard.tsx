import { Link } from 'react-router-dom';
import type { Product, StoreSettings } from '../lib/types';
import { createWhatsAppLink } from '../utils/orderLinks';
import { MessageCircle, Instagram } from 'lucide-react';

export function ProductCard({ product, settings }: { product: Product, settings?: StoreSettings }) {
  const primaryImage = product.images?.[0]
    || product.product_images?.find(img => img.is_primary)?.url 
    || product.product_images?.[0]?.url 
    || 'https://via.placeholder.com/300?text=No+Image';


  const questionMessage = `I want to know more about this product: ${product.name}\n${window.location.origin}/product/${product.slug || product.id}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 group">
      <Link to={`/product/${product.slug || product.id}`}>
        <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
          <img 
            src={primaryImage} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-gray-50 ${!product.is_available ? 'opacity-60 grayscale' : ''}`}
            width={400}
            height={400}
          />
          {!product.is_available && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Out of Stock
              </span>
            </div>
          )}
          {product.is_available && product.is_bestseller && (
            <div className="absolute top-2 left-2">
              <span className="bg-orange-500 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight shadow-sm">
                Bestseller
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 sm:p-4">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{product.name}</h3>
        </Link>
        {product.short_description && (
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">{product.short_description}</p>
        )}
        <div className="mt-3 space-y-2">
          <Link 
            to={`/product/${product.slug || product.id}`}
            className="block w-full text-center py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: settings?.theme_color || '#2563eb' }}
          >
            View Product
          </Link>

          {/* Ask a Question buttons */}
          <div className="flex gap-2">
            {settings?.whatsapp_number && (
              <a
                href={createWhatsAppLink(settings.whatsapp_number, questionMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Ask on WhatsApp</span>
              </a>
            )}
            {settings?.instagram_username && (
              <a
                href={`https://www.instagram.com/${settings.instagram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Ask on Instagram</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
