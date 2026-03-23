import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function About() {
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <SEO title="About Us" description="Learn more about Hiya International, our story, and our commitment to slow fashion and craftsmanship." path="/about" />
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">About Us</h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white p-8 sm:p-12 md:p-16 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 relative overflow-hidden"
      >
        {/* Decorative subtle background circle */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-50 to-cyan-50 blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 text-gray-600 text-base sm:text-lg">
          <p className="text-xl sm:text-2xl leading-relaxed mb-8 font-medium text-gray-800">
            At Hiya International, we celebrate craftsmanship, creativity, and conscious design. What began as a small creative endeavor has grown into a purpose-driven brand rooted in authenticity and handmade excellence.
          </p>
          <p className="leading-relaxed mb-8">
            We believe in the beauty of slow fashion — where every piece tells a story and reflects the hands that made it. Our focus is on creating with intention, using thoughtful materials, and honoring the process behind every detail.
          </p>
          <p className="leading-relaxed mb-10">
            Driven by passion and purpose, our team is committed to offering more than just style — we offer meaning, individuality, and a connection to something real. Thank you for being part of our journey.
          </p>
          <div className="pt-6 border-t border-gray-100">
            <p className="font-bold text-gray-900 text-xl tracking-wide">
              — Hiya International
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
