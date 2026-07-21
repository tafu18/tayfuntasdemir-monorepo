'use client';

import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import {
  Code, Wand2, Maximize2, Minimize2, Trash, Check, Copy, Download,
  AlertTriangle, Edit3, Network, FlaskConical, Maximize, Minimize
} from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function JsonFormatter() {
  const [rawInput, setRawInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorLine, setErrorLine] = useState(0);
  
  const [lineCount, setLineCount] = useState<number[]>([1]);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedTree, setCopiedTree] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = rawInput.split('\n').length;
    setLineCount(Array.from({ length: lines || 1 }, (_, i) => i + 1));
    parseJson(rawInput);
  }, [rawInput]);

  const parseJson = (text: string) => {
    if (!text.trim()) {
      setParsedData(null);
      setErrorMsg('');
      setErrorLine(0);
      return;
    }
    try {
      const data = JSON.parse(text);
      setParsedData(data);
      setErrorMsg('');
      setErrorLine(0);
    } catch (e: any) {
      setParsedData(null);
      let msg = e.message;
      let line = 0;
      const match = msg.match(/line (\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
      }
      setErrorMsg(msg);
      setErrorLine(line);
    }
  };

  const syncScroll = () => {
    if (editorTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorTextareaRef.current.scrollTop;
    }
  };

  const beautify = () => {
    if (parsedData !== null) {
      setRawInput(JSON.stringify(parsedData, null, 2));
      triggerToast();
    }
  };

  const minify = () => {
    if (parsedData !== null) {
      setRawInput(JSON.stringify(parsedData));
      triggerToast();
    }
  };

  const loadSample = () => {
    const sample = {
      user: {
        id: 101,
        name: "Tayfun Taşdemir",
        active: true,
        skills: ["React", "Laravel", "TailwindCSS"],
        details: null
      }
    };
    setRawInput(JSON.stringify(sample, null, 2));
  };

  const clearAll = () => {
    setRawInput('');
    setParsedData(null);
    setExpandedNodes({});
  };

  const copyOutput = () => {
    if (!rawInput) return;
    navigator.clipboard.writeText(rawInput).then(() => {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
      triggerToast();
    });
  };

  const downloadJson = () => {
    if (!rawInput) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(rawInput);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "formatted.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyFormatted = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2)).then(() => {
        setCopiedTree(true);
        setTimeout(() => setCopiedTree(false), 2000);
        triggerToast();
      });
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawInput(text);
    } catch (e) {
      console.error('Cannot read clipboard');
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const getJsonSize = () => {
    if (!rawInput) return '0 B';
    let bytes = new Blob([rawInput]).size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getKeyCount = (obj: any): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    let count = 0;
    for (let k in obj) {
      count++;
      count += getKeyCount(obj[k]);
    }
    return count;
  };

  const getMaxDepth = (obj: any): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    let depth = 0;
    for (let k in obj) {
      depth = Math.max(depth, getMaxDepth(obj[k]));
    }
    return depth + 1;
  };

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderTree = (data: any, path: string = 'root', isLast: boolean = true) => {
    if (data === null) return <span className="jf-tree-null">null</span>;
    if (typeof data === 'string') return <span className="jf-tree-string">"{data}"</span>;
    if (typeof data === 'number') return <span className="jf-tree-number">{data}</span>;
    if (typeof data === 'boolean') return <span className="jf-tree-bool">{data ? 'true' : 'false'}</span>;

    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const isExpanded = expandedNodes[path] !== false; // Default true
    
    if (keys.length === 0) {
      return <span className="jf-tree-bracket">{isArray ? '[]' : '{}'}</span>;
    }

    return (
      <span className="inline-block">
        <button className="jf-tree-toggle" onClick={() => toggleNode(path)}>
          {isExpanded ? '−' : '+'}
        </button>
        <span className="jf-tree-bracket">{isArray ? '[' : '{'}</span>
        {!isExpanded && (
          <span className="jf-tree-count" onClick={() => toggleNode(path)} style={{cursor:'pointer'}}>
            {keys.length} items
          </span>
        )}
        {isExpanded && (
          <div className="jf-tree-line">
            {keys.map((key, index) => {
              const childPath = path + '-' + key;
              const isChildLast = index === keys.length - 1;
              return (
                <div key={childPath} className="jf-tree-node py-0.5">
                  {!isArray && <span className="jf-tree-key">"{key}": </span>}
                  {renderTree(data[key as any], childPath, isChildLast)}
                  {!isChildLast && <span className="jf-tree-bracket">,</span>}
                </div>
              );
            })}
          </div>
        )}
        <span className="jf-tree-bracket">{isArray ? ']' : '}'}</span>
      </span>
    );
  };

  return (
    <PageTransition>
      <div className={`jf-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-2 sm:px-4 ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto !p-4 bg-white dark:bg-zinc-950' : ''}`}>
        <style dangerouslySetInnerHTML={{__html: `
          .jf-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(139,92,246,0.08); color: #8b5cf6; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .jf-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .jf-header h1 span { background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .jf-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 0.75rem 1.25rem; margin-bottom: 1rem; }
          .dark .jf-toolbar { background: #09090b; border-color: #27272a; }
          .jf-tb-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.5rem 0.9rem; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif; }
          .dark .jf-tb-btn { background: #18181b; border-color: #27272a; color: #a1a1aa; }
          .jf-tb-btn:hover { border-color: #8b5cf6; color: #8b5cf6; background: rgba(139,92,246,0.08); }
          .jf-tb-btn.danger { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.05); }
          .jf-tb-btn.success { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
          .jf-tb-divider { width: 1px; height: 24px; background: #e2e8f0; }
          .dark .jf-tb-divider { background: #27272a; }
          .jf-main { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
          @media (max-width: 768px) { .jf-main { grid-template-columns: 1fr; } }
          .jf-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; min-height: 450px; }
          .dark .jf-panel { background: #09090b; border-color: #27272a; }
          .jf-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.25rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .jf-panel-header { background: #18181b; border-color: #27272a; }
          .jf-sm-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.3rem 0.6rem; font-size: 0.68rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.3rem; }
          .dark .jf-sm-btn { border-color: #27272a; color: #a1a1aa; }
          .jf-sm-btn:hover { border-color: #8b5cf6; color: #8b5cf6; background: rgba(139,92,246,0.08); }
          .jf-editor-wrap { flex: 1; display: flex; overflow: auto; background: #fff; }
          .dark .jf-editor-wrap { background: #000; }
          .jf-editor-wrap.has-error { background: rgba(239,68,68,0.02); }
          .jf-line-numbers { padding: 1.25rem 0; text-align: right; user-select: none; min-width: 44px; background: #f1f5f9; border-right: 1px solid #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; line-height: 1.7; color: #94a3b8; overflow: hidden; }
          .dark .jf-line-numbers { background: #18181b; border-color: #27272a; color: #52525b; }
          .jf-line-num { padding: 0 0.6rem; display: block; }
          .jf-line-num.error-line { background: rgba(239,68,68,0.15); color: #ef4444; font-weight: 700; }
          .jf-editor { flex: 1; width: 100%; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; line-height: 1.7; color: #0f172a; background: transparent; border: none; outline: none; resize: none; tab-size: 2; white-space: pre; overflow-wrap: normal; overflow-x: auto; }
          .dark .jf-editor { color: #f8fafc; }
          .jf-tree { flex: 1; padding: 1.25rem; overflow: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; line-height: 1.6; }
          .jf-tree-node { padding-left: 1.25rem; }
          .jf-tree-key { color: #8b5cf6; font-weight: 600; }
          .jf-tree-string { color: #059669; }
          .jf-tree-number { color: #0ea5e9; font-weight: 600; }
          .jf-tree-bool { color: #f59e0b; font-weight: 700; }
          .jf-tree-null { color: #94a3b8; font-style: italic; }
          .jf-tree-bracket { color: #64748b; font-weight: 700; }
          .jf-tree-toggle { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 4px; background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; font-size: 0.6rem; cursor: pointer; margin-right: 0.3rem; font-weight:bold; }
          .dark .jf-tree-toggle { background: #18181b; border-color: #27272a; }
          .jf-tree-line { border-left: 1px dashed #e2e8f0; margin-left: 0.15rem; padding-left: 1rem; }
          .dark .jf-tree-line { border-left-color: #27272a; }
        `}} />

        <div className="max-w-[1100px] mx-auto w-full h-full flex flex-col">

          {/* Header */}
          {!isFullscreen && (
            <header className="text-center mb-10 jf-header mt-8">
              <div className="jf-badge">
                <Code className="w-3.5 h-3.5" /> JSON Aracı
              </div>
              <h1 className="text-slate-900 dark:text-white">JSON <span>Formatter</span></h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[550px] mx-auto">
                JSON verilerinizi güzelleştirin, doğrulayın, ağaç yapısında keşfedin ve indirin.
              </p>
            </header>
          )}

          {/* Toolbar */}
          <div className="jf-toolbar">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="jf-tb-btn" onClick={beautify}>
                <Wand2 className="w-3.5 h-3.5" /> Beautify
              </button>
              <button className="jf-tb-btn" onClick={minify}>
                <Minimize2 className="w-3.5 h-3.5" /> Minify
              </button>
              <div className="jf-tb-divider"></div>
              <button className="jf-tb-btn" onClick={loadSample}>
                <FlaskConical className="w-3.5 h-3.5" /> Örnek
              </button>
              <button className="jf-tb-btn danger" onClick={clearAll}>
                <Trash className="w-3.5 h-3.5" /> Temizle
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className={`jf-tb-btn ${copiedOutput ? 'success' : ''}`} onClick={copyOutput}>
                {copiedOutput ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedOutput ? 'OK!' : 'Kopyala'}
              </button>
              <button className="jf-tb-btn" onClick={downloadJson}>
                <Download className="w-3.5 h-3.5" /> İndir
              </button>
              <div className="jf-tb-divider"></div>
              <button className={`jf-tb-btn ${isFullscreen ? 'text-brand-blue border-brand-blue' : ''}`} onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                {isFullscreen ? 'Küçült' : 'Tam Ekran'}
              </button>
            </div>
          </div>

          {/* Error Bar */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-500 rounded-xl px-5 py-3 mb-4 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Geçersiz JSON: <code className="bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded ml-1 font-['JetBrains_Mono']">{errorMsg}</code></span>
            </div>
          )}

          {/* Stats */}
          {parsedData !== null && (
            <div className="flex items-center gap-6 flex-wrap text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              <span>Boyut: <span className="text-slate-900 dark:text-white font-['JetBrains_Mono'] ml-1">{getJsonSize()}</span></span>
              <span>Anahtar: <span className="text-slate-900 dark:text-white font-['JetBrains_Mono'] ml-1">{getKeyCount(parsedData)}</span></span>
              <span>Derinlik: <span className="text-slate-900 dark:text-white font-['JetBrains_Mono'] ml-1">{getMaxDepth(parsedData)}</span></span>
              <span>Tür: <span className="text-slate-900 dark:text-white font-['JetBrains_Mono'] ml-1">{Array.isArray(parsedData) ? 'Array' : 'Object'}</span></span>
            </div>
          )}

          {/* Main Panels */}
          <div className="jf-main flex-1">
            {/* Input Panel */}
            <div className="jf-panel">
              <div className="jf-panel-header">
                <div className="font-['Outfit'] font-extrabold text-[0.82rem] text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-[#8b5cf6]" /> Giriş
                </div>
                <div>
                  <button className="jf-sm-btn" onClick={pasteFromClipboard}>
                    <Copy className="w-3 h-3" /> Yapıştır
                  </button>
                </div>
              </div>
              <div className={`jf-editor-wrap ${errorMsg ? 'has-error' : ''}`}>
                <div className="jf-line-numbers" ref={lineNumbersRef}>
                  {lineCount.map(n => (
                    <span key={n} className={`jf-line-num ${n === errorLine ? 'error-line' : ''}`}>{n}</span>
                  ))}
                </div>
                <textarea
                  className="jf-editor"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  onScroll={syncScroll}
                  ref={editorTextareaRef}
                  placeholder='{"isim": "Tayfun", "meslek": "Geliştirici", "diller": ["JavaScript", "PHP", "Python"]}'
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Tree Panel */}
            <div className="jf-panel">
              <div className="jf-panel-header">
                <div className="font-['Outfit'] font-extrabold text-[0.82rem] text-slate-900 dark:text-white flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-[#10b981]" /> Ağaç Görünümü
                </div>
                <div>
                  <button className={`jf-sm-btn ${copiedTree ? 'text-green-500 border-green-500' : ''}`} onClick={copyFormatted}>
                    {copiedTree ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="jf-tree">
                {parsedData !== null ? (
                  <div>
                    {renderTree(parsedData)}
                  </div>
                ) : !errorMsg ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm font-['Outfit'] text-center opacity-60">
                    <div>
                      <Code className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      Sol panele JSON yapıştırarak başlayın
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {!isFullscreen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 mt-4">
              <div className="flex items-start gap-3 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-[#8b5cf6] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[0.85rem] font-['Outfit'] text-slate-900 dark:text-white mb-1">Ağaç Görünümü</h4>
                  <p className="text-[0.73rem] text-slate-500 dark:text-slate-400">Daraltılabilir düğümlerle veriyi keşfedin.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-[#ef4444] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[0.85rem] font-['Outfit'] text-slate-900 dark:text-white mb-1">Hata Tespiti</h4>
                  <p className="text-[0.73rem] text-slate-500 dark:text-slate-400">Söz dizimi hatalarını anında gösterir.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-[#10b981] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[0.85rem] font-['Outfit'] text-slate-900 dark:text-white mb-1">.json İndirme</h4>
                  <p className="text-[0.73rem] text-slate-500 dark:text-slate-400">Formatlanmış JSON'u dosya olarak indirin.</p>
                </div>
              </div>
            </div>
          )}

          {!isFullscreen && (
            <FAQ
              title="JSON Formatter & Validator SSS"
              subtitle="JSON veri yapısı, doğrulama ve dönüştürme hakkında merak edilenler"
              items={[
                { question: "JSON nedir?", answer: "JSON (JavaScript Object Notation), insan tarafından kolay okunup yazılabilen, makineler tarafından kolayca ayrıştırılabilen hafif bir veri değişim formatıdır." },
                { question: "JSON verilerim sunucuya gönderiliyor mu?", answer: "Hayır, girdiğiniz veriler sadece kendi cihazınızın tarayıcısında işlenir. Hiçbir veri dış sunucuya gönderilmez." },
                { question: "JSON Minify işlemi ne işe yarar?", answer: "Minify işlemi, JSON içerisindeki gereksiz boşlukları ve satır sonlarını kaldırarak veri boyutunu küçültür ve veri transferini hızlandırır." }
              ]}
            />
          )}

          {!isFullscreen && <OtherTools />}

        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-[0.88rem] z-[100] animate-in slide-in-from-bottom-5">
            <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
            İşlem Başarılı
          </div>
        )}
      </div>
    </PageTransition>
  );
}
