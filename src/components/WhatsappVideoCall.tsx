import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '../lib/api';
import { Video, X } from 'lucide-react';
import { createWhatsAppLink } from '../utils/orderLinks';

const REASONS = [
  "Want to check product quality before buying",
  "Need help choosing the right product",
  "Interested in bulk order / wholesale",
  "Want to see live packaging & dispatch process",
  "Have custom requirement / design",
  "Need clarification about pricing or discounts",
  "Want to verify your business before placing order",
  "Other (please specify)"
];

export function WhatsappVideoCall() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);
  const [otherReason, setOtherReason] = useState('');

  const waNumber = settings?.whatsapp_number;
  if (!waNumber) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonText = selectedReason === "Other (please specify)" ? otherReason : selectedReason;
    if (!reasonText.trim()) return;

    const message = `Hello! I would like to request a video call for my order.\n\n*Reason for video call:* ${reasonText}`;
    const url = createWhatsAppLink(waNumber, message);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] flex items-center justify-center transition-all duration-300 z-40 group"
        aria-label="Request Video Call"
      >
        <Video className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
          >
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Video className="w-5 h-5 text-[#25D366]" />
                Request Video Call
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-6">
                <p className="text-sm text-amber-900 font-medium leading-snug flex gap-2 items-start">
                  <span>👉</span> 
                  <span>"Video call available for serious buyers only (especially bulk & custom orders)"</span>
                </p>
              </div>

              <form id="video-call-form" onSubmit={handleSubmit} className="space-y-4">
                <p className="font-semibold text-gray-900 mb-3">Please select your primary reason:</p>
                <div className="space-y-3">
                  {REASONS.map((reason) => (
                    <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => {
                            setSelectedReason(e.target.value);
                            if (e.target.value !== "Other (please specify)") {
                              setOtherReason("");
                            }
                          }}
                          className="w-4 h-4 text-[#25D366] border-gray-300 focus:ring-[#25D366] mt-0.5"
                        />
                      </div>
                      <span className={`text-sm leading-relaxed ${selectedReason === reason ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>

                {selectedReason === "Other (please specify)" && (
                  <div className="mt-4 pt-2">
                    <input
                      type="text"
                      placeholder="Please specify your reason..."
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-[#25D366] transition-colors"
                      required
                      autoFocus
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 sm:p-6 border-t bg-gray-50">
              <button
                type="submit"
                form="video-call-form"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3.5 px-4 rounded-xl transition-colors duration-200 flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedReason === "Other (please specify)" && !otherReason.trim()}
              >
                Send Request on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
