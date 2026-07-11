'use client';

import { useState, useRef } from 'react';
import PageTransition from '@/components/PageTransition';
import { Shield, Trash, Type, FileText, Lock, Unlock, UploadCloud, Download, Check, Copy, Globe, LockKeyhole, Zap } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function Base64() {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  
  // Text Mode State
  const [inputText, setInputText] = useState('');
  
  // File Mode State
  const [fileInputText, setFileInputText] = useState('');
  const [fileName, setFileName] = useState('');

  // Shared Output
  const [outputText, setOutputText] = useState('');
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    setInputText('');
    setFileInputText('');
    setFileName('');
    setOutputText('');
    setIsError(false);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const encodeText = () => {
    if (!inputText) return;
    try {
      // Using TextEncoder for proper UTF-8 support
      const uint8Array = new TextEncoder().encode(inputText);
      let binaryStr = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryStr += String.fromCharCode(uint8Array[i]);
      }
      setOutputText(btoa(binaryStr));
      setIsError(false);
    } catch (e: any) {
      setOutputText('Hata: ' + e.message);
      setIsError(true);
    }
  };

  const decodeText = () => {
    if (!inputText) return;
    try {
      const binaryStr = atob(inputText);
      const uint8Array = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        uint8Array[i] = binaryStr.charCodeAt(i);
      }
      setOutputText(new TextDecoder().decode(uint8Array));
      setIsError(false);
    } catch (e: any) {
      setOutputText('Hata: Geçersiz Base64 dizesi.');
      setIsError(true);
    }
  };

  const encodeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setOutputText(ev.target.result as string);
        setIsError(false);
        triggerToast();
      }
    };
    reader.onerror = () => {
      setOutputText('Dosya okuma hatası!');
      setIsError(true);
    };
    reader.readAsDataURL(file);
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const decodeFile = () => {
    if (!fileInputText) return;
    let b64 = fileInputText.trim();
    let mimeType = 'application/octet-stream';

    // check if data URI
    if (b64.startsWith('data:')) {
      const parts = b64.split(',');
      const match = parts[0].match(/data:(.*?);/);
      if (match) mimeType = match[1];
      b64 = parts[1];
    }

    try {
      const binaryStr = atob(b64);
      const uint8Array = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        uint8Array[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: mimeType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let fName = fileName.trim();
      if (!fName) {
        let ext = 'bin';
        if (mimeType.includes('image/png')) ext = 'png';
        else if (mimeType.includes('image/jpeg')) ext = 'jpg';
        else if (mimeType.includes('application/pdf')) ext = 'pdf';
        else if (mimeType.includes('text/plain')) ext = 'txt';
        fName = 'decoded_file.' + ext;
      }

      a.download = fName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      triggerToast();
    } catch (e) {
      setOutputText('İndirme Hatası: Geçersiz Base64 formatı.');
      setIsError(true);
    }
  };

  const copyOutput = () => {
    if (!outputText || isError) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      triggerToast();
    });
  };

  const downloadOutputAsTxt = () => {
    if (!outputText || isError) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'base64_output.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition>
      <div className="b64-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{__html: `
          .b64-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99,102,241,0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .b64-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .b64-header h1 span { background: linear-gradient(135deg, #6366f1, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .b64-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .b64-card { background: #09090b; border-color: #27272a; }
          .b64-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #0ea5e9); }
          .b64-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .b64-toolbar { background: #18181b; border-color: #27272a; }
          .b64-dots { display: flex; gap: 6px; }
          .b64-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .b64-dots span:nth-child(1) { background: #ef4444; }
          .b64-dots span:nth-child(2) { background: #f59e0b; }
          .b64-dots span:nth-child(3) { background: #22c55e; }
          .b64-clear-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.3rem 0.75rem; font-size: 0.72rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display:flex; align-items:center; gap:0.4rem; }
          .dark .b64-clear-btn { border-color: #27272a; color: #a1a1aa; }
          .b64-clear-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.04); }
          .b64-tabs { display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
          .dark .b64-tabs { background: #09090b; border-color: #27272a; }
          .b64-tab { flex: 1; padding: 1rem; background: transparent; border: none; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
          .dark .b64-tab { color: #a1a1aa; }
          .b64-tab:hover { background: #f1f5f9; color: #6366f1; }
          .dark .b64-tab:hover { background: #18181b; }
          .b64-tab.active { color: #6366f1; border-bottom-color: #6366f1; background: rgba(99,102,241,0.08); }
          .b64-textarea, .b64-input { width: 100%; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; color: #0f172a; background: #f1f5f9; border: 2px solid transparent; border-radius: 16px; outline: none; transition: all 0.25s ease; }
          .dark .b64-textarea, .dark .b64-input { background: #18181b; color: #f8fafc; }
          .b64-textarea:focus, .b64-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
          .dark .b64-textarea:focus, .dark .b64-input:focus { background: #000; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
          .file-dropzone { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 3rem 2rem; text-align: center; background: #f1f5f9; cursor: pointer; transition: all 0.2s ease; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; }
          .dark .file-dropzone { border-color: #27272a; background: #18181b; }
          .file-dropzone:hover { border-color: #6366f1; background: rgba(99,102,241,0.05); }
          .file-dropzone input[type="file"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0; cursor: pointer; width: 100%; }
          .b64-btn { display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 1rem; border-radius: 16px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; border: none; cursor: pointer; transition: all 0.2s ease; color: #fff; }
          .b64-btn-encode { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
          .b64-btn-encode:hover { box-shadow: 0 8px 25px rgba(99,102,241,0.4); transform: translateY(-2px); }
          .b64-btn-decode { background: linear-gradient(135deg, #0ea5e9, #0284c7); box-shadow: 0 4px 15px rgba(14,165,233,0.3); }
          .b64-btn-decode:hover { box-shadow: 0 8px 25px rgba(14,165,233,0.4); transform: translateY(-2px); }
          .b64-copy-btn { display: flex; align-items: center; gap: 0.4rem; background: none; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.4rem 0.85rem; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
          .dark .b64-copy-btn { border-color: #27272a; color: #a1a1aa; }
          .b64-copy-btn:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.08); }
          .b64-copy-btn.copied { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
          .b64-output-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.7; color: #0f172a; word-break: break-all; max-height: 300px; overflow-y: auto; }
          .dark .b64-output-box { background: #18181b; border-color: #27272a; color: #f8fafc; }
          .b64-output-box.error { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.04); color: #ef4444; }
        `}} />

        <div className="max-w-[820px] mx-auto w-full">

          <header className="text-center mb-12 mt-4">
            <div className="b64-badge">
              <Shield className="w-3.5 h-3.5" />
              %100 İstemci Taraflı İşlem
            </div>
            <h1 className="text-slate-900 dark:text-white">Base64 <span>Pro</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[520px] mx-auto">
              Metinlerinizi veya dosyalarınızı Base64 formatına dönüştürün ve mevcut kodları kolayca çözün.
            </p>
          </header>

          <div className="b64-card">
            
            <div className="b64-toolbar">
              <div className="b64-dots">
                <span></span><span></span><span></span>
              </div>
              <div>
                <button className="b64-clear-btn" onClick={clear}>
                  <Trash className="w-3 h-3" /> Temizle
                </button>
              </div>
            </div>

            <div className="b64-tabs">
              <button className={`b64-tab ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>
                <Type className="w-4 h-4" /> Metin İşlemleri
              </button>
              <button className={`b64-tab ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>
                <FileText className="w-4 h-4" /> Dosya İşlemleri
              </button>
            </div>

            <div className="p-8">
              
              {tab === 'text' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2.5">Giriş Metni</label>
                  <textarea 
                    className="b64-textarea min-h-[180px] resize-y" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Metni veya Base64 kodunu buraya yapıştırın..."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <button className="b64-btn b64-btn-encode" onClick={encodeText}>
                      <Lock className="w-4 h-4" /> Encode (Şifrele)
                    </button>
                    <button className="b64-btn b64-btn-decode" onClick={decodeText}>
                      <Unlock className="w-4 h-4" /> Decode (Çöz)
                    </button>
                  </div>
                </div>
              )}

              {tab === 'file' && (
                <div className="animate-in fade-in duration-200">
                  
                  <div className="mb-8">
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2.5">Dosyayı Base64'e Çevir (Encode)</label>
                    <div className="file-dropzone group">
                      <input type="file" ref={fileInputRef} onChange={encodeFile} />
                      <UploadCloud className="w-12 h-12 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-['Outfit'] font-bold text-slate-900 dark:text-white">Dosya Seç veya Sürükle</h4>
                      <p className="text-sm text-slate-500">Resim, PDF, TXT fark etmeksizin anında koda çevrilir.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2.5">Base64'ü Dosyaya Çevir (Decode)</label>
                    <textarea 
                      className="b64-textarea min-h-[120px]" 
                      value={fileInputText}
                      onChange={(e) => setFileInputText(e.target.value)}
                      placeholder="Base64 kodunu (data:image/png;base64,... formatında veya düz) buraya yapıştırın..."
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <input 
                        type="text" 
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="b64-input flex-1 font-['Plus_Jakarta_Sans']" 
                        placeholder="dosya_adi.txt (Opsiyonel)" 
                      />
                      <button className="b64-btn b64-btn-decode flex-1" onClick={decodeFile}>
                        <Download className="w-4 h-4" /> Dosya Olarak İndir
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {outputText && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-indigo-500">Sonuç</span>
                    <div className="flex gap-2">
                      <button className="b64-copy-btn" onClick={downloadOutputAsTxt} title="Base64 kodunu .txt olarak indir">
                        <Download className="w-3.5 h-3.5" /> İndir (.txt)
                      </button>
                      
                      <button className={`b64-copy-btn ${copied ? 'copied' : ''}`} onClick={copyOutput}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>
                  <div className={`b64-output-box ${isError ? 'error' : ''}`}>
                    {outputText}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Geniş Format Desteği</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Metin, UTF-8 karakterler ve tüm dosya türleri (Görsel, PDF, Zip) desteklenir.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-sky-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
                <LockKeyhole className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Güvenlik İlk Sırada</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Tüm işlemler tarayıcınızda gerçekleşir. Verileriniz sunucuya gönderilmez.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Işık Hızında</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Dosya sınırları takılmadan anında büyük verileri dönüştürün.</p>
              </div>
            </div>
          </div>

          <OtherTools />

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
