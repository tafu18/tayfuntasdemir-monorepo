'use client';

import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Columns, Eye, EyeOff } from 'lucide-react';

export default function CodeDiffSlider() {
  const [beforeCode, setBeforeCode] = useState(
    `function calculateSum(a, b) {\n  var result = a + b;\n  return result;\n}`
  );
  const [afterCode, setAfterCode] = useState(
    `const calculateSum = (a, b) => {\n  return a + b;\n};`
  );
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-650 dark:bg-amber-950/30 dark:text-amber-400">
            Code Diff Slider
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            Code Diff <span className="bg-gradient-to-r from-amber-600 to-orange-655 bg-clip-text text-transparent">Slider</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Eski ve yeni kod bloklarını dikey sürgüyü kaydırarak pürüzsüzce karşılaştırın.
          </p>
        </header>

        {/* Input Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Öncesi (Before / Deleted)</label>
              <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Kırmızı Çıkarılan
              </span>
            </div>
            <textarea
              value={beforeCode}
              onChange={(e) => setBeforeCode(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-150 p-4 font-mono text-xs focus:outline-none dark:border-zinc-800"
              placeholder="Eski kod..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Sonrası (After / Added)</label>
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Yeşil Eklenen
              </span>
            </div>
            <textarea
              value={afterCode}
              onChange={(e) => setAfterCode(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-150 p-4 font-mono text-xs focus:outline-none dark:border-zinc-800"
              placeholder="Yeni kod..."
            />
          </div>
        </div>

        {/* Interactive Comparison Slider */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Sürgülü Karşılaştırma Önizlemesi (Sürgüyü Kaydırın)
          </label>
          <div
            ref={containerRef}
            className="relative h-64 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950 select-none"
          >
            {/* Background Layer: After Code (Visible on the right side) */}
            <div className="absolute inset-0 p-6 font-mono text-xs text-emerald-400 overflow-auto whitespace-pre bg-zinc-950">
              {afterCode}
            </div>

            {/* Clipping Layer: Before Code (Visible on the left side) */}
            <div
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              className="absolute inset-0 p-6 font-mono text-xs text-red-400 overflow-auto whitespace-pre bg-zinc-900 border-r-2 border-amber-500 transition-all duration-75"
            >
              {beforeCode}
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
              className="absolute top-0 bottom-0 w-1 bg-amber-500 pointer-events-none transform -translate-x-1/2 z-20 flex items-center justify-center"
            >
              <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                &harr;
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
