'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import { Code2, Play, Copy, Trash2, Sparkles, Eye, FileCode } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

const defaultHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    h1 { margin-top: 0; font-size: 1.8rem; }
    button {
      background: #ffffff;
      color: #6366f1;
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Canlı Önizleme Alanı</h1>
    <p>Kodlarınızı sol taraftan düzenleyin, sonucu anında görün!</p>
    <button onclick="showAlert()">Tıkla Bana</button>
  </div>
  <script>
    function showAlert() {
      alert('Harika! HTML Viewer başarıyla çalışıyor.');
    }
  </script>
</body>
</html>`;

export default function HtmlViewer() {
  const [code, setCode] = useState(defaultHtml);
  const [srcDoc, setSrcDoc] = useState('');
  const [autoRun, setAutoRun] = useState(true);

  // Canlı derleme/güncelleme mantığı
  useEffect(() => {
    if (autoRun) {
      const timeout = setTimeout(() => {
        setSrcDoc(code);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [code, autoRun]);

  const handleRun = () => {
    setSrcDoc(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Kodlar panoya kopyalandı!');
  };

  const handleClear = () => {
    if (confirm('Kodları temizlemek istediğinize emin misiniz?')) {
      setCode('');
      setSrcDoc('');
    }
  };

  const handleReset = () => {
    setCode(defaultHtml);
  };

  return (
    <PageTransition>
      <div className="html-viewer-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        
        <style dangerouslySetInnerHTML={{__html: `
          .tool-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99, 102, 241, 0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .tool-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .tool-card { background: #09090b; border-color: #27272a; }
          .tool-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #a855f7); }
          .tool-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .tool-toolbar { background: #18181b; border-color: #27272a; }
          
          .tool-dots { display: flex; gap: 6px; }
          .tool-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .tool-dots span:nth-child(1) { background: #ef4444; }
          .tool-dots span:nth-child(2) { background: #f59e0b; }
          .tool-dots span:nth-child(3) { background: #22c55e; }
          
          .code-textarea { background-color: #fafafa; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; width: 100%; resize: vertical; }
          .dark .code-textarea { background: #18181b; border-color: #27272a; color: #f4f4f5; }
          .code-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        `}} />

        <div className="max-w-[1200px] mx-auto w-full">
          
          {/* Header */}
          <header className="text-center mb-12 mt-4">
            <div className="tool-badge">
              <Code2 className="w-3.5 h-3.5" /> Geliştirici Stüdyosu
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,5vw,3.2rem)] text-slate-900 dark:text-white mb-3 tracking-tight">
              HTML Viewer & <span className="bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">Live Compiler</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[1.05rem] max-w-[560px] mx-auto">
              HTML, CSS ve JavaScript kodlarınızı tarayıcınızda güvenle derleyin, çıktıları anında canlı önizleme ekranında görün.
            </p>
          </header>

          {/* Main Interface Card */}
          <div className="tool-card mb-12">
            <div className="tool-toolbar">
              <div className="tool-dots"><span></span><span></span><span></span></div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={autoRun} 
                    onChange={(e) => setAutoRun(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Canlı Çalıştır (Auto-Run)
                </label>
                {!autoRun && (
                  <button 
                    onClick={handleRun}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Çalıştır
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Sol Alan: Kod Editörü */}
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-indigo-500" /> Kaynak Kod (HTML / CSS / JS)
                    </span>
                    <div className="flex items-center gap-3">
                      <button onClick={handleReset} className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition">
                        Varsayılan
                      </button>
                      <button onClick={handleCopy} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Kopyala
                      </button>
                      <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Temizle
                      </button>
                    </div>
                  </div>

                  <textarea 
                    rows={22} 
                    className="code-textarea" 
                    placeholder="HTML, CSS veya JS kodlarınızı buraya yazın..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                  />
                  
                  <div className="text-xs text-slate-400 dark:text-slate-500 flex justify-between px-1">
                    <span>İpucu: Stil için &lt;style&gt;, betikler için &lt;script&gt; etiketlerini kullanabilirsiniz.</span>
                    <span>Karakter: {code.length}</span>
                  </div>
                </div>

                {/* Sağ Alan: Canlı Önizleme Ekranı */}
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" /> Canlı Çıktı Önizlemesi
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                    </span>
                  </div>

                  <div className="w-full flex-grow bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden min-h-[450px] shadow-inner relative">
                    <iframe
                      srcDoc={srcDoc}
                      title="output"
                      sandbox="allow-scripts"
                      width="100%"
                      height="100%"
                      className="w-full h-full border-none bg-white"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SSS Bölümü */}
          <FAQ
            title="HTML Viewer SSS"
            subtitle="Canlı derleyici ve tarayıcı tabanlı kod çalıştırma hakkında merak edilenler"
            items={[
              { question: "HTML Viewer & Compiler tam olarak ne işe yarar?", answer: "Yazdığınız HTML, CSS ve JavaScript kodlarını sunucuya ihtiyaç duymadan, doğrudan tarayıcınızın içinde güvenli bir sandbox ortamında anında çalıştırıp test etmenizi sağlar." },
              { question: "Yazdığım kodlar kaydediliyor mu veya sunucuya gidiyor mu?", answer: "Hayır. Tüm işlemler tamamen sizin tarayıcınızda (istemci tarafında) gerçekleşir. Kodlarınız hiçbir şekilde harici sunuculara kaydedilmez veya gönderilmez." },
              { question: "Harici kütüphaneler (Bootstrap, Tailwind, jQuery vb.) kullanabilir miyim?", answer: "Evet! <head> etiketleri arasına CDN bağlantılarını (örn. Tailwind CSS veya FontAwesome CDN) ekleyerek harici kütüphaneleri anında kullanabilirsiniz." }
            ]}
          />

          <OtherTools />

        </div>
      </div>
    </PageTransition>
  );
}