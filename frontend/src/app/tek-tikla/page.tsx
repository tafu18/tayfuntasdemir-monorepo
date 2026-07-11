'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TekTiklaPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)] py-20 px-4 bg-zinc-50 dark:bg-zinc-950">
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-32 h-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8 p-6 border border-zinc-200/60 dark:border-zinc-800 hover:rotate-3 transition-transform duration-500"
      >
        <img src="/tektiklaLogo.png" alt="Tek Tıkla Logo" className="w-full h-full object-contain" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight"
      >
        Tek Tıkla
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-semibold text-brand-blue mb-6"
      >
        Hızlı Web Erişimi
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-lg mb-10 text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed"
      >
        Web sitelerini kaydetme, organize etme ve WebView aracılığıyla hızlıca görüntüleme imkanı sunan modern bookmark yöneticiniz.
      </motion.p>

      {/* Download Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Google Play */}
        <a
          href="https://play.google.com/store/apps/details?id=com.tayfuntasdemir.tektikla"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-blue hover:bg-brand-blue text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-4 shadow-[0_10px_15px_-3px_rgba(52,211,153,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_25px_-5px_rgba(52,211,153,0.35)] transition-all duration-300"
        >
          <i className="fab fa-google-play text-3xl" />
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest opacity-90 leading-none">Google Play</div>
            <div className="text-xl font-bold leading-tight mt-0.5">İndir</div>
          </div>
        </a>

        {/* App Store */}
        <a
          href="https://apps.apple.com/us/app/tek-t%C4%B1kla-h%C4%B1zl%C4%B1-web-eri%C5%9Fimi/id6762490071"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-blue hover:bg-brand-blue text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-4 shadow-[0_10px_15px_-3px_rgba(52,211,153,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_25px_-5px_rgba(52,211,153,0.35)] transition-all duration-300"
        >
          <i className="fab fa-apple text-3xl" />
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest opacity-90 leading-none">App Store</div>
            <div className="text-xl font-bold leading-tight mt-0.5">İndir</div>
          </div>
        </a>
      </motion.div>

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12"
      >
        <Link
          href="/"
          className="text-sm text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-medium"
        >
          ← Ana Sayfaya Dön
        </Link>
      </motion.div>
    </div>
  );
}
