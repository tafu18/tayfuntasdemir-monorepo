'use client';

import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import { 
  Code2, Play, Copy, Trash2, Eye, FileCode, 
  Maximize2, Minimize2, LayoutGrid, Terminal as TerminalIcon, ShieldCheck, Loader2
} from 'lucide-react';

type SupportedLanguage = 'html' | 'javascript' | 'python';

interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  badge: string;
  iconColor: string;
  defaultCode: string;
}

const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  html: {
    id: 'html',
    name: 'HTML / CSS / JS',
    badge: 'Web',
    iconColor: '#f97316',
    defaultCode: `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f172a, #1e1b4b);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(16px);
      padding: 2.5rem;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.12);
      max-width: 440px;
      width: 100%;
    }
    h1 { margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 800; }
    p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; }
    button {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      border: none;
      padding: 0.8rem 1.5rem;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transition: all 0.2s ease;
    }
    button:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="card">
    <h1>HTML & CSS Canlı Önizleme</h1>
    <p>Kodlarınızı yazın ve sonucu anında canlı görün.</p>
    <button onclick="alert('Kod başarıyla çalıştı!')">Test Et</button>
  </div>
</body>
</html>`
  },
  python: {
    id: 'python',
    name: 'Python',
    badge: 'Python 3',
    iconColor: '#3b82f6',
    defaultCode: `# Python Canlı Kod Alanı
import math

def generate_fibonacci(n):
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

print("🚀 Python Çalıştırma Alanı")
print("Fibonacci Serisi (İlk 10 terim):", generate_fibonacci(10))
print("Pi Sayısı Hesabı:", math.pi)

dizi = [15, 42, 8, 23, 16, 4]
print("Sıralanmış Liste:", sorted(dizi))
`
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    badge: 'JS Engine',
    iconColor: '#eab308',
    defaultCode: `// JavaScript Canlı Kod Alanı
console.log("⚡ JavaScript Çalışıyor...");

const users = [
  { id: 1, name: "Ahmet", role: "Developer" },
  { id: 2, name: "Ayşe", role: "Designer" },
  { id: 3, name: "Mehmet", role: "Manager" }
];

console.table(users);

const sum = (a, b) => a + b;
console.log("Toplam (25 + 17):", sum(25, 17));
`
  }
};

export default function MultiCompiler() {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('html');
  const [code, setCode] = useState(LANGUAGES.html.defaultCode);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [srcDoc, setSrcDoc] = useState('');
  const [autoRun, setAutoRun] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  // Focus Modes
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isFullWidth, setIsFullWidth] = useState(false);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    setCode(LANGUAGES[lang].defaultCode);
    setConsoleOutput('');
    setSrcDoc('');
  };

  useEffect(() => {
    if (selectedLang === 'html' && autoRun) {
      const timeout = setTimeout(() => {
        setSrcDoc(code);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [code, autoRun, selectedLang]);

  const runCode = async () => {
    setIsExecuting(true);
    setConsoleOutput('');

    try {
      if (selectedLang === 'html') {
        setSrcDoc(code);
      } 
      else if (selectedLang === 'javascript') {
        let logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          table: (data: any) => logs.push(JSON.stringify(data, null, 2)),
          error: (...args: any[]) => logs.push('❌ Hata: ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('⚠️ Uyarı: ' + args.join(' '))
        };

        const runFn = new Function('console', code);
        runFn(customConsole);
        setConsoleOutput(logs.join('\n') || 'Program başarıyla çalıştı.');
      }
      else if (selectedLang === 'python') {
        setConsoleOutput('Python çalıştırılıyor...');
        
        if (!(window as any).pyodide) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('Python (Pyodide) kütüphanesi yüklenemedi.'));
            document.head.appendChild(script);
          });
          (window as any).pyodide = await (window as any).loadPyodide();
        }

        const pyodide = (window as any).pyodide;
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
        `);

        await pyodide.runPythonAsync(code);
        const output = pyodide.runPython('sys.stdout.getvalue()');
        setConsoleOutput(output || 'Program tamamlandı.');
      }
    } catch (err: any) {
      setConsoleOutput(`❌ Hata:\n${err.message || err}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Kod panoya kopyalandı!');
  };

  const handleClear = () => {
    if (confirm('Kodları temizlemek istediğinize emin misiniz?')) {
      setCode('');
      setConsoleOutput('');
      setSrcDoc('');
    }
  };

  return (
    <PageTransition>
      <div className="html-viewer-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-8 px-4 sm:px-6 transition-all duration-300">
        
        <style dangerouslySetInnerHTML={{__html: `
          .tool-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99, 102, 241, 0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1rem; }
          .tool-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; transition: all 0.3s ease; }
          .dark .tool-card { background: #09090b; border-color: #27272a; }
          .tool-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #a855f7); }
          .tool-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.85rem 1.5rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .tool-toolbar { background: #18181b; border-color: #27272a; }
          
          .tool-dots { display: flex; gap: 6px; align-items: center; }
          .tool-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .tool-dots span:nth-child(1) { background: #ef4444; }
          .tool-dots span:nth-child(2) { background: #f59e0b; }
          .tool-dots span:nth-child(3) { background: #22c55e; }

          .focus-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.75rem; border-radius: 10px; font-size: 0.75rem; font-weight: 700; color: #64748b; background: transparent; border: 1px solid #cbd5e1; cursor: pointer; transition: all 0.2s ease; }
          .dark .focus-btn { color: #a1a1aa; border-color: #3f3f46; }
          .focus-btn:hover { color: #6366f1; border-color: #6366f1; background: rgba(99, 102, 241, 0.06); }
          .focus-btn.active { color: #ffffff; background: #6366f1; border-color: #6366f1; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
          
          .code-textarea { background-color: #fafafa; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; width: 100%; height: 100%; min-height: 520px; resize: vertical; }
          .dark .code-textarea { background: #18181b; border-color: #27272a; color: #f4f4f5; }
          .code-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12); }

          .console-output-box { background: #0f172a; color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; padding: 1.25rem; border-radius: 16px; width: 100%; height: 100%; min-height: 520px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; border: 1px solid #1e293b; }
          
          .lang-tab-btn { padding: 0.6rem 1.1rem; border-radius: 12px; font-weight: 700; font-size: 0.82rem; border: 1px solid #e2e8f0; background: #ffffff; color: #64748b; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; }
          .dark .lang-tab-btn { background: #18181b; border-color: #27272a; color: #a1a1aa; }
          .lang-tab-btn.active { background: #6366f1; border-color: #6366f1; color: #ffffff; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
        `}} />

        <div className={`${isFullWidth ? 'max-w-full px-2' : 'max-w-[1400px]'} mx-auto w-full transition-all duration-300`}>
          
          {/* Header */}
          <header className="text-center mb-8 mt-2">
            <div className="tool-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> %100 Güvenli & Hızlı
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(1.8rem,4vw,3rem)] text-slate-900 dark:text-white mb-2 tracking-tight">
              Çoklu Dil <span className="bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">Canlı Kod Stüdyosu</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-[620px] mx-auto">
              HTML, Python, PHP, JavaScript ve SQL kodlarınızı anında canlı olarak çalıştırın ve test edin.
            </p>
          </header>

          {/* Language Selector Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((langKey) => {
              const langConfig = LANGUAGES[langKey];
              const isActive = selectedLang === langKey;
              return (
                <button
                  key={langKey}
                  onClick={() => handleLanguageChange(langKey)}
                  className={`lang-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langConfig.iconColor }}></span>
                  {langConfig.name}
                </button>
              );
            })}
            
            {/* PHP - Yakında Tab (Disabled) */}
            <div className="relative inline-flex items-center">
              <button
                disabled
                className="lang-tab-btn opacity-60 cursor-not-allowed select-none bg-slate-100 dark:bg-zinc-900 border-dashed border-slate-300 dark:border-zinc-800 text-slate-400 dark:text-zinc-500"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500/50"></span>
                PHP
                <span className="ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                  Yakında
                </span>
              </button>
            </div>
          </div>

          {/* Main Interface Card */}
          <div className="tool-card mb-12">
            
            {/* Toolbar Header */}
            <div className="tool-toolbar">
              <div className="flex items-center gap-3">
                <div className="tool-dots"><span></span><span></span><span></span></div>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 hidden sm:inline-block">
                  {selectedLang.toUpperCase()} Ortamı
                </span>
              </div>

              {/* View Modes & Width Switches */}
              <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-zinc-800/60 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('split')}
                  className={`focus-btn ${viewMode === 'split' ? 'active' : ''}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> <span className="hidden sm:inline">İkili</span>
                </button>
                <button 
                  onClick={() => setViewMode('editor')}
                  className={`focus-btn ${viewMode === 'editor' ? 'active' : ''}`}
                >
                  <FileCode className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editör</span>
                </button>
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`focus-btn ${viewMode === 'preview' ? 'active' : ''}`}
                >
                  <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Çıktı</span>
                </button>

                <div className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1"></div>

                <button 
                  onClick={() => setIsFullWidth(!isFullWidth)}
                  className={`focus-btn ${isFullWidth ? 'active' : ''}`}
                >
                  {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isFullWidth ? '%100 Açık' : '%100 Genişlik'}</span>
                </button>
              </div>

              {/* Run Action */}
              <button 
                onClick={runCode}
                disabled={isExecuting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Çalıştırılıyor...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Kodu Çalıştır
                  </>
                )}
              </button>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className={`grid gap-6 ${
                viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}>
                
                {/* Left Area: Code Editor */}
                {(viewMode === 'split' || viewMode === 'editor') && (
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-indigo-500" /> Kaynak Kod ({LANGUAGES[selectedLang].name})
                      </span>
                      <div className="flex items-center gap-3">
                        <button onClick={handleCopy} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Kopyala
                        </button>
                        <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Temizle
                        </button>
                      </div>
                    </div>

                    <textarea 
                      className="code-textarea" 
                      placeholder={`${LANGUAGES[selectedLang].name} kodlarınızı buraya yazın...`}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Right Area: Output Console or HTML Canvas */}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4 text-purple-500" /> Çıktı / Konsol Paneli
                      </span>
                      <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full">
                        {LANGUAGES[selectedLang].badge}
                      </span>
                    </div>

                    {selectedLang === 'html' ? (
                      <div className="w-full flex flex-col bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-inner h-full min-h-[520px]">
                        <iframe
                          srcDoc={srcDoc}
                          title="output"
                          sandbox="allow-scripts"
                          width="100%"
                          height="100%"
                          className="w-full h-full border-none bg-white flex-grow"
                        />
                      </div>
                    ) : (
                      <div className="console-output-box">
                        {consoleOutput || '// Kodu çalıştırdığınızda çıktılar bu alanda görüntülenecektir.'}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* SSS Bölümü */}
          <FAQ
            title="Sıkça Sorulan Sorular"
            subtitle="Çoklu Dil Canlı Kod Stüdyosu hakkında merak edilenler"
            items={[
              { question: "Kodlarım sunucuya gönderiliyor mu?", answer: "Hayır. Tüm işlemler doğrudan kendi tarayıcınız içinde güvenli şekilde çalıştırılır." },
              { question: "Hangi dilleri test edebilirim?", answer: "HTML/CSS/JS, Python, PHP, JavaScript ve SQL dillerini canlı olarak test edebilirsiniz." }
            ]}
          />

          <OtherTools />

        </div>
      </div>
    </PageTransition>
  );
}

