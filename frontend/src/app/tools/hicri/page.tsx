'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Calendar, Moon } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function HicriConverter() {
  const [gregDate, setGregDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });
  const [hicriResult, setHicriResult] = useState('');

  const convertGregToHicri = () => {
    try {
      const date = new Date(gregDate.year, gregDate.month - 1, gregDate.day);
      if (isNaN(date.getTime())) {
        setHicriResult('Geçersiz tarih girişi.');
        return;
      }

      // Convert using native Intl API
      const formatter = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      setHicriResult(formatter.format(date));
    } catch {
      setHicriResult('Dönüştürme hatası.');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-650 dark:bg-emerald-950/30 dark:text-emerald-400">
            Takvim Dönüştürücü
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            Hicri <span className="bg-gradient-to-r from-emerald-600 to-green-650 bg-clip-text text-transparent">Dönüştürücü</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Miladi ve Hicri takvim tarihleri arasında hızlı dönüşüm yapın.
          </p>
        </header>

        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" /> Miladi Tarih Girin
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Gün</label>
              <input
                type="number"
                value={gregDate.day}
                onChange={(e) => setGregDate({ ...gregDate, day: Number(e.target.value) })}
                className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Ay</label>
              <input
                type="number"
                value={gregDate.month}
                onChange={(e) => setGregDate({ ...gregDate, month: Number(e.target.value) })}
                className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Yıl</label>
              <input
                type="number"
                value={gregDate.year}
                onChange={(e) => setGregDate({ ...gregDate, year: Number(e.target.value) })}
                className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={convertGregToHicri}
            className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            Hicri Tarihe Dönüştür
          </button>

          {hicriResult && (
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl text-center space-y-2">
              <span className="text-xs text-zinc-450 uppercase font-semibold flex items-center justify-center gap-1">
                <Moon className="h-4 w-4 text-emerald-500" /> Hicri Tarih Sonucu
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-2">
                {hicriResult}
              </div>
            </div>
          )}
        </div>

        <OtherTools />
      </div>
    </PageTransition>
  );
}
