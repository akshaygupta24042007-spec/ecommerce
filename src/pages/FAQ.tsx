import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Simply browse our products, click on the one you like, and tap the 'Order on WhatsApp' or 'Order on Instagram' button. A pre-filled message will be sent to us with your order details, and we'll take it from there!"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept PayPal, Wise, and Bank Transfer. Once you place an order via WhatsApp or Instagram, we'll share payment details with you directly."
  },
  {
    question: "How long does shipping take?",
    answer: "We offer two shipping options: Fast Delivery (4-5 business days) and Standard Delivery (10-11 business days). Please note that fast delivery comes with additional shipping charges. We'll share tracking details once your order is shipped."
  },
  {
    question: "Can I return or exchange a product?",
    answer: "Yes! If you're not satisfied with your purchase, contact us within 7 days of receiving the product. We'll guide you through the return or exchange process."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, we will provide you with a tracking number via WhatsApp or Instagram so you can easily track your delivery."
  },
  {
    question: "Do you deliver to my area?",
    answer: "Yes, we deliver across all countries! No matter where you are, we've got you covered. Reach out to us on WhatsApp or Instagram for any delivery-related questions."
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Find answers to common questions about ordering, shipping, payments, and more.</p>
      
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`} 
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
