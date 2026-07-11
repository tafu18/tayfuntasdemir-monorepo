'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Search, ShieldAlert, AlignLeft, List } from 'lucide-react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('[a-zA-Z]+');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Merhaba Dunya! Welcome to 2026!');
  const [error, setError] = useState('');
  const [highlightedHtml, setHighlightedHtml] = useState('');
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    setError('');
    setHighlightedHtml(testText);
    setMatches([]);

    if (!pattern) return;

    try {
      const regex = new RegExp(pattern, flags);
      const allMatches: any[] = [];

      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          allMatches.push(match);
        }
      } else {
        const match = regex.exec(testText);
        if (match) allMatches.push(match);
      }

      setMatches(allMatches);

      if (allMatches.length > 0) {
        let lastIndex = 0;
        let html = '';
        allMatches.forEach((m) => {
          const start = m.index;
          const end = start + m[0].length;
          html += testText.substring(lastIndex, start);
          html += `<span class="bg-yellow-250 dark:bg-yellow-800/60 text-zinc-950 dark:text-white px-0.5 rounded font-bold border-b-2 border-yellow-500">${testText.substring(start, end)}</span>`;
          lastIndex = end;
        });
        html += testText.substring(lastIndex);
        setHighlightedHtml(html);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [pattern, flags, testText]);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-650 dark:bg-blue-950/30 dark:text-brand-blue">
            Regex Tester & Matcher
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            Regex <span className="bg-gradient-to-r from-brand-blue to-sky-650 bg-clip-text text-transparent">Tester</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Düzenli ifadelerinizi (Regular Expressions) test edin, renklendirin ve hataları giderin.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-brand-blue" /> Regex İfadesi
              </h2>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-3 text-zinc-400 font-mono">/</span>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="[a-z]+"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-6 pr-6 py-2.5 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                  <span className="absolute right-3.5 top-3 text-zinc-400 font-mono">/</span>
                </div>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="g"
                  className="w-16 rounded-xl border border-zinc-200 bg-zinc-50/50 px-2 py-2.5 font-mono text-sm text-center focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-purple-500" /> Test Metni & Eşleşmeler
              </h2>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Test etmek istediğiniz metni buraya yazın..."
                className="w-full h-48 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 min-h-[100px] font-mono text-sm whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950">
                <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <List className="h-5 w-5 text-brand-blue" /> Eşleşmeler ({matches.length})
              </h2>
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px] pr-1">
                {matches.length > 0 ? (
                  matches.map((m, idx) => (
                    <div key={idx} className="p-3 border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl space-y-1">
                      <div className="flex justify-between text-xs font-bold text-blue-650 dark:text-brand-blue">
                        <span>Eşleşme #{idx + 1}</span>
                        <span className="text-zinc-400">İndeks: {m.index}-{m.index + m[0].length}</span>
                      </div>
                      <div className="font-mono text-sm text-zinc-800 dark:text-zinc-200 break-all">{m[0]}</div>
                    </div>
                  ))
                ) : (
                  <span className="text-zinc-400 text-sm">Eşleşme bulunamadı.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
