'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, Home, ShieldAlert, Lock, AlertOctagon, HelpCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const [errorDetails, setErrorDetails] = useState({
    code: '500',
    title: 'Sistem Hatası',
    message: 'Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi veya daha sonra tekrar denemeyi deneyin.',
    icon: AlertOctagon,
    color: 'from-red-500 via-rose-600 to-amber-600',
    iconColor: 'text-red-500'
  });

  useEffect(() => {
    console.error('Sistem Hatası:', error);

    const msg = error?.message?.toLowerCase() || '';
    
    // 403 - Yetkisiz Erişim tespiti
    if (msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('403') || msg.includes('permission')) {
      setErrorDetails({
        code: '403',
        title: 'Erişim Engellendi',
        message: 'Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz veya oturum açmanız gerekiyor.',
        icon: Lock,
        color: 'from-amber-500 via-orange-600 to-red-600',
        iconColor: 'text-amber-500'
      });
    } 
    // 419 - Oturum Süresi / CSRF tespiti
    else if (msg.includes('expired') || msg.includes('csrf') || msg.includes('419') || msg.includes('token')) {
      setErrorDetails({
        code: '419',
        title: 'Oturum Süresi Doldu',
        message: 'Güvenlik nedeniyle oturumunuz veya istek süresi doldu. Lütfen sayfayı yenileyip tekrar deneyin.',
        icon: ShieldAlert,
        color: 'from-purple-500 via-violet-600 to-indigo-600',
        iconColor: 'text-purple-500'
      });
    }
  }, [error]);

  const IconComponent = errorDetails.icon;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Arka Plan Küreleri */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 dark:bg-red-500/2 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/5 dark:bg-brand-blue/2 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-8 p-8 md:p-12 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xl">
        {/* Hata Kodu / İkon */}
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${errorDetails.color}`}
          >
            {errorDetails.code}
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`absolute -top-4 -right-4 w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 ${errorDetails.iconColor} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <IconComponent className="h-6 w-6" />
          </motion.div>
        </div>

        {/* Metin İçeriği */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">
            {errorDetails.title}
          </h1>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {errorDetails.message}
          </p>
        </div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full"></div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all text-sm group shadow-sm"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-550" />
            Tekrar Dene
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
          Hata devam ederse lütfen{' '}
          <Link href="/contact" className="text-brand-blue hover:underline font-semibold">
            bizimle iletişime geçin
          </Link>
        </p>
      </div>
    </div>
  );
}
