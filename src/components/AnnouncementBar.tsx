import { useState, useEffect } from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

const announcements = [
  {
    id: 1,
    text: "New summer collection launched!",
    icon: Sparkles,
  },
  {
    id: 2,
    text: "Order directly via WhatsApp or Instagram",
    icon: MessageCircle,
  }
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % announcements.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-900 text-white overflow-hidden h-10 flex items-center justify-center text-sm px-4 w-full min-w-full relative z-50">
      <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center h-full">
        {announcements.map((announcement, index) => {
          const Icon = announcement.icon;
          return (
            <div
              key={announcement.id}
              className={`absolute flex items-center gap-2 transition-all duration-500 ease-in-out w-full justify-center
                ${index === currentIndex 
                  ? 'translate-y-0 opacity-100 z-10' 
                  : index < currentIndex 
                    ? '-translate-y-full opacity-0 z-0' 
                    : 'translate-y-full opacity-0 z-0'
                }
              `}
              aria-hidden={index !== currentIndex}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium tracking-wide">{announcement.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
