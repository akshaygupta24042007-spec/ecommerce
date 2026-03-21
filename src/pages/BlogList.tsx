import { useQuery } from '@tanstack/react-query';
import { getBlogs, getStoreSettings } from '../lib/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function BlogList() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  const { data: blogs, isLoading } = useQuery({ 
    queryKey: ['blogs'], 
    queryFn: getBlogs 
  });

  useEffect(() => {
    if (settings) {
      document.title = `Blog | ${settings.store_name}`;
    }
  }, [settings]);

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our Journal
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Discover styling tips, behind the scenes, and updates from the world of {settings?.store_name || 'our store'}.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-96">
                <div className="bg-gray-200 aspect-[4/3] rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : blogs?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-500">Check back soon for latest stories and updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs?.map((blog, index) => (
              <motion.article 
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border"
              >
                <Link to={`/blogs/${blog.slug}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    {blog.image ? (
                      <img 
                        src={blog.image} 
                        alt={blog.alt_text || blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
                      <Clock className="w-4 h-4" />
                      {new Date(blog.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h2>
                    {blog.content && (
                      <p className="text-gray-600 line-clamp-3 leading-relaxed mb-6">
                        {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                      </p>
                    )}
                    <span className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
                      Read Article &rarr;
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
