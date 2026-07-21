'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import FAQ from '@/components/FAQ';

export default function VaktiHuzurPage() {
  const faqItems = [
    {
      question: "Vakt-i Huzur uygulaması ücretsiz mi?",
      answer: "Evet, Vakt-i Huzur uygulamasının tüm temel özellikleri (Namaz vakitleri, Kıble bulucu, Zikirmatik, Hicri takvim) tamamen ücretsizdir."
    },
    {
      question: "Ezan vakitleri bildirimleri internet olmadan çalışır mı?",
      answer: "Aylık namaz vakti verileri indirildikten sonra bildirim ve vakit takibi internet bağlantısı gerekmeden çalışmaya devam eder."
    },
    {
      question: "Kıble pusulası nasıl doğru çalışır?",
      answer: "Cihazınızın konum iznini onayladıktan ve pusulanızı 8 şeklinde hareket ettirip kalibre ettikten sonra doğru kıble açısını hesaplar."
    },
    {
      question: "Hangi platformlarda kullanılabilir?",
      answer: "Vakt-i Huzur hem iOS (App Store) hem de Android (Google Play Store) cihazlarda desteklenmektedir."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)] py-12 px-4 bg-zinc-50 dark:bg-zinc-950">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-32 h-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8 p-5 border border-zinc-200/60 dark:border-zinc-800 hover:rotate-3 transition-transform duration-500"
      >
        <Image src="/hilal.png" alt="Vakt-i Huzur Logo" width={100} height={100} className="w-full h-full object-contain" priority />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight"
      >
        Vakt-i Huzur
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-semibold text-brand-blue mb-6"
      >
        İbadetlerinizde Yardımcınız
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-lg mb-10 text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed"
      >
        Namaz vakitleri, kıble bulucu, zikirmatik ve günlük dini içeriklerle ibadetlerinizde yanınızda olan modern İslami uygulama.
      </motion.p>

      {/* Feature Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {['🕌 Namaz Vakitleri', '🧭 Kıble Bulucu', '📿 Zikirmatik', '📖 Günlük İçerikler', '🌙 Hicri Takvim'].map((f) => (
          <span key={f} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-brand-blue text-xs font-bold rounded-full border border-blue-200/60 dark:border-blue-900/50">
            {f}
          </span>
        ))}
      </motion.div>

      {/* Download Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-col sm:flex-row gap-4 mb-12"
      >
        {/* Google Play */}
        <a
          href="https://play.google.com/store/apps/details?id=com.tayfuntasdemir.VaktiHuzurApp"
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
          href="https://apps.apple.com/us/app/vakt-i-huzur-ezan-kuran/id6758310488"
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

      {/* Website link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mb-8"
      >
        <a
          href="https://vaktihuzur.com.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-brand-dark dark:hover:text-brand-blue transition-colors font-semibold underline underline-offset-4"
        >
          vaktihuzur.com.tr →
        </a>
      </motion.div>

      {/* FAQ Section */}
      <div className="w-full max-w-3xl text-left">
        <FAQ
          title="Vakt-i Huzur Hakkında SSS"
          subtitle="Mobil uygulamamız ile ilgili merak edilen sorular"
          items={faqItems}
        />
      </div>

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="mt-8"
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
