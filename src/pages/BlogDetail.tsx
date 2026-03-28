import { useQuery } from '@tanstack/react-query';
import { getBlog, getStoreSettings } from '../lib/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar } from 'lucide-react';
import SEO from '../components/SEO';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  
  const { data: blog, isLoading, isError } = useQuery({ 
    queryKey: ['blog', slug], 
    queryFn: () => getBlog(slug as string),
    enabled: !!slug
  });

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">The article you're looking for might have been removed or the link is incorrect.</p>
        <Link to="/blogs" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          Browse All Articles
        </Link>
      </div>
    );
  }

  if (isLoading || !blog) {
    return (
      <div className="min-h-screen bg-white max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-6 w-24 bg-gray-200 rounded mb-8" />
        <div className="h-12 w-3/4 bg-gray-200 rounded mb-6" />
        <div className="h-6 w-48 bg-gray-200 rounded mb-12" />
        <div className="aspect-[21/9] w-full bg-gray-200 rounded-3xl mb-12" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen pb-24">
      <SEO 
        title={settings ? `${blog.meta_title || blog.title} | ${settings.store_name}` : blog.meta_title || blog.title} 
        description={blog.meta_description || "Read our latest article."} 
        path={`/blogs/${slug}`}
        image={blog.image || undefined}
        article={{
          title: blog.meta_title || blog.title,
          description: blog.meta_description || "Read our latest article.",
          image: blog.image || undefined,
          datePublished: blog.created_at,
          url: `https://www.hiyawear.com/blogs/${slug}`
        }}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.hiyawear.com' },
          { name: 'Blog', url: 'https://www.hiyawear.com/blogs' },
          { name: blog.title, url: `https://www.hiyawear.com/blogs/${slug}` }
        ]}
      />
      {/* Hero Image Section if exists */}
      {blog.image && (
        <div className="w-full h-[40vh] min-h-[400px] relative bg-gray-900">
          <img 
            src={blog.image} 
            alt={blog.alt_text || blog.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        </div>
      )}

      <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${blog.image ? '-mt-32 relative z-10' : 'pt-16'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${blog.image ? 'bg-white p-8 sm:p-12 shadow-2xl rounded-3xl' : ''}`}
        >
          <button 
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Journal
          </button>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-12 py-4 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(blog.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {/* Can add author or reading time here if needed in future */}
          </div>

          <div 
            className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: blog.content || '' }}
          />

          <div className="mt-16 pt-8 border-t border-gray-100">
            <h3 className="text-xl font-bold mb-6">Enjoyed this article?</h3>
            <div className="flex gap-4">
              <Link to="/search" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                Shop Our Collection
              </Link>
              <Link to="/blogs" className="px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                More Articles
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </article>
  );
}
