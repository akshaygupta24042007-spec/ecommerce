import { useQuery } from '@tanstack/react-query';
import { getVerifiedBuyerChats } from '../lib/api';
import { MessageSquare, Instagram } from 'lucide-react';
import type { VerifiedBuyerChat } from '../lib/types';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function VerifiedBuyerChats() {
  const { data: chats, isLoading } = useQuery<VerifiedBuyerChat[]>({
    queryKey: ['verified-buyer-chats'],
    queryFn: getVerifiedBuyerChats
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
      <SEO 
        title="Verified Buyer Chats | Customer Satisfaction Gallery" 
        description="See real chats and feedback from our satisfied customers. Proof of quality and reliable service at Hiya Wear."
        path="/verified-buyer-chats"
      />
      
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-4"
        >
          <MessageSquare className="w-4 h-4" />
          Real Customer Proof
        </motion.div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Verified Buyer Chats
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          Transparency is our priority. Here are some real conversations with our customers from across the globe.
        </p>
      </div>

      {!chats || chats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">More proofs coming soon!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {chats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="break-inside-avoid"
            >
              <div className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col">
                <div className="relative overflow-hidden bg-gray-50">
                  <img 
                    src={chat.url} 
                    alt={chat.caption || 'Customer Chat Screenshot'} 
                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                {chat.caption && (
                  <div className="p-4 bg-white border-t border-gray-50">
                    <p className="text-gray-700 text-sm font-semibold leading-relaxed text-center">
                      "{chat.caption}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-24 text-center bg-gray-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Instagram className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Want to see more?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            We regularly post customer reviews and updates on our Instagram. Follow us to stay updated with our latest collection and happy customer stories.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all active:scale-95"
            >
              Back to Home
            </Link>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-all active:scale-95 border border-gray-700"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
