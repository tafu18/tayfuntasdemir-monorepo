'use client';

import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Applications() {
  const apps = [
    // ARAÇLAR
    { name: 'PusulaAPI', desc: 'Gelişmiş API test aracı.', path: '/pusula-api', icon: '🧭', color: 'text-brand-blue hover:shadow-blue-500/20' },
    { name: 'Namaz Vakitleri', desc: 'Konumunuza göre güncel namaz vakitleri.', path: '/namaz-vakitleri', icon: '🕌', color: 'text-green-500 hover:shadow-green-500/20' },
    { name: 'Şifre Oluşturucu', desc: 'Güvenli ve güçlü parolalar oluşturun.', path: '/password-generator', icon: '🔑', color: 'text-yellow-500 hover:shadow-yellow-500/20' },
    { name: 'Aylık Takvim', desc: 'Seçili konum için aylık namaz vakitleri.', path: '/prayer-monthly', icon: '📅', color: 'text-green-500 hover:shadow-green-500/20' },
    { name: 'İftara Ne Kadar Kaldı?', desc: 'İftar saatine kalan süreyi anlık görün.', path: '/iftara-ne-kadar-kaldi', icon: '🌙', color: 'text-sky-500 hover:shadow-sky-500/20' },
    { name: 'Döviz ve Altın', desc: 'TCMB anlık döviz ve altın kurları.', path: '/doviz', icon: '🪙', color: 'text-amber-500 hover:shadow-amber-500/20' },
    { name: 'Hediyeleşme', desc: 'Partnerinle hediyeleş, anılar biriktir.', path: '/gift', icon: '🎁', color: 'text-red-500 hover:shadow-red-500/20' },
    { name: 'Sözlük', desc: 'Kelime anlamlarını keşfedin.', path: '/sozluk', icon: '📖', color: 'text-brand-blue hover:shadow-blue-500/20' },
    { name: 'IP Adresim', desc: 'Dış IP adresinizi anında öğrenin.', path: '/tools/ip', icon: '🔌', color: 'text-brand-blue hover:shadow-blue-500/20' },
    { name: 'Epoch Converter', desc: 'Zaman damgası dönüştürücü.', path: '/tools/epoch', icon: '⏰', color: 'text-brand-blue hover:shadow-blue-500/20' },
    { name: 'JSON Formatter', desc: 'JSON verilerini güzelleştirin.', path: '/tools/json', icon: '💻', color: 'text-purple-500 hover:shadow-purple-500/20' },
    { name: 'Base64 Atölyesi', desc: 'Base64 kodlama ve çözme.', path: '/tools/base64', icon: '🛡️', color: 'text-amber-500 hover:shadow-amber-500/20' },
    { name: 'Hicri Dönüştürücü', desc: 'Hicri ve Miladi takvim dönüşümü.', path: '/tools/hicri', icon: '🌙', color: 'text-green-500 hover:shadow-green-500/20' },
    { name: 'İnteraktif Terminal', desc: 'Web sitesini komut satırından deneyimleyin.', path: '/tools/terminal', icon: '📟', color: 'text-gray-500 hover:shadow-gray-500/20' },
    { name: 'Regex Tester', desc: 'Düzenli ifadeleri test edin ve renklendirin.', path: '/tools/regex', icon: '🔍', color: 'text-brand-blue hover:shadow-blue-500/20' },
    { name: 'JWT Decoder', desc: 'JSON Web Token (JWT) kodlarını çözün.', path: '/tools/jwt', icon: '🔑', color: 'text-purple-500 hover:shadow-purple-500/20' },
    { name: 'URL Codec', desc: 'URL kodlama ve çözme aracı.', path: '/tools/url', icon: '🔗', color: 'text-brand-blue hover:shadow-blue-500/20' },
    { name: 'Code Diff Slider', desc: 'Kod karşılaştırma sürgüsü.', path: '/tools/code-diff', icon: '📊', color: 'text-amber-500 hover:shadow-amber-500/20' },
    { name: 'Canlı Aktivite Paneli', desc: 'Blog anlık okuma hareketlerini canlı izleyin.', path: '/live-dashboard', icon: '📡', color: 'text-green-500 hover:shadow-green-500/20' },
  ];

  const games = [
    { name: 'Adam Asmaca', desc: 'Klasik kelime tahmin oyunu.', path: '/game/hangman', icon: '💀', color: 'text-gray-600 hover:shadow-gray-500/20' },
    { name: 'Mayın Tarlası', desc: 'Dikkatli ol, mayınlara basma!', path: '/game/minesweeper', icon: '💣', color: 'text-gray-600 hover:shadow-gray-500/20' },
    { name: 'Taş Kağıt Makas', desc: 'Klasik strateji oyunu.', path: '/game/rock', icon: '✊', color: 'text-gray-600 hover:shadow-gray-500/20' },
    { name: 'Yılan Oyunu', desc: 'Yılanı büyüt ve rekorları kır!', path: '/game/snake', icon: '🐉', color: 'text-gray-600 hover:shadow-gray-500/20' },
    { name: 'Hafıza Oyunu', desc: 'Kartları eşleştir, hafızanı test et.', path: '/game/memory', icon: '🧠', color: 'text-gray-600 hover:shadow-gray-500/20' },
  ];

  return (
    <PageTransition>
      <div className="bg-white dark:bg-zinc-950 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white">Uygulama Merkezi</h1>
            <p className="mt-4 text-lg text-zinc-550 dark:text-zinc-400 max-w-2xl mx-auto">
              Geliştirdiğim araçları, oyunları ve mini projeleri burada bulabilirsiniz.
            </p>
          </div>

          {/* ARAÇLAR */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">Araçlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {apps.map((app, index) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link href={app.path} className="group block h-full">
                    <div className={`bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${app.color}`}>
                      <div className="text-4xl mb-4">{app.icon}</div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{app.name}</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 leading-relaxed">{app.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* OYUNLAR */}
          <div>
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">Oyunlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {games.map((app, index) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={app.path} className="group block h-full">
                    <div className={`bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${app.color}`}>
                      <div className="text-4xl mb-4">{app.icon}</div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{app.name}</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 leading-relaxed">{app.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 min-h-[160px]">
                <div className="text-4xl mb-4 text-zinc-400">⏳</div>
                <h3 className="font-bold text-zinc-450 dark:text-zinc-500 text-lg">Yeni Fikirler</h3>
                <p className="text-zinc-400 dark:text-zinc-650 text-sm mt-1">Takipte kalın!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
