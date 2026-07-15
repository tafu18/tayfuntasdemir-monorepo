'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertCircle, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Arka Plan Dekoratif Gradyan Küreleri */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-8 p-8 md:p-12 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xl">
        {/* Hata Kodu / İkon */}
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-blue-600 to-purple-650 dark:from-brand-blue dark:via-blue-500 dark:to-purple-500"
          >
            404
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg"
          >
            <AlertCircle className="h-6 w-6" />
          </motion.div>
        </div>

        {/* Metin İçeriği */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">
            Sayfa Bulunamadı
          </h1>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Aradığınız sayfa silinmiş, ismi değiştirilmiş veya geçici olarak kullanılamıyor olabilir. Lütfen adresi kontrol edin.
          </p>
        </div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full"></div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all text-sm group shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Geri Dön
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold rounded-xl transition-all text-sm shadow-md"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Link>
        </div>

        {/* Yardım/Destek Linki */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 flex items-center justify-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 text-zinc-450" />
          Bir sorun olduğunu mu düşünüyorsunuz?{' '}
          <Link href="/contact" className="text-brand-blue hover:underline font-semibold">
            Bize bildirin
          </Link>
        </p>
      </div>
    </div>
  );
}
