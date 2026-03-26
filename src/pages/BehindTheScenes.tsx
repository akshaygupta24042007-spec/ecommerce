import { useQuery } from '@tanstack/react-query';
import { getBehindTheScenes } from '../lib/api';
import SEO from '../components/SEO';
import { Film } from 'lucide-react';

export default function BehindTheScenes() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['behind-the-scenes'],
    queryFn: getBehindTheScenes
  });

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Behind the Scenes" 
        description="Take a look behind the scenes of our production and design process."
      />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Behind the Scenes</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the artistry and dedication that goes into every piece. From our workshop to your home, see how we bring our collections to life.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {items?.map((item) => (
                <div key={item.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                    {item.type === 'video' ? (
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover"
                        controls
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.caption || 'Behind the scenes'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    {item.type === 'video' && (
                      <div className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white pointer-events-none">
                        <Film className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {item.caption && (
                    <div className="mt-4">
                      <p className="text-gray-800 font-medium leading-relaxed">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
              {items?.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-500 text-lg">No behind the scenes content available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-20 bg-gray-50 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-800">
            "Authenticity sits at the heart of everything we do. We're proud to share our journey with you."
          </blockquote>
        </div>
      </section>
    </div>
  );
}
