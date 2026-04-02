import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBehindTheScene } from '../lib/api';
import SEO from '../components/SEO';
import { ChevronLeft } from 'lucide-react';

export default function BehindTheScenesDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading } = useQuery({
    queryKey: ['behind-the-scenes', id],
    queryFn: () => getBehindTheScene(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Media not found</h2>
        <Link to="/behind-the-scenes" className="text-blue-600 hover:underline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Gallery
        </Link>
      </div>
    );
  }

  const title = item.caption ? `${item.caption.slice(0, 50)}${item.caption.length > 50 ? '...' : ''} | Behind the Scenes` : 'Behind the Scenes | Craftsmanship Gallery';
  const description = item.caption || 'A glimpse into the craftsmanship and daily life at Hiya Wear.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={title} 
        description={description}
        path={`/behind-the-scenes/${item.id}`}
        image={item.type === 'image' ? item.url : undefined}
        video={item.type === 'video' ? {
          name: title,
          description: description,
          thumbnailUrl: 'https://www.hiyawear.com/logo.png',
          uploadDate: item.created_at,
          contentUrl: item.url,
        } : undefined}
      />
      
      <div className="mb-8">
        <Link to="/behind-the-scenes" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back to Gallery
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {item.type === 'image' ? (
          <div className="w-full bg-gray-100 flex items-center justify-center">
            <img 
              src={item.url} 
              alt={item.caption || 'Behind the scenes'} 
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>
        ) : (
          <div className="w-full bg-black flex items-center justify-center">
            <video 
              src={item.url}
              className="w-full max-h-[80vh]"
              controls
              playsInline
              autoPlay
            />
          </div>
        )}
        
        {item.caption && (
          <div className="p-8">
            <h1 className="text-2xl font-medium text-gray-900 leading-relaxed max-w-3xl mx-auto text-center">
              {item.caption}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
