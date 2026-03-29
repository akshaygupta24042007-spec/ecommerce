import { useState } from 'react';
import { useParams, Link, useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getStoreSettings, getRelatedProducts } from '../lib/api';
import { useCartStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';
import { ChevronLeft, ChevronRight, Share2, ShoppingCart, CheckCircle2, Ruler, Maximize2, X, Minus, Plus, MessageCircle, Instagram } from 'lucide-react';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { createWhatsAppLink } from '../utils/orderLinks';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import type { Product } from '../lib/types';

export async function productLoader({ params }: any) {
  if (!params.id) return null;
  const product = await getProduct(params.id);
  return product || null;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const initialProduct = useLoaderData() as Product | null;
  
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [quantity, setQuantity] = useState<number | string>(1);
  const { items, addItem } = useCartStore();

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
    initialData: initialProduct || undefined,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getStoreSettings,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.id],
    queryFn: () => getRelatedProducts(product!.id),
    enabled: !!product,
  });

  if (isLoadingProduct) {
    return <div className="p-8 text-center animate-pulse">Loading product...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Product not found</div>;
  }

  const isInCart = items.some(item => {
    const variantId = selectedVariant || 'default';
    return item.cartItemId === `${product.id}-${variantId}`;
  });

  const images = (product.images && product.images.length > 0)
    ? product.images.map((url, i) => ({ id: `img-${i}`, url, display_order: i, is_primary: i === 0 }))
    : (product.product_images && product.product_images.length > 0)
      ? [...product.product_images].sort((a, b) => a.display_order - b.display_order)
      : [{ id: 'fallback', url: 'https://via.placeholder.com/600', display_order: 0, is_primary: true }];

  const handleAddToCart = () => {
    if (product.product_variants?.length && !selectedVariant) {
      return toast.error('Please select a variant before adding to cart');
    }
    const variant = selectedVariant 
      ? product.product_variants?.find(v => v.id === selectedVariant) 
      : undefined;
      
    const finalQuantity = Math.max(1, parseInt(quantity.toString()) || 1);
    addItem(product, variant, finalQuantity);
    toast.success(`Added ${finalQuantity} ${finalQuantity > 1 ? 'items' : 'item'} to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <SEO 
        title={settings ? `${product.name} | ${settings.store_name}` : product.name} 
        description={product.short_description || `Order ${product.name} directly from Hiya Wear.`} 
        path={`/product/${id}`}
        image={images[0]?.url}
        product={{
          name: product.name,
          description: product.short_description || `Order ${product.name} directly from Hiya Wear.`,
          image: images[0]?.url || '',
          availability: product.is_available,
          url: `https://www.hiyawear.com/product/${id}`
        }}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.hiyawear.com' },
          { name: 'Shop', url: 'https://www.hiyawear.com/search' },
          { name: product.name, url: `https://www.hiyawear.com/product/${id}` }
        ]}
      />
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm group relative">
            <img 
              src={images[currentImageIdx]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
              alt={product.name}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105 origin-center"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <div className="absolute inset-0 z-10 flex items-center justify-between px-2 transition-opacity pointer-events-none">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm transition-all pointer-events-auto"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm transition-all pointer-events-auto"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
               <Maximize2 className="w-5 h-5 text-gray-700" />
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIdx === idx ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img 
                    src={img.url} 
                    alt={`${product.name} ${idx + 1}`} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            <button onClick={handleShare} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          
          {product.short_description && (
            <p className="mt-2 text-base text-gray-600 leading-relaxed">
              {product.short_description}
            </p>
          )}
          
          <div className="mt-4 flex flex-col gap-1 border-b pb-6">
            <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${product.is_available ? 'text-emerald-600' : 'text-red-500'}`}>
              {product.is_available ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  In Stock - Ready to ship
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  Out of Stock - Currently unavailable
                </>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="mt-6 border-b pb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900 block">
                  Select {product.product_variants[0].variant_group}
                </h3>
                {product.product_variants[0].variant_group.toLowerCase().includes('size') && (
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Ruler className="w-4 h-4" />
                    Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.product_variants.map(variant => {
                  const isColor = variant.variant_group.toLowerCase().includes('color') || variant.variant_group.toLowerCase().includes('colour');
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`relative overflow-hidden transition-all ${
                        isColor 
                          ? `w-12 h-12 rounded-full border-2 ${selectedVariant === variant.id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'}`
                          : `px-5 py-2.5 rounded-lg border-2 text-sm font-semibold ${
                              selectedVariant === variant.id
                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`
                      }`}
                      style={isColor ? { backgroundColor: variant.name.toLowerCase().replace(' ', '') } : {}}
                      title={variant.name}
                    >
                      {!isColor && variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Actions */}
          <div className="mt-8 space-y-4">
            <div className={`flex items-center gap-4 ${isInCart ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden h-[54px]">
                <button 
                  onClick={() => {
                    const num = parseInt(quantity.toString()) || 1;
                    setQuantity(Math.max(1, num - 1));
                  }}
                  className="px-4 h-full hover:bg-gray-50 transition-colors text-gray-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={() => {
                    const num = parseInt(quantity.toString());
                    if (isNaN(num) || num < 1) setQuantity(1);
                  }}
                  className="w-16 text-center font-bold text-gray-900 border-x-2 border-gray-200 h-full focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                />
                <button 
                  onClick={() => {
                    const num = parseInt(quantity.toString()) || 1;
                    setQuantity(num + 1);
                  }}
                  className="px-4 h-full hover:bg-gray-50 transition-colors text-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.is_available || isInCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-semibold text-lg transition-all shadow-sm h-[54px] ${
                  isInCart 
                    ? 'bg-emerald-600 text-white cursor-default' 
                    : product.is_available 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white cursor-pointer' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed grayscale'
                }`}
              >
                {isInCart ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 scroll-m-20" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {product.is_available ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </button>
            </div>

            {/* Inquiry Actions */}
            {product.is_available && (
              <div className="space-y-3">
                {settings?.whatsapp_number && (
                  <a
                    href={createWhatsAppLink(
                      settings.whatsapp_number, 
                      `Hello, I'm interested in the price of ${product.name}.\nCan you please share the details?\nLink: ${window.location.href}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-lg bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Ask Price on WhatsApp
                  </a>
                )}
                
                <div className="flex gap-3">
                  {settings?.whatsapp_number && (
                    <a
                      href={createWhatsAppLink(
                        settings.whatsapp_number, 
                        `I want to know more about this product: ${product.name}\n${window.location.href}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      General Inquiry
                    </a>
                  )}
                  {settings?.instagram_username && (
                    <a
                      href={`https://www.instagram.com/${settings.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {product.full_description && (
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-3 mb-4">Description</h3>
              <div 
                className="prose prose-sm text-gray-600 max-w-none"
                dangerouslySetInnerHTML={{ __html: product.full_description }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 pb-20 lg:pb-8 border-t pt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">You might also like</h2>
              <p className="text-gray-500 mt-1">Similar products in this category</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rp => (
              <ProductCard key={rp.id} product={rp} settings={settings} />
            ))}
          </div>
        </div>
      )}
      
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
