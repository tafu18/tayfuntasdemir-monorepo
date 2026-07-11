'use client';

import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Columns, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import OtherTools from '@/components/OtherTools';

export default function CodeDiffSlider() {
  const [beforeCode, setBeforeCode] = useState(`// BEFORE: Spagetti Controller, N+1 Query Problem & Fat Controller
public function index() {
    $users = User::where('status', 'active')->get();
    foreach ($users as $user) {
        // N+1 Query trigger inside loop
        $user->profile = Profile::where('user_id', $user->id)->first();
        $user->posts_count = Post::where('user_id', $user->id)->count();
    }
    return view('users', ['users' => $users]);
}`);

  const [afterCode, setAfterCode] = useState(`// AFTER: Clean Code, Eager Loading (No N+1) & Query Scopes
public function index() {
    // Clean, optimized query with eager loading and model scopes
    $users = User::active()->with('profile')->withCount('posts')->get();
    return view('users', compact('users'));
}`);

  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beforeContainerRef = useRef<HTMLDivElement | null>(null);
  const afterContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync scroll between before and after panels
  const handleBeforeScroll = () => {
    if (beforeContainerRef.current && afterContainerRef.current) {
      afterContainerRef.current.scrollTop = beforeContainerRef.current.scrollTop;
      afterContainerRef.current.scrollLeft = beforeContainerRef.current.scrollLeft;
    }
  };

  const handleAfterScroll = () => {
    if (beforeContainerRef.current && afterContainerRef.current) {
      beforeContainerRef.current.scrollTop = afterContainerRef.current.scrollTop;
      beforeContainerRef.current.scrollLeft = afterContainerRef.current.scrollLeft;
    }
  };

  const renderCodeWithDiff = (code: string, type: 'before' | 'after') => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      const isDiff = line.trim().startsWith('//') || 
                     line.includes('N+1') || 
                     line.includes('with(') || 
                     line.includes('withCount(') ||
                     line.includes('active()') || 
                     line.includes('User::where') || 
                     line.includes('foreach') || 
                     line.includes('Profile::where') || 
                     line.includes('Post::where');

      const bgClass = isDiff 
        ? (type === 'before' ? 'bg-red-500/15 border-red-500' : 'bg-emerald-500/15 border-emerald-500') 
        : 'border-transparent';
      const numColor = isDiff 
        ? (type === 'before' ? 'text-red-400' : 'text-emerald-450') 
        : 'text-zinc-500';
      const textColor = isDiff
        ? (type === 'before' ? 'text-red-300' : 'text-emerald-200')
        : 'text-zinc-300';

      return (
        <div key={idx} className={`flex px-2 border-l-3 ${bgClass}`}>
          <span className={`w-8 text-right mr-4 select-none text-xs font-mono ${numColor}`}>
            {idx + 1}
          </span>
          <span className={`font-mono text-xs whitespace-pre ${textColor}`}>
            {line || ' '}
          </span>
        </div>
      );
    });
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-650 dark:bg-amber-950/30 dark:text-amber-400">
            Code Diff Slider
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            Görsel Kod <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Karşılaştırma Sürgüsü</span>
          </h1>
          <p className="mt-4 text-zinc-550 dark:text-zinc-400 max-w-lg mx-auto">
            İki farklı kod veya metin bloğunu sürükle-bırak sürgüsüyle görsel olarak karşılaştırın. Öncesi ve sonrası geçişini anlık görün.
          </p>
        </header>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Öncesi (Before)</label>
            <textarea
              value={beforeCode}
              onChange={(e) => setBeforeCode(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-900 text-zinc-150 p-4 font-mono text-xs focus:outline-none dark:border-zinc-800 focus:border-amber-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Sonrası (After)</label>
            <textarea
              value={afterCode}
              onChange={(e) => setAfterCode(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-900 text-zinc-150 p-4 font-mono text-xs focus:outline-none dark:border-zinc-800 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Interactive Comparison Slider */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-zinc-750 dark:text-zinc-300">
            Sürgülü Karşılaştırma Önizlemesi (Sürgüyü Sağa/Sola Kaydırın)
          </label>
          <div
            ref={containerRef}
            className="relative h-80 w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950 select-none shadow-inner"
          >
            {/* Background Layer: After Code (Visible on the right side) */}
            <div
              ref={afterContainerRef}
              onScroll={handleAfterScroll}
              className="absolute inset-0 p-6 overflow-auto bg-zinc-950 space-y-0.5"
            >
              {renderCodeWithDiff(afterCode, 'after')}
            </div>

            {/* Clipping Layer: Before Code (Visible on the left side) */}
            <div
              ref={beforeContainerRef}
              onScroll={handleBeforeScroll}
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              className="absolute inset-0 p-6 overflow-auto bg-zinc-900 border-r-2 border-amber-500 space-y-0.5"
            >
              {renderCodeWithDiff(beforeCode, 'before')}
            </div>

            {/* Custom Interactive Range Input Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />

            {/* Visible vertical handle bar */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 w-1 bg-amber-500 pointer-events-none z-20"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                ↔
              </div>
            </div>
          </div>
        </div>

        {/* Clean Code & SOLID section matching Laravel about cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-150 dark:border-zinc-800 pt-10">
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Clean Code Prensipleri
            </h3>
            <ul className="space-y-3 text-sm text-zinc-550 dark:text-zinc-400">
              <li className="flex gap-2">
                <span className="text-indigo-500">✔</span>
                <strong>Anlamlı İsimlendirmeler:</strong> Değişken ve fonksiyon isimleri amacını doğrudan açıklamalıdır.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">✔</span>
                <strong>Tek Bir İş (KISS):</strong> Her fonksiyon veya modül sadece tek bir amaca hizmet etmelidir.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">✔</span>
                <strong>Kendini Tekrar Etme (DRY):</strong> Aynı kod bloklarını kopyalamak yerine fonksiyonlaştırın veya soyutlayın.
              </li>
            </ul>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" /> SOLID Tasarım Prensipleri
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-650 rounded-xl">
                <span className="font-black block text-sm">S</span>
                <span>Single</span>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-650 rounded-xl">
                <span className="font-black block text-sm">O</span>
                <span>Open-Closed</span>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 rounded-xl">
                <span className="font-black block text-sm">L</span>
                <span>Liskov</span>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-650 rounded-xl">
                <span className="font-black block text-sm">I</span>
                <span>Interface</span>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-650 rounded-xl">
                <span className="font-black block text-sm">D</span>
                <span>Dependency</span>
              </div>
            </div>
          </div>
        </div>

        <OtherTools />
      </div>
    </PageTransition>
  );
}
