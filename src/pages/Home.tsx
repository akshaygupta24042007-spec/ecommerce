import { useQuery } from '@tanstack/react-query';
import { getStoreSettings, getProducts, getCategories, getBestSellers, getBehindTheScenes } from '../lib/api';

import { ProductCard } from '../components/ProductCard';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Star, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

export default function Home() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const categoryRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryRef.current) {
      const scrollAmount = 300;
      categoryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['products', selectedCategory, currentPage], 
    queryFn: () => getProducts(selectedCategory, undefined, currentPage, pageSize)
  });

  const products = data?.products;
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { data: bestSellers } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: () => getBestSellers(4),
  });

  const { data: btsMedia } = useQuery({
    queryKey: ['behind-the-scenes-preview'],
    queryFn: () => getBehindTheScenes(),
  });

  const [currentBanner, setCurrentBanner] = useState(0);
  const [direction, setDirection] = useState(0);
  const banners = [
    '/new-hero-banner-8.jpg',
    '/new-hero-banner-4.jpg',
    '/new-hero-banner-2.jpg',
    '/new-hero-banner-1.jpg'
  ];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentBanner((prev) => (prev + newDirection + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanner]); // Re-run effect when currentBanner changes to reset the interval

  return (
    <div>
      <SEO 
        title={settings?.store_tagline || 'Shop & Order'} 
        path="/" 
      />
      {/* Hero Section */}
      <div className="relative min-h-[250px] sm:min-h-[600px] flex items-end overflow-hidden bg-gray-900">
        {/* Background Image Carousel */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.img 
            key={currentBanner}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? '100%' : '-100%',
                opacity: 0,
                scale: 1.1
              }),
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
                scale: 1
              },
              exit: (direction: number) => ({
                zIndex: 0,
                x: direction < 0 ? '100%' : '-100%',
                opacity: 0,
                scale: 0.9
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.6 }
            }}
            loading={currentBanner === 0 ? "eager" : "lazy"}
            decoding="async"
            src={banners[currentBanner]} 
            alt="Hero banner" 
            className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
            fetchPriority={currentBanner === 0 ? "high" : "low"}
          />
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        <div className="absolute inset-0 z-20 flex items-center justify-between px-4 sm:px-8 pointer-events-none">
          <button
            onClick={() => paginate(-1)}
            className="p-2 sm:p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all pointer-events-auto group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="p-2 sm:p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all pointer-events-auto group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {/* Dark Overlay for better visibility with light text */}
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 pt-16 sm:pt-48">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >


            <div className="flex flex-wrap gap-4 mb-6 sm:mb-8">
              <Link 
                to="/search" 
                className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] text-sm sm:text-base"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Brand Story Section */}
      <section className="bg-white py-12 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 group hover:bg-blue-100 transition-all cursor-default shadow-sm hover:shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wide">
                  🌍 Worldwide Shipping | 🧵 Handmade | 🌿 Premium Cotton | 🔒 Secure Checkout
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Hiya Wear – <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium Handmade Fashion for Global Customers</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
                Hiya Wear is a global fashion brand offering handcrafted Indian textiles designed for modern lifestyles worldwide. Explore our collection of kimonos, jackets, vests, bags, cotton suzani outfits, girls dresses, pajamas, quilt sets, and skirts.
              </p>
              <div className="mt-8 flex gap-2">
                 <div className="h-1 w-20 bg-blue-600 rounded-full" />
                 <div className="h-1 w-10 bg-indigo-200 rounded-full" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <Star className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Timeless Design</h3>
                  <p className="text-sm text-gray-500">Handpicked fashion that transcends seasonal trends.</p>
                </div>
                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-shadow">
                  <h3 className="font-bold text-lg mb-1">Authentic Handcrafted</h3>
                  <p className="text-blue-100 text-sm">Crafted with precision using traditional techniques and premium fabrics.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-100/50 hover:shadow-gray-200 transition-shadow">
                   <h3 className="font-bold text-gray-900 mb-1 leading-tight">Focus on Comfort</h3>
                   <p className="text-sm text-gray-500">Fabrics that feel as good as they look.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl aspect-square flex items-center justify-center p-8 text-center border border-gray-100 shadow-sm">
                   <div>
                     <span className="text-3xl block mb-2">🇮🇳</span>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proudly India</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Customers Section */}
      <section className="bg-gray-50 py-16 sm:py-24 overflow-hidden border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 id="3thgq6" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Serving Customers Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
              We bring traditional Indian craftsmanship to customers across the world, combining timeless techniques with modern designs.
            </p>
            <div className="mt-10 flex justify-center items-center gap-6 text-4xl sm:text-5xl grayscale opacity-30 select-none">
               <span role="img" aria-label="Globe">🌍</span>
               <span role="img" aria-label="Package">📦</span>
               <span role="img" aria-label="Airplane">🛫</span>
               <span role="img" aria-label="Heart">💝</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Collection List Section */}
      <section className="bg-white py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 id="blgm2d" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
              Our Collection
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { name: 'Kimonos', icon: '👘', slug: 'kimonos-collection' },
                { name: 'Jackets', icon: '🧥', slug: 'jackets-collection' },
                { name: 'Vests', icon: '🎽', slug: 'vests-collection' },
                { name: 'Bags', icon: '👜', slug: 'bags-collection' },
                { name: 'Cotton Suzani', icon: '🧵', slug: 'cotton-suzani-shorts' },
                { name: 'Girls Dresses', icon: '👗', slug: 'girls-dresses' },
                { name: 'Pajamas', icon: '🛌', slug: 'pajamas' },
                { name: 'Quilt Sets', icon: '🛏️', slug: 'quilt-sets' },
                { name: 'Skirts', icon: '👗', slug: 'skirts' },
              ].map((item, index) => (
                <Link
                  key={item.name}
                  to={`/category/${item.slug}`}
                  className="block"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="font-bold text-gray-700">{item.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="relative group/cats mb-8">
          {/* Scroll Buttons */}
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 shadow-lg border border-gray-100 text-gray-900 opacity-0 group-hover/cats:opacity-100 transition-opacity hidden md:flex items-center justify-center -left-4"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 shadow-lg border border-gray-100 text-gray-900 opacity-0 group-hover/cats:opacity-100 transition-opacity hidden md:flex items-center justify-center -right-4"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            id="categories" 
            ref={categoryRef}
            className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth"
          >
          <button
            onClick={() => {
              setSelectedCategory(undefined);
              setCurrentPage(1); // Reset to page 1 on category change
            }}
            className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all shadow-sm ${
              !selectedCategory 
                ? 'bg-gray-900 text-white shadow-md scale-[1.02]' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          {categories.filter(c => !c.parent_id).map(cat => (
            <div key={cat.id} className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1); // Reset to page 1 on category change
                }}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all shadow-sm ${
                  selectedCategory === cat.id 
                    ? 'bg-gray-900 text-white shadow-md scale-[1.02]' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {cat.icon && <span className="mr-2">{cat.icon}</span>}
                {cat.name}
              </button>
              <Link
                to={`/category/${cat.slug}`}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm flex items-center justify-center"
                title={`Go to ${cat.name} page`}
              >
                <Star className="w-4 h-4" />
              </Link>
            </div>
          ))}
          </motion.div>
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4 shadow-sm">
              <div className="bg-gray-200 aspect-square rounded-md mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No product is listed in this category</h3>
          <p className="mt-1 text-sm text-gray-500">Try selecting a different category.</p>
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8"
          >
            {products?.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} settings={settings} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  const catEl = document.getElementById('categories');
                  if (catEl) {
                    const top = catEl.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          const catEl = document.getElementById('categories');
                          if (catEl) {
                            const top = catEl.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top, behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 500, behavior: 'smooth' });
                          }
                        }}
                        className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNumber
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    pageNumber === currentPage - 2 || 
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="px-1 text-gray-400">...</span>;
                  }
                  
                  return null;
                })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1)); 
                  const catEl = document.getElementById('categories');
                  if (catEl) {
                    const top = catEl.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
      </div>

      {/* Best Sellers Section */}
      {bestSellers && bestSellers.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">🔥 Best Sellers</h2>
            <p className="mt-3 text-gray-500 font-medium text-lg">Products loved by our customers</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {bestSellers.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} settings={settings} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* How to Order Section */}
      <div className="bg-gray-100/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How to Order</h2>
            <p className="mt-3 text-gray-500 font-medium text-lg">It's as simple as sending a message</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', emoji: '🛍️', title: 'Select a product', desc: 'Browse our collection and pick what you love.' },
              { step: '2', emoji: '💬', title: 'Order on WhatsApp or Instagram', desc: 'Tap the WhatsApp or Instagram button on the product page.' },
              { step: '3', emoji: '📩', title: 'Send the message', desc: 'A pre-filled order message opens automatically.' },
              { step: '4', emoji: '🤝', title: 'We\'ll take it from here', desc: 'We\'ll discuss payment method, delivery details & everything you need.' },
            ].map((item, index) => (
              <motion.div 
                key={item.step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Behind the Scenes Preview Section */}
      {btsMedia && btsMedia.length > 0 && (
        <section className="py-16 sm:py-24 bg-white overflow-hidden border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="max-w-xl"
              >
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                  <Video className="w-8 h-8 text-blue-600" />
                  Behind the Scenes
                </h2>
                <p className="mt-4 text-gray-500 font-medium text-lg leading-relaxed">
                  A glimpse into the craftsmanship and daily life at Hiya Wear.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link 
                  to="/behind-the-scenes" 
                  className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group"
                >
                  View Full Gallery
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {btsMedia.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/behind-the-scenes/${item.id}`}
                    className="block group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt={item.caption || 'Behind the scenes'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        muted
                        playsInline
                        autoPlay
                        loop
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      {item.caption && (
                        <p className="text-white text-xs sm:text-sm line-clamp-2 font-medium">{item.caption}</p>
                      )}
                    </div>
                    {item.type === 'video' && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16 sm:py-24 overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 id="kffcm6" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Why Choose Hiya Wear
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-500 font-medium">
              We stand out through our commitment to quality and craftsmanship.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
            {[
              { title: 'Premium Handmade', icon: '✨', desc: 'Crafted with care by skilled artisans.' },
              { title: 'Unique Designs', icon: '🎨', desc: 'One-of-a-kind pieces for your style.' },
              { title: 'High-Quality Fabrics', icon: '🧵', desc: 'Premium materials for lasting comfort.' },
              { title: 'Attention to Detail', icon: '🔍', desc: 'Meticulous finishing on every garment.' },
              { title: 'Global Service', icon: '🌐', desc: 'Reliable shipping to customers worldwide.' },
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews / Testimonials */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What Our Customers Say</h2>
          <p className="mt-3 text-gray-500 font-medium text-lg">Real reviews from happy shoppers</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            { name: 'Emma, USA', review: 'Beautiful craftsmanship and amazing quality. I get compliments every time I wear it!', rating: 5 },
            { name: 'Sophie, France', review: 'The fabric feels so soft and breathable — perfect for everyday wear.', rating: 5 },
            { name: 'Liam, Australia', review: 'Exactly as pictured. The colors and stitching are stunning.', rating: 5 },
          ].map((testimonial, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">"{testimonial.review}"</p>
              <p className="text-sm font-bold text-gray-900">— {testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instagram Gallery */}
      {settings?.instagram_username && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Follow Us on Instagram</h2>
              <a
                href={`https://www.instagram.com/${settings.instagram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-pink-600 font-bold hover:text-pink-700 transition-colors text-lg"
              >
                <Instagram className="w-6 h-6" />
                @{settings.instagram_username}
              </a>
            </motion.div>
            {/* Product images as Instagram-style gallery */}
            {products && products.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
              >
                {products.slice(0, 6).map((product, index) => {
                  const img = product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url;
                  return img ? (
                    <motion.a
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      key={product.id}
                      href={`https://www.instagram.com/${settings.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-xl overflow-hidden group relative shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img 
                        src={img} 
                        alt={product.name} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100" />
                      </div>
                    </motion.a>
                  ) : null;
                })}
              </motion.div>
            )}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <a
                href={`https://www.instagram.com/${settings.instagram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold hover:opacity-90 transition-opacity shadow-lg hover:scale-105 transform duration-300"
              >
                <Instagram className="w-5 h-5" />
                Follow @{settings.instagram_username}
              </a>
            </motion.div>
          </div>
        </div>
      )}

    </div>
  );
}
