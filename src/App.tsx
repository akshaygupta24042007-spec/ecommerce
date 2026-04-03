import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import type { RouteRecord } from 'vite-react-ssg';
import { createClient } from '@supabase/supabase-js';

import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from './lib/api';
import { supabase } from './lib/supabase';
import { useCartStore } from './lib/store';
import { Cart } from './components/Cart';
import { AnnouncementBar } from './components/AnnouncementBar';
import { BottomNav } from './components/BottomNav';
import { WhatsappVideoCall } from './components/WhatsappVideoCall';
import toast from 'react-hot-toast';
import { OrderModal } from './components/OrderModal';
import { createWhatsAppLink } from './utils/orderLinks';
import { Search as SearchIcon, LogOut, ShoppingCart, Menu, X, Home as HomeIcon, Package, Info, Phone, MessageCircle, Instagram, Mail, ChevronLeft, ChevronRight, BookOpen, Video } from 'lucide-react';

// Import pages statically for SSG
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AdminBlogs from './pages/AdminBlogs';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import BehindTheScenes from './pages/BehindTheScenes';
import BehindTheScenesDetail from './pages/BehindTheScenesDetail';
import AdminBehindTheScenes from './pages/AdminBehindTheScenes';
import VerifiedBuyerChats from './pages/VerifiedBuyerChats';
import AdminVerifiedChats from './pages/AdminVerifiedChats';
import CategoryPage from './pages/CategoryPage';
import { productLoader } from './pages/ProductDetail';

// Admin Layout
const AdminLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 font-bold text-xl border-b">Admin Panel</div>
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <Link to="/admin/dashboard" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium">Dashboard</Link>
          <Link to="/admin/products" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium">Products</Link>
          <Link to="/admin/categories" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium">Categories</Link>
          <Link to="/admin/blogs" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium">Blogs</Link>
          <Link to="/admin/behind-the-scenes" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium flex items-center gap-2">
            <Video className="w-4 h-4" />
            Behind the Scenes
          </Link>
          <Link to="/admin/verified-chats" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Verified Chats
          </Link>
          <Link to="/admin/settings" className="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 font-medium">Settings</Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-600 hover:text-red-600 w-full px-3 py-2 font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

// Public Layout
const PublicLayout = () => {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  const { items, toggleCart } = useCartStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const handleCartClick = () => {
    setIsMobileMenuOpen(false);
    toggleCart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      <AnnouncementBar />
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 mr-1">
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button 
                onClick={() => navigate(1)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                aria-label="Go forward"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <Link to="/" className="text-xl font-bold flex items-center gap-2" style={{ color: settings?.theme_color || '#2563eb' }}>
              {settings?.store_logo_url ? (
                <img src={settings.store_logo_url} alt="Logo" className="h-8 w-auto" />
              ) : null}
              {settings?.store_name || 'Hiya Store'}
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/search" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Shop / Products</Link>
            <a href="/#categories" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Categories</a>
            <Link to="/blogs" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Blog</Link>
            <Link to="/behind-the-scenes" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Behind the Scenes</Link>
            <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">

            
            <Link to="/search" className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <SearchIcon className="w-5 h-5" />
            </Link>

            {settings?.instagram_username && (
              <a 
                href={`https://www.instagram.com/${settings.instagram_username}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-gray-700 hover:text-pink-600 transition-colors hidden sm:block"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}

            {settings?.whatsapp_number && (
              <a 
                href={createWhatsAppLink(settings.whatsapp_number, 'Hello!')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-gray-700 hover:text-green-600 transition-colors hidden sm:block"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}

            <button
              onClick={handleCartClick}
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-[280px] w-full bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300">
            <div className="px-4 py-6 border-b flex items-center justify-between">
              <span className="text-xl font-bold" style={{ color: settings?.theme_color || '#2563eb' }}>Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <HomeIcon className="w-5 h-5 text-gray-400" />
                Home
              </Link>
              <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <Package className="w-5 h-5 text-gray-400" />
                Shop / Products
              </Link>
              <a href="/#categories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <Menu className="w-5 h-5 text-gray-400" />
                Categories
              </a>
              <Link to="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <BookOpen className="w-5 h-5 text-gray-400" />
                Blog
              </Link>
              <Link to="/behind-the-scenes" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <Video className="w-5 h-5 text-gray-400" />
                Behind the Scenes
              </Link>
              <Link to="/verified-buyer-chats" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                Verified Buyer Chats
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <Info className="w-5 h-5 text-gray-400" />
                About
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100">
                <Phone className="w-5 h-5 text-gray-400" />
                Contact
              </Link>
              <button 
                onClick={handleCartClick} 
                className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-gray-400" />
                  Shopping Cart
                </div>
                {items.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                    {items.length}
                  </span>
                )}
              </button>

            </nav>
            <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-900">Merchant Login</Link>
            </div>
          </div>
        </>
      )}
      <main className="flex-1 w-full bg-gray-50 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
      <BottomNav />
      <Cart />
      <WhatsappVideoCall />
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link to="/behind-the-scenes" className="hover:text-white transition-colors">Behind the Scenes</Link></li>
                <li><Link to="/verified-buyer-chats" className="hover:text-white transition-colors">Verified Buyer Chats</Link></li>
                <li><Link to="/blogs" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* FAQs */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">FAQs</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/faq" className="hover:text-white transition-colors">How to Order</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">Payment Methods</Link></li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Social Links</h3>
              <ul className="space-y-2.5 text-sm">
                {settings?.instagram_username && (
                  <li>
                    <a href={`https://www.instagram.com/${settings.instagram_username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>@{settings.instagram_username}</span>
                    </a>
                  </li>
                )}
                {settings?.whatsapp_number && (
                  <li>
                    <a href={createWhatsAppLink(settings.whatsapp_number, 'Hello!')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span>{settings.whatsapp_number}</span>
                    </a>
                  </li>
                )}
                {settings?.contact_email && (
                  <li>
                    <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>{settings.contact_email}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
              <ul className="space-y-2.5 text-sm">
                {settings?.whatsapp_number && (
                  <li className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{settings.whatsapp_number}</span>
                  </li>
                )}
                {settings?.contact_email && (
                  <li>
                    <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                      {settings.contact_email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} {settings?.store_name || 'Hiya Store'}. All rights reserved.</p>
            <p>Powered by Hiya</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper to fetch slugs from Supabase at build time
async function getSupabaseSlugs(table: string, slugField: string = 'slug', filter?: { column: string; value: string }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(`Missing Supabase env vars, skipping ${table} path generation`);
    return [];
  }
  
  const client = createClient(supabaseUrl, supabaseAnonKey);
  let query = client.from(table).select(slugField);
  
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching ${table} slugs:`, error);
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[] || []).map((item) => item[slugField] as string);
}

import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RootProviders = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  </HelmetProvider>
);

// Route definitions as data route objects for SSG
export const routes: RouteRecord[] = [
  {
    element: <RootProviders />,
    children: [
      // Public Routes
      {
        path: '/',
    Component: PublicLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'search',
        Component: Search,
      },
      {
        path: 'about',
        Component: About,
      },
      {
        path: 'blogs',
        Component: BlogList,
      },
      {
        path: 'blogs/:slug',
        Component: BlogDetail,
        getStaticPaths: async () => {
          const slugs = await getSupabaseSlugs('blogs');
          return slugs.map((slug: string) => `blogs/${slug}`);
        },
      },
      {
        path: 'category/:slug',
        Component: CategoryPage,
        getStaticPaths: async () => {
          const slugs = await getSupabaseSlugs('categories');
          return slugs.map((slug: string) => `category/${slug}`);
        },
      },
      {
        path: 'behind-the-scenes',
        Component: BehindTheScenes,
      },
      {
        path: 'verified-buyer-chats',
        Component: VerifiedBuyerChats,
      },
      {
        path: 'behind-the-scenes/:id',
        Component: BehindTheScenesDetail,
        getStaticPaths: async () => {
          const ids = await getSupabaseSlugs('behind_the_scenes', 'id');
          // Filter out missing/null ids if any, just in case
          return ids.filter(Boolean).map((id: string) => `behind-the-scenes/${id}`);
        },
      },
      {
        path: 'contact',
        Component: Contact,
      },
      {
        path: 'faq',
        Component: FAQ,
      },
      {
        path: 'product/:id',
        Component: ProductDetail,
        loader: productLoader,
        getStaticPaths: async () => {
          const slugs = await getSupabaseSlugs('products', 'slug', { column: 'status', value: 'published' });
          return slugs.map((slug: string) => `product/${slug}`);
        },
      },
    ],
  },
  // Admin Routes (not pre-rendered)
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        Component: AdminDashboard,
      },
      {
        path: 'settings',
        Component: AdminSettings,
      },
      {
        path: 'products',
        Component: AdminProducts,
      },
      {
        path: 'categories',
        Component: AdminCategories,
      },
      {
        path: 'blogs',
        Component: AdminBlogs,
      },
      {
        path: 'behind-the-scenes',
        Component: AdminBehindTheScenes,
      },
      {
        path: 'verified-chats',
        Component: AdminVerifiedChats,
      },
    ],
  },
  ]
  }
];
