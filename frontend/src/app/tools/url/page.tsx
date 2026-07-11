'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { AlignLeft, Link2, Trash, Check, Copy } from 'lucide-react';

export default function UrlCodec() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encodeUrl = () => {
    setError('');
    try {
      setOutputText(encodeURIComponent(inputText));
    } catch {
      setError('URL kodlanırken hata oluştu.');
    }
  };

  const decodeUrl = () => {
    setError('');
    try {
      setOutputText(decodeURIComponent(inputText));
    } catch {
      setError('Geçersiz URL formatı veya çözme hatası.');
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-650 dark:bg-blue-950/30 dark:text-brand-blue">
            URL Codec
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            URL <span className="bg-gradient-to-r from-brand-blue to-brand-dark bg-clip-text text-transparent">Codec</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            URL karakterlerinizi güvenli bir şekilde kodlayın veya kodları çözün.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Link2 className="h-5 w-5 text-brand-blue" /> Giriş Metni / URL
              </h2>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              >
                Temizle
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Kodlamak veya çözmek istediğiniz URL metnini buraya yapıştırın..."
              className="w-full h-80 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Sonuç
              </h2>
              {outputText && (
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-brand-blue" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Sonuç burada görüntülenecektir..."
              className="w-full h-80 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white cursor-text"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap justify-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
          <button
            onClick={encodeUrl}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            URL Kodla (Encode)
          </button>
          <button
            onClick={decodeUrl}
            className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            URL Çöz (Decode)
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
