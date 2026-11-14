'use client';

import { useState, useRef } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import {
  Trash,
  Type,
  FileText,
  Fingerprint,
  UploadCloud,
  Check,
  Copy,
  LockKeyhole,
  Zap,
} from 'lucide-react';

const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_K = (() => {
  const k = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  }
  return k;
})();

function md5(bytes: Uint8Array): string {
  const bitLen = bytes.length * 8;
  const paddedLength = (((bytes.length + 8) >> 6) + 1) << 6;
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[bytes.length] = 0x80;
  const view = new DataView(buffer.buffer);
  view.setUint32(paddedLength - 8, bitLen >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLen / 4294967296) >>> 0, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89 | 0;
  let c0 = 0x98badcfe | 0;
  let d0 = 0x10325476;

  for (let offset = 0; offset < paddedLength; offset += 64) {
    const M = new Int32Array(16);
    for (let i = 0; i < 16; i++) M[i] = view.getInt32(offset + i * 4, true);

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) & 15;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) & 15;
      }

      f = (f + a + MD5_K[i] + M[g]) | 0;
      a = d;
      d = c;
      c = b;
      b = (b + ((f << MD5_S[i]) | (f >>> (32 - MD5_S[i])))) | 0;
    }

    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  const toHexLE = (n: number) => {
    let out = '';
    for (let i = 0; i < 4; i++) {
      out += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return out;
  };

  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}

async function shaHex(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest(algo, data as BufferSource);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

const ALGOS = [
  { id: 'md5', label: 'MD5' },
  { id: 'sha1', label: 'SHA-1' },
  { id: 'sha256', label: 'SHA-256' },
  { id: 'sha512', label: 'SHA-512' },
] as const;

type AlgoId = (typeof ALGOS)[number]['id'];
type Hashes = Record<AlgoId, string>;

const EMPTY_HASHES: Hashes = { md5: '', sha1: '', sha256: '', sha512: '' };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = n;
  let unit = -1;
  do {
    value /= 1024;
    unit++;
  } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(2)} ${units[unit]}`;
}

export default function HashGenerator() {
  const [tab, setTab] = useState<'text' | 'file'>('text');

  const [inputText, setInputText] = useState('');
  const [hashes, setHashes] = useState<Hashes>(EMPTY_HASHES);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const updateText = (value: string) => {
    setInputText(value);
    const currentRequest = ++requestId.current;

    if (!value) {
      setHashes(EMPTY_HASHES);
      return;
    }

    const bytes = new TextEncoder().encode(value);
    const md5Hash = md5(bytes);
    setHashes({ md5: md5Hash, sha1: '', sha256: '', sha512: '' });

    Promise.all([
      shaHex('SHA-1', bytes),
      shaHex('SHA-256', bytes),
      shaHex('SHA-512', bytes),
    ])
      .then(([sha1, sha256, sha512]) => {
        if (currentRequest === requestId.current) {
          setHashes({ md5: md5Hash, sha1, sha256, sha512 });
        }
      })
      .catch(() => {
        // Web Crypto desteklenmiyorsa MD5 sonucu korunur.
      });
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyValue = (id: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id);
      triggerToast();
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const clear = () => {
    requestId.current++;
    setInputText('');
    setHashes(EMPTY_HASHES);
    setFileHash('');
    setFileName('');
    setFileSize(0);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hashFile = async (file: File) => {
    setFileError('');
    setFileHash('');
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const buffer = await file.arrayBuffer();
      const hex = await shaHex('SHA-256', new Uint8Array(buffer));
      setFileHash(hex);
      triggerToast();
    } catch {
      setFileError('Dosya okunamadı veya SHA-256 hesaplanamadı.');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) hashFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) hashFile(file);
  };

  return (
    <PageTransition>
      <div className="hash-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{
          __html: `
          .hash-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99,102,241,0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .hash-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .hash-header h1 span { background: linear-gradient(135deg, #6366f1, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .hash-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .hash-card { background: #09090b; border-color: #27272a; }
          .hash-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #0ea5e9); }
          .hash-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .hash-toolbar { background: #18181b; border-color: #27272a; }
          .hash-dots { display: flex; gap: 6px; }
          .hash-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .hash-dots span:nth-child(1) { background: #ef4444; }
          .hash-dots span:nth-child(2) { background: #f59e0b; }
          .hash-dots span:nth-child(3) { background: #22c55e; }
          .hash-clear-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.3rem 0.75rem; font-size: 0.72rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display:flex; align-items:center; gap:0.4rem; }
          .dark .hash-clear-btn { border-color: #27272a; color: #a1a1aa; }
          .hash-clear-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.04); }
          .hash-tabs { display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
          .dark .hash-tabs { background: #09090b; border-color: #27272a; }
          .hash-tab { flex: 1; padding: 1rem; background: transparent; border: none; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
          .dark .hash-tab { color: #a1a1aa; }
          .hash-tab:hover { background: #f1f5f9; color: #6366f1; }
          .dark .hash-tab:hover { background: #18181b; }
          .hash-tab.active { color: #6366f1; border-bottom-color: #6366f1; background: rgba(99,102,241,0.08); }
          .hash-textarea, .hash-input { width: 100%; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; color: #0f172a; background: #f1f5f9; border: 2px solid transparent; border-radius: 16px; outline: none; transition: all 0.25s ease; }
          .dark .hash-textarea, .dark .hash-input { background: #18181b; color: #f8fafc; }
          .hash-textarea:focus, .hash-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
          .dark .hash-textarea:focus, .dark .hash-input:focus { background: #000; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
          .hash-dropzone { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 3rem 2rem; text-align: center; background: #f1f5f9; cursor: pointer; transition: all 0.2s ease; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; }
          .dark .hash-dropzone { border-color: #27272a; background: #18181b; }
          .hash-dropzone:hover, .hash-dropzone.dragging { border-color: #6366f1; background: rgba(99,102,241,0.05); }
          .hash-dropzone input[type="file"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0; cursor: pointer; width: 100%; }
          .hash-copy-btn { display: flex; align-items: center; gap: 0.4rem; background: none; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.4rem 0.85rem; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
          .dark .hash-copy-btn { border-color: #27272a; color: #a1a1aa; }
          .hash-copy-btn:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.08); }
          .hash-copy-btn.copied { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
          .hash-output-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.1rem 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.7; color: #0f172a; word-break: break-all; }
          .dark .hash-output-box { background: #18181b; border-color: #27272a; color: #f8fafc; }
          .hash-output-box.error { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.04); color: #ef4444; }
          .hash-row-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
          .hash-label { font-family: 'Outfit', sans-serif; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #6366f1; }
        `}} />

        <div className="max-w-[820px] mx-auto w-full">

          <header className="text-center mb-12 mt-4 hash-header">
            <div className="hash-badge">
              <Fingerprint className="w-3.5 h-3.5" />
              Canlı Hesaplama
            </div>
            <h1 className="text-slate-900 dark:text-white">Hash <span>Üretici</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[520px] mx-auto">
              Metinlerin MD5, SHA-1, SHA-256 ve SHA-512 özetlerini anında görün, dosyalarınızın SHA-256 değerini hesaplayın.
            </p>
          </header>

          <div className="hash-card">

            <div className="hash-toolbar">
              <div className="hash-dots">
                <span></span><span></span><span></span>
              </div>
              <div>
                <button className="hash-clear-btn" onClick={clear}>
                  <Trash className="w-3 h-3" /> Temizle
                </button>
              </div>
            </div>

            <div className="hash-tabs">
              <button className={`hash-tab ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>
                <Type className="w-4 h-4" /> Metin İşlemleri
              </button>
              <button className={`hash-tab ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>
                <FileText className="w-4 h-4" /> Dosya İşlemleri
              </button>
            </div>

            <div className="p-8">

              {tab === 'text' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2.5">Giriş Metni</label>
                  <textarea
                    className="hash-textarea min-h-[160px] resize-y"
                    value={inputText}
                    onChange={(e) => updateText(e.target.value)}
                    placeholder="Hash değerleri hesaplanacak metni buraya yazın..."
                  />
                  <p className="text-[0.75rem] text-slate-400 mt-2">
                    Sonuçlar yazdıkça otomatik olarak hesaplanır.
                  </p>

                  {!inputText ? (
                    <div className="mt-6 py-8 text-center text-slate-400 text-sm">
                      Hesaplamak için yukarıdaki alana metin girin.
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 space-y-4 animate-in fade-in">
                      {ALGOS.map((algo) => (
                        <div key={algo.id}>
                          <div className="hash-row-head">
                            <span className="hash-label">{algo.label}</span>
                            <button
                              className={`hash-copy-btn ${copiedId === algo.id ? 'copied' : ''}`}
                              onClick={() => copyValue(algo.id, hashes[algo.id])}
                            >
                              {copiedId === algo.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedId === algo.id ? 'Kopyalandı!' : 'Kopyala'}</span>
                            </button>
                          </div>
                          <div className="hash-output-box">{hashes[algo.id] || '...'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'file' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2.5">Dosyanın SHA-256 Değeri</label>
                  <div
                    className={`hash-dropzone group ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                  >
                    <input type="file" ref={fileInputRef} onChange={onFileChange} />
                    <UploadCloud className="w-12 h-12 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-['Outfit'] font-bold text-slate-900 dark:text-white">Dosya Sürükle veya Seç</h4>
                    <p className="text-sm text-slate-500">Dosya tarayıcınızda kalır, sunucuya yüklenmez.</p>
                  </div>

                  {fileError && (
                    <div className="mt-6 hash-output-box error">{fileError}</div>
                  )}

                  {fileHash && (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white break-all">{fileName}</span>
                        <span>· {formatBytes(fileSize)}</span>
                      </div>
                      <div className="hash-row-head">
                        <span className="hash-label">SHA-256</span>
                        <button
                          className={`hash-copy-btn ${copiedId === 'file' ? 'copied' : ''}`}
                          onClick={() => copyValue('file', fileHash)}
                        >
                          {copiedId === 'file' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === 'file' ? 'Kopyalandı!' : 'Kopyala'}</span>
                        </button>
                      </div>
                      <div className="hash-output-box">{fileHash}</div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Dört Algoritma</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">MD5, SHA-1, SHA-256 ve SHA-512 özetleri tek ekranda.</p>
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
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Anlık Sonuç</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Yazdığınız anda hash değerleri güncellenir.</p>
              </div>
            </div>
          </div>

          <FAQ
            title="Hash Üretici SSS"
            subtitle="Hash fonksiyonları, kullanım alanları ve dosya doğrulama hakkında sorular"
            items={[
              { question: "Hash (özet) nedir?", answer: "Hash, bir veriyi sabit uzunlukta benzersiz bir dizeye dönüştüren tek yönlü matematiksel fonksiyondur. Aynı girdi her zaman aynı özeti üretir; özetten girdiye geri dönülemez." },
              { question: "MD5 ve SHA arasındaki fark nedir?", answer: "MD5 128 bit, SHA-1 160 bit, SHA-256 256 bit ve SHA-512 512 bit özet üretir. MD5 ve SHA-1 günümüzde güvenlik gerektiren işlemler için önerilmez; bütünlük kontrolünde SHA-256 tercih edilir." },
              { question: "Dosyam sunucuya yükleniyor mu?", answer: "Hayır. Base64 aracında olduğu gibi tüm hash hesaplamaları tarayıcınızda yapılır; dosyanız cihazınızdan çıkmaz." },
              { question: "SHA-256 ne için kullanılır?", answer: "Dosya bütünlüğü doğrulama, indirme doğrulama, dijital imza ve parola saklama gibi birçok alanda kullanılır. Bir dosyanın değiştirilip değiştirilmediğini anlamak için SHA-256 özetini karşılaştırabilirsiniz." },
            ]}
          />

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
