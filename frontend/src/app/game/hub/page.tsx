'use client';

import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Gamepad2, Skull, RefreshCw, Layers, Grid } from 'lucide-react';

export default function GameHub() {
  const games = [
    {
      name: 'Yılan Oyunu (Snake)',
      description: 'Klasik yılan oyunu. Yemi ye, yılanı büyüt ve yüksek skora ulaşmaya çalış!',
      path: '/game/snake',
      icon: <Gamepad2 className="h-6 w-6" />,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      name: 'Adam Asmaca (Hangman)',
      description: 'Gizli Türkçe kelimeleri harf harf tahmin etmeye çalış. Adam asılmadan kelimeyi bul!',
      path: '/game/hangman',
      icon: <Skull className="h-6 w-6" />,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
    },
    {
      name: 'Mayın Tarlası',
      description: 'Hücreleri aç, sayıları takip et ve tüm mayınları bulup temizlemeye çalış.',
      path: '/game/minesweeper',
      icon: <Grid className="h-6 w-6" />,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    },
    {
      name: 'Hafıza Oyunu',
      description: 'Kartları çevir, çiftleri bul ve en az hamle ile hafıza testini tamamla.',
      path: '/game/memory',
      icon: <Layers className="h-6 w-6" />,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
    },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">Oyun Salonu</h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Tarayıcınız üzerinden doğrudan oynayabileceğiniz eğlenceli ve nostaljik mini oyunlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow flex items-start space-x-5"
            >
              <div className={`p-4 rounded-xl shrink-0 ${game.color}`}>
                {game.icon}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{game.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{game.description}</p>
                <div className="pt-3">
                  <Link
                    href={game.path}
                    className="inline-flex items-center text-sm font-semibold text-indigo-650 hover:underline dark:text-indigo-400"
                  >
                    Hemen Oyna &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
