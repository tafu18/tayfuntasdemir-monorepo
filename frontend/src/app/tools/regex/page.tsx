'use client';

import { useState, useEffect, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import { Terminal, Search } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function RegexTester() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Merhaba, iletisim@vaktihuzur.com.tr adresi uzerinden veya tayfu.tasdemir@gmail.com mail adresinden ulasabilirsiniz.');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [matches, setMatches] = useState<any[]>([]);

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const runRegexTest = useCallback(() => {
    setErrorMsg('');
    setHighlightedText(escapeHtml(text));
    setMatches([]);

    if (!pattern) return;

    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches = [];
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          foundMatches.push(match);
        }
      } else {
        const match = regex.exec(text);
        if (match) foundMatches.push(match);
      }

      if (foundMatches.length > 0) {
        setMatches(foundMatches);

        let hlText = '';
        let lastIndex = 0;

        foundMatches.forEach((match) => {
          const matchText = match[0];
          const startIndex = match.index;
          const endIndex = startIndex + matchText.length;

          hlText += escapeHtml(text.substring(lastIndex, startIndex));
          hlText += `<span class="match-highlight">${escapeHtml(matchText)}</span>`;
          lastIndex = endIndex;
        });

        hlText += escapeHtml(text.substring(lastIndex));
        setHighlightedText(hlText);
      } else {
        setHighlightedText(escapeHtml(text));
        setMatches([]);
      }
    } catch (e: any) {
      setErrorMsg('Regex Hatası: ' + e.message);
      setHighlightedText(escapeHtml(text));
      setMatches([]);
    }
  }, [pattern, flags, text]);

  useEffect(() => {
    runRegexTest();
  }, [runRegexTest]);

  return (
    <PageTransition>
      <div className="regex-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        
        <style dangerouslySetInnerHTML={{__html: `
          .regex-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(79, 70, 229, 0.08); color: #4f46e5; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .regex-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .regex-card { background: #09090b; border-color: #27272a; }
          .regex-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #4f46e5, #0ea5e9); }
          .regex-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .regex-toolbar { background: #18181b; border-color: #27272a; }
          
          .regex-dots { display: flex; gap: 6px; }
          .regex-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .regex-dots span:nth-child(1) { background: #ef4444; }
          .regex-dots span:nth-child(2) { background: #f59e0b; }
          .regex-dots span:nth-child(3) { background: #22c55e; }
          
          .regex-highlight-area { min-height: 150px; white-space: pre-wrap; word-wrap: break-word; font-family: 'JetBrains Mono', monospace; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; background: #fafafa; font-size: 0.88rem; color: #0f172a; }
          .dark .regex-highlight-area { background: #18181b; border-color: #27272a; color: #f8fafc; }
          
          .match-highlight { background-color: #c7d2fe; border-bottom: 2px solid #6366f1; border-radius: 2px; color: #312e81; font-weight: bold; }
          .dark .match-highlight { background-color: rgba(99,102,241,0.2); color: #818cf8; border-color: #818cf8; }
          
          .group-highlight { background-color: #fef08a; border-bottom: 2px solid #eab308; border-radius: 2px; color: #713f12; font-weight: bold; }
          .dark .group-highlight { background-color: rgba(234,179,8,0.2); color: #fde047; border-color: #fde047; }
        `}} />

        <div className="max-w-[850px] mx-auto w-full">
          
          <header className="text-center mb-12 mt-4">
            <div className="regex-badge">
              <Terminal className="w-3.5 h-3.5" /> Geliştirici Araçları
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,5vw,3.2rem)] text-slate-900 dark:text-white mb-3 tracking-tight">
              <span className="bg-gradient-to-br from-indigo-600 to-sky-500 bg-clip-text text-transparent">Regex Tester</span> & Matcher
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[1.05rem] max-w-[520px] mx-auto">
              Düzenli ifadelerinizi (Regex) gerçek zamanlı olarak test edin ve eşleşen grupları analiz edin.
            </p>
          </header>

          <div className="regex-card mb-12">
            <div className="regex-toolbar">
              <div className="regex-dots"><span></span><span></span><span></span></div>
              <div className="text-xs font-semibold text-slate-500 select-none flex items-center gap-1.5"><Search className="w-3 h-3" /> Regular Expression Engine</div>
            </div>

            <div className="p-8">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Düzenli İfade (Regular Expression)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-mono text-lg font-bold">/</span>
                    <input 
                      type="text" 
                      className="pl-8 pr-8 py-3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="[a-zA-Z0-9]+" 
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                    />
                    <span className="absolute right-4 text-slate-400 font-mono text-lg font-bold">/</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bayraklar (Flags)</label>
                  <input 
                    type="text" 
                    className="py-3 px-4 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-center"
                    placeholder="gim" 
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Test Edilecek Metin (Test String)</label>
                <textarea 
                  rows={5} 
                  className="py-3 px-4 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Metninizi buraya yapıştırın..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Eşleşme Önizleme (Highlighted Output)</label>
                  <div 
                    className="regex-highlight-area"
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                  ></div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Eşleşen Gruplar & Ayrıntılar (<span className="text-indigo-500">{matches.length}</span> eşleşme)</label>
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50 dark:bg-zinc-900 max-h-[250px] overflow-y-auto text-xs font-mono space-y-3">
                    {matches.length === 0 ? (
                      <span className="text-slate-400 dark:text-slate-500">Eşleşme bulunamadı.</span>
                    ) : (
                      matches.map((match, idx) => (
                        <div key={idx} className="p-3 bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-lg shadow-sm">
                          <div className="flex justify-between font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                            <span>Eşleşme #{idx + 1}</span>
                            <span className="text-slate-400 dark:text-slate-500">İndeks: {match.index}-{match.index + match[0].length}</span>
                          </div>
                          <div className="text-slate-800 dark:text-slate-200 font-semibold break-all bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded">
                            {match[0]}
                          </div>
                          {match.length > 1 && (
                            <div className="mt-2 pl-3 border-l-2 border-amber-400 dark:border-amber-500 text-slate-500 dark:text-slate-400 space-y-1">
                              {Array.from(match).slice(1).map((groupStr: any, gIdx) => (
                                <div key={gIdx} className="break-all">Grup #{gIdx + 1}: <span className="group-highlight px-1">{groupStr || ''}</span></div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>

          <OtherTools />

        </div>
      </div>
    </PageTransition>
  );
}
