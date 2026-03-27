import { useQuery } from '@tanstack/react-query';
import { getBehindTheScenes } from '../lib/api';
import { Video } from 'lucide-react';
import type { BehindTheScene } from '../lib/types';

export default function BehindTheScenes() {
  const { data: media, isLoading } = useQuery<BehindTheScene[]>({
    queryKey: ['behind-the-scenes'],
    queryFn: getBehindTheScenes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Video className="w-8 h-8 text-blue-600" />
          Behind the Scenes
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto italic font-medium">
          "A glimpse into the craftsmanship and daily life at Hiya Wear."
        </p>
      </div>

      {!media || media.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Coming soon! We're preparing some special moments for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="aspect-[4/5] relative bg-gray-100 overflow-hidden">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.caption || 'Behind the scenes'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    controls
                    playsInline
                    preload="metadata"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  {item.caption && (
                    <p className="text-white text-sm line-clamp-2">{item.caption}</p>
                  )}
                </div>
              </div>
              {item.caption && (
                <div className="p-4 border-t border-gray-50">
                  <p className="text-gray-700 text-sm line-clamp-2 font-medium leading-relaxed">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 text-center border-t border-gray-100 pt-8">
        <p className="text-gray-500 text-sm">Follow us on Instagram for daily updates</p>
      </div>
    </div>
  );
}
