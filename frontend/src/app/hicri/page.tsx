'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Moon, CalendarCheck, CalendarDays, Calculator, ArrowRightLeft, Star } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

const hijriMonths = [
  "Muharrem", "Safer", "Rebîülevvel", "Rebîülâhir",
  "Cemâziyelevvel", "Cemâziyelâhir", "Recep", "Şaban",
  "Ramazan", "Şevval", "Zilkade", "Zilhicce"
];

const specialDays: Record<string, string> = {
  '1-1': 'Hicri Yılbaşı',
  '10-1': 'Aşure Günü',
  '12-3': 'Mevlid Kandili',
  '27-7': 'Miraç Kandili', // Regaib Kandili is dynamically first thursday of Recep but usually 27-7 is Miraç
  '15-8': 'Berat Kandili',
  '1-9': 'Ramazan Başlangıcı',
  '27-9': 'Kadir Gecesi',
  '1-10': 'Ramazan Bayramı (1. Gün)',
  '2-10': 'Ramazan Bayramı (2. Gün)',
  '3-10': 'Ramazan Bayramı (3. Gün)',
  '9-12': 'Arefe Günü',
  '10-12': 'Kurban Bayramı (1. Gün)',
  '11-12': 'Kurban Bayramı (2. Gün)',
  '12-12': 'Kurban Bayramı (3. Gün)',
  '13-12': 'Kurban Bayramı (4. Gün)',
};

export default function HicriConverter() {
  const [mInput, setMInput] = useState('');
  
  const [hDay, setHDay] = useState(1);
  const [hMonth, setHMonth] = useState(1);
  const [hYear, setHYear] = useState(1446);
  
  const [hResult, setHResult] = useState('');
  const [mResult, setMResult] = useState('');
  
  const [mDayName, setMDayName] = useState('');
  const [hDayName, setHDayName] = useState('');
  
  const [todayHijri, setTodayHijri] = useState('');
  const [todayMiladi, setTodayMiladi] = useState('');
  const [todayDayName, setTodayDayName] = useState('');
  
  const [specialDay, setSpecialDay] = useState('');

  // ── Diyanet/Umm Al-Qura Uyumlu Doğru Hesaplama (Intl tabanlı) ──
  const getHijriFromDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const parts = formatter.format(utcDate).split('/');
    return {
      month: parseInt(parts[0], 10),
      day: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10)
    };
  };

  const getGregorianFromHijri = (hy: number, hm: number, hd: number): Date | null => {
    let gy = Math.floor(hy * 0.97) + 621;
    let start = Date.UTC(gy, 0, 1);
    let end = Date.UTC(gy + 2, 11, 31);
    
    let low = start;
    let high = end;
    
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
    
    const getHijri = (time: number) => {
      const parts = formatter.format(new Date(time)).split('/');
      return {
        month: parseInt(parts[0], 10),
        day: parseInt(parts[1], 10),
        year: parseInt(parts[2], 10)
      };
    };
    
    while (low <= high) {
      let mid = low + Math.floor((high - low) / (2 * 86400000)) * 86400000;
      let h = getHijri(mid);
      
      let diffYear = h.year - hy;
      let diffMonth = h.month - hm;
      let diffDay = h.day - hd;
      
      if (diffYear === 0 && diffMonth === 0 && diffDay === 0) {
        const utcDate = new Date(mid);
        return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
      }
      
      if (diffYear < 0 || (diffYear === 0 && diffMonth < 0) || (diffYear === 0 && diffMonth === 0 && diffDay < 0)) {
        low = mid + 86400000;
      } else {
        high = mid - 86400000;
      }
    }
    return null;
  };

  useEffect(() => {
    const today = new Date();
    // YYYY-MM-DD
    const localIso = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    setMInput(localIso);

    const hijriParts = getHijriFromDate(today);
    setTodayHijri(`${hijriParts.day} ${hijriMonths[hijriParts.month - 1]} ${hijriParts.year}`);
    setTodayMiladi(today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
    setTodayDayName(today.toLocaleDateString('tr-TR', { weekday: 'long' }));

    setHDay(hijriParts.day);
    setHMonth(hijriParts.month);
    setHYear(hijriParts.year);

    // Initial calcs handled in another effect to depend on mInput/hDay
  }, []);

  useEffect(() => {
    if (!mInput) return;
    const parts = mInput.split('-');
    if (parts.length !== 3) return;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (isNaN(date.getTime())) return;

    const hijri = getHijriFromDate(date);
    setHResult(`${hijri.day} ${hijriMonths[hijri.month - 1]} ${hijri.year}`);
    setMDayName(date.toLocaleDateString('tr-TR', { weekday: 'long' }));

    const key = `${hijri.day}-${hijri.month}`;
    setSpecialDay(specialDays[key] || '');
  }, [mInput]);

  useEffect(() => {
    let d = parseInt(hDay.toString());
    let m = parseInt(hMonth.toString());
    let y = parseInt(hYear.toString());
    if (!d || !m || !y || d < 1 || d > 30 || m < 1 || m > 12) return;

    const resDate = getGregorianFromHijri(y, m, d);
    if (!resDate || isNaN(resDate.getTime())) return;

    setMResult(resDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
    setHDayName(resDate.toLocaleDateString('tr-TR', { weekday: 'long' }));
  }, [hDay, hMonth, hYear]);

  return (
    <PageTransition>
      <div className="hc-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{__html: `
          .hc-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(5,150,105,0.08); color: #059669; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .hc-today { background: #0f172a; border-radius: 20px; padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; position: relative; overflow: hidden; }
          .hc-today::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #059669, #6366f1); }
          .hc-today-day { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 0.75rem 1.25rem; color: #fff; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
          
          .hc-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; position: relative; }
          .dark .hc-card { background: #09090b; border-color: #27272a; }
          .hc-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; pointer-events: none; }
          .hc-card.miladi::before { background: #059669; }
          .hc-card.hijri::before { background: #6366f1; }
          
          .hc-card-header { padding: 1.25rem 1.75rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 0.6rem; }
          .dark .hc-card-header { background: #18181b; border-color: #27272a; }
          
          .hc-input { width: 100%; padding: 0.85rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; color: #0f172a; background: #f1f5f9; border: 2px solid transparent; border-radius: 14px; outline: none; transition: all 0.25s; }
          .dark .hc-input { background: #18181b; color: #f8fafc; }
          .hc-input:focus { border-color: #059669; background: #fff; box-shadow: 0 0 0 4px rgba(5,150,105,0.08); }
          .dark .hc-input:focus { background: #000; box-shadow: 0 0 0 4px rgba(5,150,105,0.15); }
          .hc-input.indigo:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
          .dark .hc-input.indigo:focus { box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
          
          .hc-select { width: 100%; padding: 0.85rem 1rem; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.85rem; font-weight: 700; color: #0f172a; background: #f1f5f9; border: 2px solid transparent; border-radius: 14px; outline: none; transition: all 0.25s; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E"); background-position: right 0.75rem center; background-repeat: no-repeat; background-size: 1.25rem; }
          .dark .hc-select { background-color: #18181b; color: #f8fafc; }
          .hc-select:focus { border-color: #6366f1; background-color: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
          .dark .hc-select:focus { background-color: #000; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
          
          .hc-result { border-radius: 16px; padding: 1.25rem; margin-top: 1.25rem; }
          .hc-result.green { background: rgba(5,150,105,0.08); border: 1px solid rgba(5,150,105,0.15); }
          .hc-result.purple { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); }
          
          .hc-special { margin-top: 0.75rem; padding: 0.65rem 1rem; border-radius: 12px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); font-size: 0.78rem; font-weight: 700; color: #b45309; display: flex; align-items: center; gap: 0.5rem; }
          .dark .hc-special { color: #fcd34d; }
          @media (max-width: 768px) { .hc-today { flex-direction: column; align-items: flex-start; } .hc-inputs-row { grid-template-columns: 1fr 1fr 1fr; } }
        `}} />

        <div className="max-w-[920px] mx-auto w-full">
          {/* Header */}
          <header className="text-center mb-10 mt-4">
            <div className="hc-badge">
              <Moon className="w-3.5 h-3.5" /> İslami Takvim
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,5vw,3rem)] text-slate-900 dark:text-white mb-3 tracking-tight">
              Hicri <span className="bg-gradient-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent">Dönüştürücü</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[1.05rem] max-w-[520px] mx-auto">
              Miladi ve Hicri tarihler arasında doğru dönüşüm yapın.
            </p>
          </header>

          {/* Today Banner */}
          <div className="hc-today">
            <div className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-white/40">Bugünün Hicri Tarihi</span>
              <span className="font-['Outfit'] text-[1.5rem] font-extrabold text-white">{todayHijri}</span>
              <span className="text-[0.85rem] text-white/50 font-semibold">{todayMiladi}</span>
            </div>
            <div className="hc-today-day">
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
              <span>{todayDayName}</span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

            {/* Miladi → Hicri */}
            <div className="hc-card miladi">
              <div className="hc-card-header">
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                <h2 className="font-['Outfit'] font-extrabold text-[1rem] text-slate-900 dark:text-white">Miladi → Hicri</h2>
              </div>
              <div className="p-7">
                <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2">Miladi Tarih Seçin</label>
                <input 
                  type="date" 
                  className="hc-input mb-2" 
                  value={mInput}
                  onChange={(e) => setMInput(e.target.value)}
                />

                {hResult && (
                  <div className="animate-in fade-in duration-200">
                    <div className="hc-result green">
                      <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-slate-500 mb-1.5">Hicri Karşılığı</div>
                      <div className="font-['Outfit'] text-[1.3rem] font-extrabold text-slate-900 dark:text-white mb-1">{hResult}</div>
                      <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {mDayName}
                      </span>
                    </div>
                    {specialDay && (
                      <div className="hc-special">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{specialDay}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hicri → Miladi */}
            <div className="hc-card hijri">
              <div className="hc-card-header">
                <Moon className="w-4 h-4 text-indigo-500" />
                <h2 className="font-['Outfit'] font-extrabold text-[1rem] text-slate-900 dark:text-white">Hicri → Miladi</h2>
              </div>
              <div className="p-7">
                <div className="grid grid-cols-[1fr_2fr_1fr] gap-2.5 mb-4">
                  <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2">Gün</label>
                    <input 
                      type="number" 
                      min="1" max="30" 
                      className="hc-input indigo text-center" 
                      value={hDay}
                      onChange={(e) => setHDay(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2">Ay</label>
                    <select 
                      className="hc-select"
                      value={hMonth}
                      onChange={(e) => setHMonth(parseInt(e.target.value))}
                    >
                      {hijriMonths.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 mb-2">Yıl</label>
                    <input 
                      type="number" 
                      className="hc-input indigo text-center" 
                      value={hYear}
                      onChange={(e) => setHYear(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {mResult && (
                  <div className="animate-in fade-in duration-200">
                    <div className="hc-result purple">
                      <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-slate-500 mb-1.5">Miladi Karşılığı</div>
                      <div className="font-['Outfit'] text-[1.3rem] font-extrabold text-slate-900 dark:text-white mb-1">{mResult}</div>
                      <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {hDayName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white mb-1">Diyanet Uyumlu</h4>
                <p className="text-[0.73rem] text-slate-500 dark:text-slate-400 leading-relaxed">Türkiye Diyanet İşleri takvimi ile uyumlu hesaplama.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white mb-1">Çift Yönlü</h4>
                <p className="text-[0.73rem] text-slate-500 dark:text-slate-400 leading-relaxed">Miladi'den Hicri'ye ve Hicri'den Miladi'ye anında çevirin.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-amber-500 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white mb-1">Özel Günler</h4>
                <p className="text-[0.73rem] text-slate-500 dark:text-slate-400 leading-relaxed">Kandil, bayram ve önemli İslami günleri otomatik tespit eder.</p>
              </div>
            </div>
          </div>

          <OtherTools />

        </div>
      </div>
    </PageTransition>
  );
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
