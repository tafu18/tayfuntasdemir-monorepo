'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Shield, Trash, Car, Settings, Check, Copy, Download, Globe, LockKeyhole, Zap, Hash, Key, Fingerprint, MapPin } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function DataGenerator() {
  const [tab, setTab] = useState<'system' | 'vehicle'>('system');
  const [count, setCount] = useState<number>(5); // Kaç adet üretilecek
  
  // Output State
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const clear = () => {
    setOutputText('');
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // --- ÜRETİM FONKSİYONLARI ---

  // 1. UUID v4 Üretici
  const generateUUID = () => {
    let results = [];
    for (let i = 0; i < count; i++) {
      results.push(crypto.randomUUID());
    }
    setOutputText(results.join('\n'));
    triggerToast();
  };

  // 2. Güvenli Şifre Üretici
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let results = [];
    for (let i = 0; i < count; i++) {
      let pwd = '';
      for (let j = 0; j < 16; j++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      results.push(pwd);
    }
    setOutputText(results.join('\n'));
    triggerToast();
  };

  // 3. Şasi Numarası (VIN) Üretici - Kurallı (I, O, Q hariç)
  const generateVIN = () => {
    const allowedChars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    const lettersOnly = 'ABCDEFGHJKLMNPRSTUVWXYZ';
    const numbersOnly = '0123456789';
    
    let results = [];
    for (let i = 0; i < count; i++) {
      // WMI (Örn: NLF - Türkiye Toyota)
      const wmi = 'N' + lettersOnly.charAt(Math.floor(Math.random() * lettersOnly.length)) + allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      // VDS (6 hane donanım vs)
      let vds = '';
      for(let j=0; j<6; j++) vds += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      // VIS (Yıl + Fabrika + 6 hane sıra no)
      const year = lettersOnly.charAt(Math.floor(Math.random() * lettersOnly.length));
      const plant = allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      let serial = '';
      for(let j=0; j<6; j++) serial += numbersOnly.charAt(Math.floor(Math.random() * numbersOnly.length));
      
      results.push(wmi + vds + year + plant + serial);
    }
    setOutputText(results.join('\n'));
    triggerToast();
  };

  // 4. Türkiye Plaka Üretici
  const generatePlate = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let results = [];
    for (let i = 0; i < count; i++) {
      const city = String(Math.floor(Math.random() * 81) + 1).padStart(2, '0');
      
      const charCount = Math.floor(Math.random() * 2) + 2; // 2 veya 3 harf
      let midStr = '';
      for(let j=0; j<charCount; j++) {
        midStr += letters.charAt(Math.floor(Math.random() * letters.length));
      }

      const numCount = charCount === 2 ? (Math.floor(Math.random() * 2) + 3) : Math.floor(Math.random() * 2) + 2; // Harf uzunluğuna göre rakam uzunluğu dengesi
      let endNum = '';
      for(let j=0; j<numCount; j++) {
        endNum += Math.floor(Math.random() * 10);
      }
      // Sıfır ile başlamasın
      if (endNum.startsWith('0')) endNum = '1' + endNum.substring(1);

      results.push(`${city} ${midStr} ${endNum}`);
    }
    setOutputText(results.join('\n'));
    triggerToast();
  };

  // --- ORTAK FONKSİYONLAR ---

  const copyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      triggerToast();
    });
  };

  const downloadOutputAsTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const now = new Date();
    const timestamp = now.getFullYear() +
      '-' + String(now.getMonth() + 1).padStart(2, '0') +
      '-' + String(now.getDate()).padStart(2, '0') +
      '_' + String(now.getHours()).padStart(2, '0') +
      '-' + String(now.getMinutes()).padStart(2, '0');

    a.download = `tayfuntasdemir_generated_data_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition>
      <div className="gen-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{
          __html: `
          .gen-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16,185,129,0.08); color: #10b981; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .gen-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .gen-header h1 span { background: linear-gradient(135deg, #10b981, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .gen-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .gen-card { background: #09090b; border-color: #27272a; }
          .gen-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #10b981, #0ea5e9); }
          .gen-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .gen-toolbar { background: #18181b; border-color: #27272a; }
          .gen-dots { display: flex; gap: 6px; }
          .gen-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .gen-dots span:nth-child(1) { background: #ef4444; }
          .gen-dots span:nth-child(2) { background: #f59e0b; }
          .gen-dots span:nth-child(3) { background: #22c55e; }
          .gen-clear-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.3rem 0.75rem; font-size: 0.72rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display:flex; align-items:center; gap:0.4rem; }
          .dark .gen-clear-btn { border-color: #27272a; color: #a1a1aa; }
          .gen-clear-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.04); }
          .gen-tabs { display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
          .dark .gen-tabs { background: #09090b; border-color: #27272a; }
          .gen-tab { flex: 1; padding: 1rem; background: transparent; border: none; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
          .dark .gen-tab { color: #a1a1aa; }
          .gen-tab:hover { background: #f1f5f9; color: #10b981; }
          .dark .gen-tab:hover { background: #18181b; }
          .gen-tab.active { color: #10b981; border-bottom-color: #10b981; background: rgba(16,185,129,0.05); }
          
          .gen-btn { display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 1rem; border-radius: 16px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; border: none; cursor: pointer; transition: all 0.2s ease; color: #fff; }
          .gen-btn-primary { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
          .gen-btn-primary:hover { box-shadow: 0 8px 25px rgba(16,185,129,0.4); transform: translateY(-2px); }
          .gen-btn-secondary { background: linear-gradient(135deg, #0ea5e9, #0284c7); box-shadow: 0 4px 15px rgba(14,165,233,0.3); }
          .gen-btn-secondary:hover { box-shadow: 0 8px 25px rgba(14,165,233,0.4); transform: translateY(-2px); }
          
          .gen-copy-btn { display: flex; align-items: center; gap: 0.4rem; background: none; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.4rem 0.85rem; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
          .dark .gen-copy-btn { border-color: #27272a; color: #a1a1aa; }
          .gen-copy-btn:hover { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
          .gen-copy-btn.copied { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
          
          .gen-output-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.7; color: #0f172a; word-break: break-all; max-height: 300px; overflow-y: auto; white-space: pre-wrap; }
          .dark .gen-output-box { background: #18181b; border-color: #27272a; color: #f8fafc; }
          
          .gen-select { width: 100%; max-width: 120px; padding: 0.5rem 1rem; font-family: 'Plus_Jakarta_Sans', sans-serif; font-weight: 600; font-size: 0.88rem; color: #0f172a; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }
          .dark .gen-select { background: #09090b; color: #f8fafc; border-color: #27272a; }
        `}} />

        <div className="max-w-[820px] mx-auto w-full">

          <header className="text-center mb-12 mt-4 gen-header">
            <div className="gen-badge">
              <Shield className="w-3.5 h-3.5" />
              Algoritmik Üretim
            </div>
            <h1 className="text-slate-900 dark:text-white">Veri Üretici <span>Pro</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[520px] mx-auto">
              Test ve geliştirme süreçleriniz için kurallara uygun rastgele verileri saniyeler içinde oluşturun.
            </p>
          </header>

          <div className="gen-card">

            <div className="gen-toolbar">
              <div className="gen-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">Adet:</label>
                  <select 
                    className="gen-select" 
                    value={count} 
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    <option value={1}>1</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button className="gen-clear-btn" onClick={clear}>
                  <Trash className="w-3 h-3" /> Temizle
                </button>
              </div>
            </div>

            <div className="gen-tabs">
              <button className={`gen-tab ${tab === 'system' ? 'active' : ''}`} onClick={() => setTab('system')}>
                <Settings className="w-4 h-4" /> Sistem Verileri
              </button>
              <button className={`gen-tab ${tab === 'vehicle' ? 'active' : ''}`} onClick={() => setTab('vehicle')}>
                <Car className="w-4 h-4" /> Araç Verileri
              </button>
            </div>

            <div className="p-8">

              {tab === 'system' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-4">Geliştirici Araçları</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="gen-btn gen-btn-primary" onClick={generateUUID}>
                      <Fingerprint className="w-5 h-5" /> UUID v4 Üret
                    </button>
                    <button className="gen-btn gen-btn-secondary" onClick={generatePassword}>
                      <Key className="w-5 h-5" /> Güvenli Şifre Üret
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">Tüm değerler cihazınızın belleğinde üretilir, sunucuya kaydedilmez.</p>
                </div>
              )}

              {tab === 'vehicle' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-4">Otomotiv Formatları</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="gen-btn gen-btn-primary" onClick={generateVIN}>
                      <Hash className="w-5 h-5" /> Şasi No (VIN) Üret
                    </button>
                    <button className="gen-btn gen-btn-secondary" onClick={generatePlate}>
                      <MapPin className="w-5 h-5" /> TR Plaka Üret
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">ISO 3779 ve Türkiye plaka standartlarına uygun rastgele veriler üretir.</p>
                </div>
              )}

              {outputText && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-emerald-500">Üretilen Veriler ({count} adet)</span>
                    <div className="flex gap-2">
                      <button className="gen-copy-btn" onClick={downloadOutputAsTxt} title="Verileri .txt olarak indir">
                        <Download className="w-3.5 h-3.5" /> İndir (.txt)
                      </button>

                      <button className={`gen-copy-btn ${copied ? 'copied' : ''}`} onClick={copyOutput}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="gen-output-box">
                    {outputText}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Alt Bilgi Kartları (Aynı tasarıma sadık kalarak) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Gerçekçi Algoritma</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">VIN veya Plaka formatları, uluslararası ve yerel kurallara göre simüle edilir.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-sky-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
                <LockKeyhole className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Lokal Üretim</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Veriler tarayıcınızın belleğinde oluşur, hiçbir API'ye gitmez veya kaydedilmez.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-amber-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Çoklu Veri Seti</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Tek seferde 50 adede kadar test datasını anında oluşturup kopyalayın.</p>
              </div>
            </div>
          </div>

          <OtherTools />

        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-[0.88rem] z-[100] animate-in slide-in-from-bottom-5">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            İşlem Başarılı
          </div>
        )}
      </div>
    </PageTransition>
  );
}