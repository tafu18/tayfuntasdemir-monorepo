'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Clock, Check, Copy, CalendarDays, History, Cpu, Globe, Shield, ArrowRightLeft } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function EpochConverter() {
  const [currentEpochMs, setCurrentEpochMs] = useState<number | null>(null);
  const [currentEpochSec, setCurrentEpochSec] = useState<number | null>(null);

  const [inputDate, setInputDate] = useState('');
  const [resultEpoch, setResultEpoch] = useState<number | null>(null);
  const [resultEpochMs, setResultEpochMs] = useState<number | null>(null);

  const [inputEpoch, setInputEpoch] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [resultRelative, setResultRelative] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [copiedSec, setCopiedSec] = useState(false);
  const [copiedMs, setCopiedMs] = useState(false);
  const [copiedResults, setCopiedResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Set initial date format for input
    const now = new Date();
    // YYYY-MM-DDThh:mm format required by datetime-local
    const formatted = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setInputDate(formatted);
    
    setCurrentEpochMs(Date.now());
    setCurrentEpochSec(Math.floor(Date.now() / 1000));

    const interval = setInterval(() => {
      setCurrentEpochMs(Date.now());
      setCurrentEpochSec(Math.floor(Date.now() / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const copyVal = (val: string | null, type: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      if (type === 'sec') {
        setCopiedSec(true);
        setTimeout(() => setCopiedSec(false), 2000);
      } else if (type === 'ms') {
        setCopiedMs(true);
        setTimeout(() => setCopiedMs(false), 2000);
      } else {
        setCopiedResults(prev => ({ ...prev, [type]: true }));
        setTimeout(() => setCopiedResults(prev => ({ ...prev, [type]: false })), 2000);
      }
    });
  };

  const convertToEpoch = () => {
    if (!inputDate) return;
    const date = new Date(inputDate);
    setResultEpoch(Math.floor(date.getTime() / 1000));
    setResultEpochMs(date.getTime());
  };

  const setNow = () => {
    const ms = Date.now().toString();
    setInputEpoch(ms);
    convertEpochToDate(ms);
  };

  const convertToDate = () => {
    convertEpochToDate(inputEpoch);
  };

  const convertEpochToDate = (epochStr: string) => {
    if (!epochStr) return;
    let val = parseInt(epochStr, 10);
    
    // Auto detect: 13 digits = ms, 10 digits = seconds
    let date = val > 9999999999 ? new Date(val) : new Date(val * 1000);
    
    if (isNaN(date.getTime())) {
      setResultDate('Geçersiz Epoch!');
      setResultRelative('');
      return;
    }

    setResultDate(date.toLocaleString('tr-TR', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short'
    }));

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const absDiff = Math.abs(diffMs);
    const suffix = diffMs < 0 ? 'önce' : 'sonra';

    if (absDiff < 60000) {
      setResultRelative(Math.floor(absDiff / 1000) + ' saniye ' + suffix);
    } else if (absDiff < 3600000) {
      setResultRelative(Math.floor(absDiff / 60000) + ' dakika ' + suffix);
    } else if (absDiff < 86400000) {
      setResultRelative(Math.floor(absDiff / 3600000) + ' saat ' + suffix);
    } else if (absDiff < 2592000000) {
      setResultRelative(Math.floor(absDiff / 86400000) + ' gün ' + suffix);
    } else {
      setResultRelative(Math.floor(absDiff / 2592000000) + ' ay ' + suffix);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{__html: `
          .ep-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99,102,241,0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .ep-ticker { background: #0f172a; border-radius: 20px; padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; position: relative; overflow: hidden; }
          .ep-ticker::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #10b981); }
          .ep-ticker-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 12px; padding: 0.6rem 1rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; font-family: 'Outfit', sans-serif; }
          .ep-ticker-btn:hover { background: rgba(255,255,255,0.2); }
          .ep-ticker-btn.copied { background: #10b981; border-color: #10b981; }
          .ep-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; position: relative; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04); }
          .dark .ep-card { background: #09090b; border-color: #27272a; }
          .ep-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; pointer-events: none; }
          .ep-card.encode::before { background: #6366f1; }
          .ep-card.decode::before { background: #10b981; }
          .ep-input { width: 100%; padding: 0.85rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; color: #0f172a; background: #f1f5f9; border: 2px solid transparent; border-radius: 14px; outline: none; transition: all 0.25s; }
          .dark .ep-input { background: #18181b; color: #f8fafc; }
          .ep-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
          .dark .ep-input:focus { background: #000; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
          .ep-input.green:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); }
          .dark .ep-input.green:focus { box-shadow: 0 0 0 4px rgba(16,185,129,0.15); }
          .ep-now-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #0f172a; color: #fff; border: none; border-radius: 10px; padding: 0.5rem 0.9rem; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif; }
          .dark .ep-now-btn { background: #3f3f46; }
          .ep-now-btn:hover { background: #6366f1; }
          .ep-btn { width: 100%; padding: 0.9rem; border-radius: 14px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.92rem; border: none; cursor: pointer; color: #fff; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.25rem; }
          .ep-btn:active { transform: scale(0.97); }
          .ep-btn.primary { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
          .ep-btn.primary:hover { box-shadow: 0 8px 25px rgba(99,102,241,0.4); transform: translateY(-2px); }
          .ep-btn.green { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
          .ep-btn.green:hover { box-shadow: 0 8px 25px rgba(16,185,129,0.4); transform: translateY(-2px); }
          .ep-result-row { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 14px; padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; transition: all 0.2s; }
          .dark .ep-result-row { background: #18181b; border-color: #27272a; }
          .ep-result-row:hover { border-color: #6366f1; }
          .ep-copy-sm { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.35rem 0.65rem; font-size: 0.7rem; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.3rem; font-weight: 700; }
          .dark .ep-copy-sm { border-color: #27272a; color: #a1a1aa; }
          .ep-copy-sm:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.08); }
          .ep-copy-sm.copied { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
          .ep-date-result { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); border-radius: 16px; padding: 1.25rem; }
          @media (max-width: 768px) { .ep-ticker { flex-direction: column; align-items: flex-start; } .ep-ticker-right { width: 100%; } .ep-ticker-btn { flex: 1; justify-content: center; } }
        `}} />

        <div className="max-w-[960px] mx-auto w-full">
          {/* Header */}
          <header className="text-center mb-10 mt-4">
            <div className="ep-badge">
              <Clock className="w-3.5 h-3.5" /> Zaman Damgası Aracı
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,5vw,3rem)] text-slate-900 dark:text-white mb-3 tracking-tight">
              Epoch <span className="bg-gradient-to-br from-indigo-500 to-sky-500 bg-clip-text text-transparent">Converter</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[1.05rem] max-w-[520px] mx-auto">
              Unix zaman damgasını tarihe veya tarihi epoch değerine dönüştürün. Milisaniye destekli.
            </p>
          </header>

          {/* Live Ticker */}
          <div className="ep-ticker">
            <div className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-white/40">Şu Anki Epoch (Milisaniye)</span>
              <span className="font-['JetBrains_Mono'] text-[clamp(1.2rem,3vw,1.8rem)] font-bold text-white leading-none">
                {currentEpochMs || 'Yükleniyor...'}
              </span>
            </div>
            <div className="flex gap-2 ep-ticker-right">
              <button 
                className={`ep-ticker-btn ${copiedSec ? 'copied' : ''}`}
                onClick={() => copyVal(currentEpochSec ? String(currentEpochSec) : null, 'sec')}
              >
                {copiedSec ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSec ? 'OK!' : 'Saniye'}</span>
              </button>
              <button 
                className={`ep-ticker-btn ${copiedMs ? 'copied' : ''}`}
                onClick={() => copyVal(currentEpochMs ? String(currentEpochMs) : null, 'ms')}
              >
                {copiedMs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMs ? 'OK!' : 'Milisaniye'}</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* ENCODE */}
            <div className="ep-card encode">
              <div className="font-['Outfit'] text-[1.15rem] font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-indigo-500" /> Tarih → Epoch
              </div>
              
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2">Tarih & Saat Seçin</label>
              <input 
                type="datetime-local" 
                className="ep-input mb-4" 
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
              />

              <button className="ep-btn primary" onClick={convertToEpoch}>
                <ArrowRightLeft className="w-4 h-4" /> Dönüştür
              </button>

              {resultEpoch !== null && (
                <div className="animate-in fade-in zoom-in-95 duration-200 mt-2">
                  <div className="ep-result-row">
                    <div>
                      <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-slate-500 mb-0.5">Saniye (Unix)</div>
                      <div className="font-['JetBrains_Mono'] font-bold text-[1rem] text-slate-900 dark:text-white">{resultEpoch}</div>
                    </div>
                    <button className={`ep-copy-sm ${copiedResults['encodeSec'] ? 'copied' : ''}`} onClick={() => copyVal(String(resultEpoch), 'encodeSec')}>
                      {copiedResults['encodeSec'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="ep-result-row">
                    <div>
                      <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-slate-500 mb-0.5">Milisaniye</div>
                      <div className="font-['JetBrains_Mono'] font-bold text-[1rem] text-slate-900 dark:text-white">{resultEpochMs}</div>
                    </div>
                    <button className={`ep-copy-sm ${copiedResults['encodeMs'] ? 'copied' : ''}`} onClick={() => copyVal(String(resultEpochMs), 'encodeMs')}>
                      {copiedResults['encodeMs'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DECODE */}
            <div className="ep-card decode">
              <div className="font-['Outfit'] text-[1.15rem] font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                <History className="w-5 h-5 text-emerald-500" /> Epoch → Tarih
              </div>
              
              <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2">Epoch Değeri (saniye veya milisaniye)</label>
              <div className="relative mb-4">
                <input 
                  type="number" 
                  className="ep-input green" 
                  placeholder="Örn: 1709071200000"
                  value={inputEpoch}
                  onChange={(e) => setInputEpoch(e.target.value)}
                />
                <button className="ep-now-btn" onClick={setNow}>Şu An</button>
              </div>

              <button className="ep-btn green" onClick={convertToDate}>
                <ArrowRightLeft className="w-4 h-4" /> Dönüştür
              </button>

              {resultDate && (
                <div className="ep-date-result animate-in fade-in zoom-in-95 duration-200 mt-2">
                  <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-500 mb-2">OKUNABILIR TARİH</div>
                  <div className="font-['Outfit'] text-[1.2rem] font-extrabold text-slate-900 dark:text-white mb-2">{resultDate}</div>
                  {resultRelative && (
                    <div className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      {resultRelative}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white mb-1">2038 Uyumlu</h4>
                <p className="text-[0.73rem] text-slate-500 dark:text-slate-400 leading-relaxed">64-bit destekli, Y2038 hatasından etkilenmez.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white mb-1">UTC Standart</h4>
                <p className="text-[0.73rem] text-slate-500 dark:text-slate-400 leading-relaxed">Epoch UTC bazlıdır, yerel saat otomatik ayarlanır.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-sky-500 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white mb-1">İstemci Taraflı</h4>
                <p className="text-[0.73rem] text-slate-500 dark:text-slate-400 leading-relaxed">Veriler sunucuya gönderilmez, tamamen güvenli.</p>
              </div>
            </div>
          </div>

          <OtherTools />

        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-[0.88rem] z-[100] animate-in slide-in-from-bottom-5">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            Panoya kopyalandı!
          </div>
        )}
      </div>
    </PageTransition>
  );
}
