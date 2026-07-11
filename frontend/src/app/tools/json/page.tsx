'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { AlignLeft, Check, Code, Copy, RefreshCw, Trash } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatJson = (space: number) => {
    setError('');
    if (!inputJson) return;
    try {
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed, null, space));
    } catch (err: any) {
      setError(`Hatalı JSON Formatı: ${err.message}`);
      setOutputJson('');
    }
  };

  const minifyJson = () => {
    setError('');
    if (!inputJson) return;
    try {
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed));
    } catch (err: any) {
      setError(`Hatalı JSON Formatı: ${err.message}`);
      setOutputJson('');
    }
  };

  const copyToClipboard = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setError('');
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-650 dark:bg-purple-950/30 dark:text-purple-400">
            JSON Formatter & Validator
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            JSON <span className="bg-gradient-to-r from-purple-600 to-indigo-650 bg-clip-text text-transparent">Formatter</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            JSON verilerinizi güzelleştirin, minify edin ve hataları bulun.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-purple-500" /> Giriş JSON
              </h2>
              <button
                onClick={clearAll}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1"
              >
                <Trash className="h-3.5 w-3.5" /> Temizle
              </button>
            </div>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="JSON verinizi buraya yapıştırın..."
              className="w-full h-96 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-500" /> Çıkış JSON
              </h2>
              {outputJson && (
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={outputJson}
              placeholder="Biçimlendirilmiş veri burada görünecektir..."
              className="w-full h-96 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white cursor-text"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap justify-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
          <button
            onClick={() => formatJson(2)}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            2 Boşluk Güzelleştir
          </button>
          <button
            onClick={() => formatJson(4)}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            4 Boşluk Güzelleştir
          </button>
          <button
            onClick={minifyJson}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            Minify Et (Tek Satır)
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-650 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
