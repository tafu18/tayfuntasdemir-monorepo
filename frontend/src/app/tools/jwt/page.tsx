'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { AlignLeft, Key, ShieldAlert } from 'lucide-react';

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decodedHeader, setDecodedHeader] = useState('');
  const [decodedPayload, setDecodedPayload] = useState('');
  const [error, setError] = useState('');

  const decodeJwt = () => {
    setError('');
    setDecodedHeader('');
    setDecodedPayload('');

    if (!token) return;

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setError('Geçersiz JWT formatı. Token üç bölümden (Header.Payload.Signature) oluşmalıdır.');
      return;
    }

    try {
      const headerDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const payloadDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));

      setDecodedHeader(JSON.stringify(JSON.parse(headerDecoded), null, 2));
      setDecodedPayload(JSON.stringify(JSON.parse(payloadDecoded), null, 2));
    } catch {
      setError('Token çözümlenirken hata oluştu. Lütfen geçerli bir Base64Url token girin.');
    }
  };

  const clearAll = () => {
    setToken('');
    setDecodedHeader('');
    setDecodedPayload('');
    setError('');
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-650 dark:bg-purple-950/30 dark:text-purple-400">
            JWT Decoder
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            JWT <span className="bg-gradient-to-r from-purple-600 to-indigo-650 bg-clip-text text-transparent">Decoder</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            JSON Web Token (JWT) kodlarınızı anında çözün ve içeriğini inceleyin.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-500" /> Token Girin
                </h2>
                <button
                  onClick={clearAll}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                >
                  Temizle
                </button>
              </div>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJh..."
                className="w-full h-80 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
              <button
                onClick={decodeJwt}
                className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
              >
                Çözümle (Decode)
              </button>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
            </div>
          </div>

          {/* Decoded Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-indigo-650 dark:text-indigo-400 uppercase mb-2">Header (Üstbilgi)</h3>
                <pre className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl font-mono text-xs overflow-x-auto text-zinc-800 dark:text-zinc-250 min-h-[80px]">
                  {decodedHeader || 'Header çözümlendiğinde burada görünecektir.'}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-650 dark:text-indigo-400 uppercase mb-2">Payload (Veri/İçerik)</h3>
                <pre className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl font-mono text-xs overflow-x-auto text-zinc-800 dark:text-zinc-250 min-h-[160px]">
                  {decodedPayload || 'Payload çözümlendiğinde burada görünecektir.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
