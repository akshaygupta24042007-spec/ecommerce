import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '../lib/api';
import { createWhatsAppLink, createInstagramLink } from '../utils/orderLinks';
import { MessageCircle, Instagram, Mail } from 'lucide-react';

export default function Contact() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h1>
      <p className="text-gray-600 mb-8 text-lg">We'd love to hear from you. Get in touch with us through the channels below for any inquiries or support.</p>
      
      <div className="space-y-4 max-w-sm">
        {settings?.whatsapp_number && (
          <a
            href={createWhatsAppLink(settings.whatsapp_number, 'Hello, I have an inquiry concerning your store.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] text-white p-4 rounded-lg font-medium hover:bg-[#20bd5a] transition-colors shadow-sm"
          >
            <MessageCircle className="w-6 h-6" />
            Chat on WhatsApp
          </a>
        )}
        {settings?.instagram_username && (
          <a
            href={createInstagramLink(settings.instagram_username)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white p-4 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Instagram className="w-6 h-6" />
            Message on Instagram
          </a>
        )}
        {settings?.contact_email && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white">
            <Mail className="w-6 h-6 text-gray-900 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Email Us</h3>
              <a
                href={`mailto:${settings.contact_email}`}
                className="text-gray-600 hover:text-gray-900 transition-colors mt-1 inline-block"
              >
                {settings.contact_email}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
