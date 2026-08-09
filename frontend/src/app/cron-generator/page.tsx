'use client';

import React, { useState, useMemo } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import {
  Clock,
  Sparkles,
  Copy,
  Check,
  Code2,
  CalendarDays,
  Zap,
  Terminal,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CronPreset {
  name: string;
  cron: string;
  desc: string;
  badge?: string;
}

const PRESETS: CronPreset[] = [
  { name: 'Her Dakika', cron: '* * * * *', desc: 'Her dakika başında çalışır', badge: 'Hızlı' },
  { name: 'Her 5 Dakikada Bir', cron: '*/5 * * * *', desc: '0, 5, 10, 15... dakikalarda' },
  { name: 'Her 15 Dakikada Bir', cron: '*/15 * * * *', desc: 'Çeyrek saat aralıklarla' },
  { name: 'Her 30 Dakikada Bir', cron: '*/30 * * * *', desc: 'Yarım saatte bir' },
  { name: 'Her Saat Başı', cron: '0 * * * *', desc: 'Her saat 00. dakikada', badge: 'Popüler' },
  { name: 'Her 2 Saatte Bir', cron: '0 */2 * * *', desc: '2 saat aralıklarla' },
  { name: 'Her 6 Saatte Bir', cron: '0 */6 * * *', desc: '00:00, 06:00, 12:00, 18:00' },
  { name: 'Her Gece Yarısı', cron: '0 0 * * *', desc: 'Her gece saat 00:00\'da', badge: 'Popüler' },
  { name: 'Her Sabah 09:00', cron: '0 9 * * *', desc: 'Her gün sabah saat 09:00\'da' },
  { name: 'Hafta İçi Her Gün 09:00', cron: '0 9 * * 1-5', desc: 'Pazartesi-Cuma arası 09:00\'da', badge: 'İş Günü' },
  { name: 'Hafta Sonu 10:00', cron: '0 10 * * 6,0', desc: 'Cumartesi ve Pazar 10:00\'da' },
  { name: 'Her Pazar Gece Yarısı', cron: '0 0 * * 0', desc: 'Haftada bir Pazar 00:00\'da' },
  { name: 'Her Ayın 1\'inde', cron: '0 0 1 * *', desc: 'Her ayın ilk günü 00:00\'da', badge: 'Aylık' },
  { name: 'Her Ayın 15\'inde', cron: '0 12 15 * *', desc: 'Her ayın 15. günü saat 12:00\'de' },
  { name: 'Yılbaşı (1 Ocak)', cron: '0 0 1 1 *', desc: 'Her yıl 1 Ocak 00:00\'da', badge: 'Yıllık' },
];

export default function CronGenerator() {
  // Master Cron Input (User can type freely anything, e.g. "* 1 * * 2")
  const [cronInput, setCronInput] = useState<string>('*/5 * * * *');

  // Active visual builder tab
  const [builderTab, setBuilderTab] = useState<'minutes' | 'hours' | 'day' | 'month' | 'weekday'>('minutes');

  // Copy state
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Parse the 5 fields from cronInput safely
  const { minute, hour, dayOfMonth, month, dayOfWeek } = useMemo(() => {
    const parts = cronInput.trim().split(/\s+/);
    return {
      minute: parts[0] || '*',
      hour: parts[1] || '*',
      dayOfMonth: parts[2] || '*',
      month: parts[3] || '*',
      dayOfWeek: parts[4] || '*',
    };
  }, [cronInput]);

  // Validation Helper
  const validateField = (val: string, min: number, max: number, name: string): { valid: boolean; error?: string } => {
    if (!val || val === '') return { valid: false, error: `${name} alanı boş bırakılamaz.` };
    if (val === '*') return { valid: true };

    const isNumericString = (s: string) => /^\d+$/.test(s);

    // Step (e.g. */5 or 10-30/5 or 1/5)
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length !== 2) {
        return { valid: false, error: `${name} alanında geçersiz adım formatı ("${val}").` };
      }
      const [base, stepStr] = parts;
      const step = parseInt(stepStr, 10);
      if (!isNumericString(stepStr) || isNaN(step) || step <= 0 || step > max) {
        return { valid: false, error: `${name} alanında geçersiz adım değeri ("${stepStr}"). 1-${max} arasında bir sayı olmalıdır.` };
      }
      if (base !== '*') {
        const baseValidation = validateField(base, min, max, name);
        if (!baseValidation.valid) return baseValidation;
      }
      return { valid: true };
    }

    // Lists (e.g. 1,5,10)
    if (val.includes(',')) {
      const items = val.split(',');
      for (const item of items) {
        if (!item || !validateField(item, min, max, name).valid) {
          return { valid: false, error: `${name} alanındaki "${item}" değeri geçersizdir (${min}-${max} arasında geçerli bir değer olmalıdır).` };
        }
      }
      return { valid: true };
    }

    // Ranges (e.g. 1-5)
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length !== 2) {
        return { valid: false, error: `${name} alanında geçersiz aralık formatı ("${val}").` };
      }
      const [startStr, endStr] = parts;
      if (!isNumericString(startStr) || !isNumericString(endStr)) {
        return { valid: false, error: `${name} aralığı sadece sayılardan oluşmalıdır ("${val}").` };
      }
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
        return { valid: false, error: `${name} alanında geçersiz aralık ("${val}"). ${min}-${max} arasında ve küçükten büyüğe olmalıdır.` };
      }
      return { valid: true };
    }

    // Single number
    if (!isNumericString(val)) {
      return { valid: false, error: `${name} alanında geçersiz karakter ("${val}"). Sadece ${min}-${max} arası sayı, * veya */adım kullanılabilir.` };
    }
    const num = parseInt(val, 10);
    if (isNaN(num) || num < min || num > max) {
      return { valid: false, error: `${name} değeri ${min}-${max} sınırları dışında ("${val}").` };
    }

    return { valid: true };
  };

  // Full Expression Validation
  const validationResult = useMemo(() => {
    const parts = cronInput.trim().split(/\s+/);
    if (parts.length !== 5) {
      return {
        isValid: false,
        error: `Cron ifadesi tam 5 alandan oluşmalıdır (Şu an: ${parts.length} alan). Örn: */5 * * * *`,
        errorField: null,
      };
    }

    const [m, h, dom, mon, dow] = parts;

    const mCheck = validateField(m, 0, 59, '1. Alan (Dakika)');
    if (!mCheck.valid) return { isValid: false, error: mCheck.error, errorField: 0 };

    const hCheck = validateField(h, 0, 23, '2. Alan (Saat)');
    if (!hCheck.valid) return { isValid: false, error: hCheck.error, errorField: 1 };

    const domCheck = validateField(dom, 1, 31, '3. Alan (Ayın Günü)');
    if (!domCheck.valid) return { isValid: false, error: domCheck.error, errorField: 2 };

    const monCheck = validateField(mon, 1, 12, '4. Alan (Ay)');
    if (!monCheck.valid) return { isValid: false, error: monCheck.error, errorField: 3 };

    const dowCheck = validateField(dow, 0, 7, '5. Alan (Haftanın Günü)');
    if (!dowCheck.valid) return { isValid: false, error: dowCheck.error, errorField: 4 };

    return { isValid: true, error: null, errorField: null };
  }, [cronInput]);

  // Update a single field while keeping the rest
  const updateSingleField = (fieldIndex: number, newValue: string) => {
    const parts = cronInput.trim().split(/\s+/);
    while (parts.length < 5) parts.push('*');
    parts[fieldIndex] = newValue;
    setCronInput(parts.join(' '));
  };

  const applyPreset = (presetCron: string) => {
    setCronInput(presetCron);
  };

  // Turkish Humanizer Logic (Only runs when valid)
  const humanizedDescription = useMemo(() => {
    if (!validationResult.isValid) {
      return null;
    }

    try {
      const parts = cronInput.trim().split(/\s+/);
      const [m, h, dom, mon, dow] = parts;

      if (m === '*' && h === '*' && dom === '*' && mon === '*' && dow === '*') {
        return 'Her dakika kesintisiz olarak çalışır.';
      }

      const dayNames: Record<string, string> = {
        '0': 'Pazar', '1': 'Pazartesi', '2': 'Salı', '3': 'Çarşamba',
        '4': 'Perşembe', '5': 'Cuma', '6': 'Cumartesi', '7': 'Pazar',
        '1-5': 'Hafta içi her gün (Pazartesi - Cuma)',
        '6,0': 'Hafta sonu (Cumartesi - Pazar)',
        '0,6': 'Hafta sonu (Cumartesi - Pazar)',
      };

      const monthNames: Record<string, string> = {
        '1': 'Ocak', '2': 'Şubat', '3': 'Mart', '4': 'Nisan', '5': 'Mayıs', '6': 'Haziran',
        '7': 'Temmuz', '8': 'Ağustos', '9': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık'
      };

      let dowDesc = '';
      if (dow !== '*') {
        if (dayNames[dow]) {
          dowDesc = `Her ${dayNames[dow]}`;
        } else if (dow.includes('-')) {
          const [s, e] = dow.split('-');
          dowDesc = `${dayNames[s] || s} ile ${dayNames[e] || e} arasındaki günlerde`;
        } else {
          const mapped = dow.split(',').map(d => dayNames[d] || d).join(', ');
          dowDesc = `Haftanın ${mapped} günlerinde`;
        }
      }

      let domDesc = '';
      if (dom !== '*') {
        if (dom.startsWith('*/')) domDesc = `her ${dom.replace('*/', '')} günde bir`;
        else if (dom.includes(',')) domDesc = `ayın ${dom}. günlerinde`;
        else domDesc = `ayın ${dom}. günü`;
      }

      let monDesc = '';
      if (mon !== '*') {
        if (mon.startsWith('*/')) monDesc = `her ${mon.replace('*/', '')} ayda bir`;
        else if (monthNames[mon]) monDesc = `${monthNames[mon]} ayında`;
        else {
          const mNames = mon.split(',').map(mo => monthNames[mo] || mo).join(', ');
          monDesc = `${mNames} aylarında`;
        }
      }

      let timeDesc = '';
      const isSpecificMinute = m !== '*' && !m.startsWith('*/') && !m.includes(',') && !m.includes('-');
      const isSpecificHour = h !== '*' && !h.startsWith('*/') && !h.includes(',') && !h.includes('-');

      if (isSpecificHour && isSpecificMinute) {
        timeDesc = `saat ${h.padStart(2, '0')}:${m.padStart(2, '0')}'da`;
      } else if (isSpecificHour && m === '*') {
        timeDesc = `saat ${h.padStart(2, '0')}:00 - ${h.padStart(2, '0')}:59 arasında her dakika`;
      } else if (isSpecificHour && m.startsWith('*/')) {
        timeDesc = `saat ${h.padStart(2, '0')}:00'da başlayarak her ${m.replace('*/', '')} dakikada bir`;
      } else if (h === '*' && m.startsWith('*/')) {
        timeDesc = `her saat ${m.replace('*/', '')} dakikada bir`;
      } else if (h === '*' && isSpecificMinute) {
        timeDesc = `her saatin ${m}. dakikasında`;
      } else if (h.startsWith('*/') && isSpecificMinute) {
        timeDesc = `her ${h.replace('*/', '')} saatte bir (${m}. dakikada)`;
      } else if (h.startsWith('*/') && m === '*') {
        timeDesc = `her ${h.replace('*/', '')} saatte bir (tüm saat boyunca her dakika)`;
      } else {
        timeDesc = `[Saat: ${h}, Dakika: ${m}] zamanında`;
      }

      const partsList = [dowDesc, domDesc, monDesc, timeDesc].filter(Boolean);
      return `${partsList.join(', ')} çalışır.`;
    } catch {
      return 'Geçerli bir Cron ifadesi girildiğinde çalışma planı burada görünecektir.';
    }
  }, [cronInput, validationResult]);

  // Compute Next 5 Execution Times
  const nextRuns = useMemo(() => {
    if (!validationResult.isValid) return [];

    const dates: Date[] = [];
    try {
      const parts = cronInput.trim().split(/\s+/);
      const [m, h, dom, mon, dow] = parts;
      let current = new Date();
      current.setSeconds(0, 0);

      const matchField = (val: number, expr: string): boolean => {
        if (expr === '*') return true;
        if (expr.startsWith('*/')) {
          const step = parseInt(expr.replace('*/', ''), 10);
          return !isNaN(step) && step > 0 && val % step === 0;
        }
        if (expr.includes(',')) {
          return expr.split(',').map(Number).includes(val);
        }
        if (expr.includes('-')) {
          const [start, end] = expr.split('-').map(Number);
          return val >= start && val <= end;
        }
        return val === parseInt(expr, 10);
      };

      let attempts = 0;
      while (dates.length < 5 && attempts < 50000) {
        attempts++;
        current = new Date(current.getTime() + 60000); // add 1 minute

        const currM = current.getMinutes();
        const currH = current.getHours();
        const currDom = current.getDate();
        const currMon = current.getMonth() + 1; // 1-12
        const currDow = current.getDay(); // 0-6

        const mMatch = matchField(currM, m);
        const hMatch = matchField(currH, h);
        const domMatch = matchField(currDom, dom);
        const monMatch = matchField(currMon, mon);
        const dowMatch = matchField(currDow, dow);

        if (mMatch && hMatch && domMatch && monMatch && dowMatch) {
          dates.push(new Date(current));
        }
      }
    } catch (e) {
      console.error('Schedule calc error', e);
    }
    return dates;
  }, [cronInput, validationResult]);

  const copyToClipboard = (text: string, type?: string) => {
    navigator.clipboard.writeText(text);
    if (type) {
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const faqItems = [
    {
      question: 'Cron ve Crontab nedir?',
      answer: 'Cron, Linux ve Unix benzeri işletim sistemlerinde belirli görevleri (backup alma, e-posta gönderme, veritabanı temizleme vb.) arka planda belirlenen zaman aralıklarında otomatik olarak çalıştıran bir zamanlayıcıdır. Crontab (Cron Table) ise bu zamanlama komutlarının tutulduğu tablodur.'
    },
    {
      question: '5 haneli Cron sözdizimi (Syntax) ne anlama gelir?',
      answer: 'Standart Cron ifadesi boşlukla ayrılmış 5 alandan oluşur: [1. Dakika (0-59)] [2. Saat (0-23)] [3. Ayın Günü (1-31)] [4. Ay (1-12)] [5. Haftanın Günü (0-6, 0=Pazar)]. Örneğin "* 1 * * 2" ifadesi Salı günleri saat 01:00-01:59 arası her dakika anlamına gelir.'
    },
    {
      question: 'Cron ifadelerinde özel karakterler ne işe yarar?',
      answer: '* (Yıldız): Her zaman birimi anlamına gelir.\n/ (Bölü): Aralık belirtir (örn. */15 = her 15 birimde bir).\n, (Virgül): Liste oluşturur (örn. 1,3,5 = 1., 3. ve 5. günlerde).\n- (Tire): Aralık belirtir (örn. 1-5 = 1\'den 5\'e kadar).'
    },
    {
      question: 'Node.js, NestJS veya Spring Boot projelerinde nasıl kullanılır?',
      answer: 'Ürettiğiniz cron ifadesini Node.js projelerinde "node-cron" paketiyle, NestJS\'te "@Cron(\'0 0 * * *\')" dekoratörüyle, Spring Boot\'ta ise "@Scheduled(cron = \'...\')" anotasyonuyla doğrudan kullanabilirsiniz. Sayfadaki kod şablonları bölümünden tek tıkla kopyalayabilirsiniz.'
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold text-xs border border-brand-blue/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Zamanlayıcı & Crontab Aracı</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Cron Expression Generator & Açıklayıcı
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            İstediğiniz Cron ifadesini manuel yazın veya görsel butonlarla oluşturun; anında Türkçe karşılığını ve sonraki çalışma zamanlarını görün.
          </p>
        </div>

        {/* Main Display Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6 mb-8">
          
          {/* Editable Cron String */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-brand-blue" />
                Cron İfadesi (Manuel Yazabilir veya Değiştirebilirsiniz)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                [dakika] [saat] [gün] [ay] [haftanın günü]
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                placeholder="* * * * * veya * 1 * * 2"
                className={`w-full p-4 pr-32 font-mono text-xl sm:text-2xl font-bold rounded-2xl border transition-colors tracking-wider focus:outline-none ${
                  validationResult.isValid
                    ? 'bg-slate-900 text-emerald-400 border-slate-800 focus:ring-2 focus:ring-brand-blue/30'
                    : 'bg-slate-900 text-red-400 border-red-500/80 focus:ring-2 focus:ring-red-500/30'
                }`}
              />
              <button
                type="button"
                onClick={() => copyToClipboard(cronInput)}
                disabled={!validationResult.isValid}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

          {/* Validation & Humanized Description Banner */}
          {validationResult.isValid ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-start sm:items-center gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Geçerli Cron İfadesi (Açıklama):
                </span>
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {humanizedDescription}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/30 flex items-start sm:items-center gap-3.5">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 shadow-md shadow-red-600/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                  Geçersiz Cron Sözdizimi (Hata):
                </span>
                <p className="text-sm sm:text-base font-bold text-red-700 dark:text-red-300 mt-0.5">
                  {validationResult.error}
                </p>
              </div>
            </div>
          )}

          {/* 5 Field Visual Interactive Column Editors */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-600 dark:text-zinc-400">
              Alanları Ayrı Ayrı Düzenleyin:
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'minutes', label: 'Dakika', val: minute, idx: 0, range: '0-59' },
                { id: 'hours', label: 'Saat', val: hour, idx: 1, range: '0-23' },
                { id: 'day', label: 'Ayın Günü', val: dayOfMonth, idx: 2, range: '1-31' },
                { id: 'month', label: 'Ay', val: month, idx: 3, range: '1-12' },
                { id: 'weekday', label: 'Hafta Günü', val: dayOfWeek, idx: 4, range: '0-6 (Pzr=0)' },
              ].map((col) => {
                const isFieldInvalid = validationResult.errorField === col.idx;
                return (
                  <div
                    key={col.id}
                    onClick={() => setBuilderTab(col.id as any)}
                    className={`p-3 rounded-2xl text-center transition-all cursor-pointer border ${
                      isFieldInvalid
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 dark:text-red-400 shadow-sm'
                        : builderTab === col.id
                        ? 'bg-brand-blue/10 dark:bg-brand-blue/20 border-brand-blue text-brand-blue shadow-sm'
                        : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold uppercase">{col.label}</div>
                    <input
                      type="text"
                      value={col.val}
                      onChange={(e) => updateSingleField(col.idx, e.target.value)}
                      className={`w-full text-center font-mono text-base font-black my-1 p-1 rounded bg-white dark:bg-zinc-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${
                        isFieldInvalid
                          ? 'border-red-500 text-red-600 dark:text-red-400 focus:ring-red-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-brand-blue'
                      }`}
                    />
                    <div className="text-[10px] text-slate-400">{col.range}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Quick Buttons Area */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-4">
            
            {/* Minutes Tab */}
            {builderTab === 'minutes' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Hızlı Dakika Seçenekleri:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Her Dakika (*)', val: '*' },
                    { label: 'Her 5 Dakikada Bir (*/5)', val: '*/5' },
                    { label: 'Her 10 Dakikada Bir (*/10)', val: '*/10' },
                    { label: 'Her 15 Dakikada Bir (*/15)', val: '*/15' },
                    { label: 'Her 30 Dakikada Bir (*/30)', val: '*/30' },
                    { label: '0. Dakika (Saat Başı)', val: '0' },
                    { label: '15. Dakika', val: '15' },
                    { label: '30. Dakika', val: '30' },
                    { label: '45. Dakika', val: '45' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => updateSingleField(0, item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        minute === item.val
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hours Tab */}
            {builderTab === 'hours' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Hızlı Saat Seçenekleri:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Her Saat (*)', val: '*' },
                    { label: 'Her 2 Saatte Bir (*/2)', val: '*/2' },
                    { label: 'Her 4 Saatte Bir (*/4)', val: '*/4' },
                    { label: 'Her 6 Saatte Bir (*/6)', val: '*/6' },
                    { label: 'Saat 01:00 (1)', val: '1' },
                    { label: 'Gece 00:00 (0)', val: '0' },
                    { label: 'Sabah 06:00 (6)', val: '6' },
                    { label: 'Sabah 09:00 (9)', val: '9' },
                    { label: 'Öğle 12:00 (12)', val: '12' },
                    { label: 'Akşam 18:00 (18)', val: '18' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => updateSingleField(1, item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        hour === item.val
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Day of Month Tab */}
            {builderTab === 'day' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Ayın Günü Seçenekleri:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Her Gün (*)', val: '*' },
                    { label: 'Her 2 Günde Bir (*/2)', val: '*/2' },
                    { label: 'Her 5 Günde Bir (*/5)', val: '*/5' },
                    { label: 'Ayın 1. Günü', val: '1' },
                    { label: 'Ayın 15. Günü', val: '15' },
                    { label: 'Ayın Son Günü (31)', val: '31' },
                    { label: '1. ve 15. Günler', val: '1,15' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => updateSingleField(2, item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        dayOfMonth === item.val
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Month Tab */}
            {builderTab === 'month' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Ay Seçenekleri:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Her Ay (*)', val: '*' },
                    { label: 'Her 3 Ayda Bir (Çeyrek / */3)', val: '*/3' },
                    { label: 'Her 6 Ayda Bir (*/6)', val: '*/6' },
                    { label: 'Ocak (1)', val: '1' },
                    { label: 'Nisan (4)', val: '4' },
                    { label: 'Temmuz (7)', val: '7' },
                    { label: 'Ekim (10)', val: '10' },
                    { label: 'Aralık (12)', val: '12' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => updateSingleField(3, item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        month === item.val
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weekday Tab */}
            {builderTab === 'weekday' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Haftanın Günü Seçenekleri:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Her Gün (*)', val: '*' },
                    { label: 'Hafta İçi (Pazartesi - Cuma / 1-5)', val: '1-5' },
                    { label: 'Hafta Sonu (Cumartesi - Pazar / 6,0)', val: '6,0' },
                    { label: 'Pazartesi (1)', val: '1' },
                    { label: 'Salı (2)', val: '2' },
                    { label: 'Çarşamba (3)', val: '3' },
                    { label: 'Perşembe (4)', val: '4' },
                    { label: 'Cuma (5)', val: '5' },
                    { label: 'Cumartesi (6)', val: '6' },
                    { label: 'Pazar (0)', val: '0' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => updateSingleField(4, item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        dayOfWeek === item.val
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* 2-Column Grid: Next Runs & Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Next 5 Execution Times */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
              Gelecek 5 Çalışma Zamanı (Next Schedules)
            </h3>

            <div className="space-y-2.5">
              {nextRuns.length > 0 ? (
                nextRuns.map((date, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {date.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                      {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                  {validationResult.isValid
                    ? 'Yakın zamanlı çalışma takvimi hesaplanamadı.'
                    : 'Geçerli bir Cron ifadesi girildiğinde çalışma takvimi burada listelenecektir.'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Popüler Hazır Şablonlar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.cron)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                    cronInput === p.cron
                      ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate group-hover:text-brand-blue">{p.name}</span>
                    {p.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-blue">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{p.cron}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Code Snippets for Developers */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4 mb-8">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-500" />
            Tek Tıkla Projenize Ekleyin (Kodlama Şablonları)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                id: 'crontab',
                label: 'Linux Crontab',
                code: `${cronInput} /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1`,
              },
              {
                id: 'node',
                label: 'Node.js (node-cron)',
                code: `cron.schedule('${cronInput}', () => {\n  console.log('Task executed');\n});`,
              },
              {
                id: 'nestjs',
                label: 'NestJS (@nestjs/schedule)',
                code: `@Cron('${cronInput}')\nhandleCron() {\n  this.logger.debug('Called');\n}`,
              },
              {
                id: 'spring',
                label: 'Spring Boot (Java)',
                code: `@Scheduled(cron = "${cronInput}")\npublic void executeTask() {\n  // your task\n}`,
              },
              {
                id: 'python',
                label: 'Python (Celery / croniter)',
                code: `from celery.schedules import crontab\n\n'schedule': crontab('${minute}', '${hour}', '${dayOfMonth}', '${month}', '${dayOfWeek}')`,
              },
              {
                id: 'golang',
                label: 'Go (robfig/cron)',
                code: `c := cron.New()\nc.AddFunc("${cronInput}", func() {\n  fmt.Println("Run")\n})`,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.code, item.id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-brand-blue transition-colors cursor-pointer"
                      title="Kopyala"
                    >
                      {copiedCode === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="mt-2 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {item.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <FAQ items={faqItems} />
        </div>

        {/* Other Tools Navigation */}
        <OtherTools />

      </div>
    </PageTransition>
  );
}
