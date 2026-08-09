'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import {
  Clock,
  Calendar,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Code2,
  CalendarDays,
  Play,
  Terminal,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
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
  // Cron 5 Fields
  const [minute, setMinute] = useState<string>('*');
  const [hour, setHour] = useState<string>('*');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');

  // Active builder tab
  const [builderTab, setBuilderTab] = useState<'minutes' | 'hours' | 'day' | 'month' | 'weekday'>('minutes');

  // Copy state
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Full expression string
  const currentCron = useMemo(() => {
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`.trim();
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  // Load from input
  const handleCronStringChange = (val: string) => {
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  const applyPreset = (presetCron: string) => {
    handleCronStringChange(presetCron);
  };

  // Turkish Humanizer Logic
  const humanizedDescription = useMemo(() => {
    try {
      const m = minute;
      const h = hour;
      const dom = dayOfMonth;
      const mon = month;
      const dow = dayOfWeek;

      if (m === '*' && h === '*' && dom === '*' && mon === '*' && dow === '*') {
        return 'Her dakika kesintisiz olarak çalışır.';
      }

      let minuteDesc = '';
      if (m === '*') minuteDesc = 'her dakika';
      else if (m.startsWith('*/')) minuteDesc = `her ${m.replace('*/', '')} dakikada bir`;
      else if (m.includes(',')) minuteDesc = `${m}. dakikalarda`;
      else if (m.includes('-')) minuteDesc = `${m} dakikaları arasında`;
      else minuteDesc = `${m}. dakikada`;

      let hourDesc = '';
      if (h === '*') hourDesc = 'günün her saati';
      else if (h.startsWith('*/')) hourDesc = `her ${h.replace('*/', '')} saatte bir`;
      else if (h.includes(',')) hourDesc = `saat ${h}'de`;
      else if (h.includes('-')) hourDesc = `saat ${h} aralığında`;
      else hourDesc = `saat ${h.padStart(2, '0')}:${m === '*' ? '00' : m.padStart(2, '0')}'da`;

      const dayNames: Record<string, string> = {
        '0': 'Pazar', '1': 'Pazartesi', '2': 'Salı', '3': 'Çarşamba',
        '4': 'Perşembe', '5': 'Cuma', '6': 'Cumartesi', '7': 'Pazar',
        '1-5': 'Hafta içi her gün (Pazartesi - Cuma)',
        '6,0': 'Hafta sonu (Cumartesi - Pazar)',
        '0,6': 'Hafta sonu (Cumartesi - Pazar)',
      };

      let dowDesc = '';
      if (dow !== '*') {
        if (dayNames[dow]) {
          dowDesc = dayNames[dow];
        } else {
          const mapped = dow.split(',').map(d => dayNames[d] || d).join(', ');
          dowDesc = `haftanın ${mapped} günleri`;
        }
      }

      let domDesc = '';
      if (dom !== '*') {
        if (dom.startsWith('*/')) domDesc = `her ${dom.replace('*/', '')} günde bir`;
        else domDesc = `ayın ${dom}. günü`;
      }

      let monDesc = '';
      const monthNames: Record<string, string> = {
        '1': 'Ocak', '2': 'Şubat', '3': 'Mart', '4': 'Nisan', '5': 'Mayıs', '6': 'Haziran',
        '7': 'Temmuz', '8': 'Ağustos', '9': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık'
      };
      if (mon !== '*') {
        if (mon.startsWith('*/')) monDesc = `her ${mon.replace('*/', '')} ayda bir`;
        else {
          const mNames = mon.split(',').map(mo => monthNames[mo] || mo).join(', ');
          monDesc = `${mNames} ayında`;
        }
      }

      // Compose sentence
      let sentence = '';
      if (dowDesc) sentence += `${dowDesc}, `;
      if (domDesc) sentence += `${domDesc}, `;
      if (monDesc) sentence += `${monDesc}, `;
      
      if (h !== '*' && !h.startsWith('*/') && !h.includes(',') && !h.includes('-')) {
        sentence += `saat ${h.padStart(2, '0')}:${m === '*' ? '00' : m.padStart(2, '0')}'da çalışır.`;
      } else {
        sentence += `${hourDesc} (${minuteDesc}) çalışır.`;
      }

      return sentence.trim();
    } catch {
      return 'Geçerli bir Cron ifadesi girildiğinde çalışma planı burada görünecektir.';
    }
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  // Compute Next 5 Execution Times
  const nextRuns = useMemo(() => {
    const dates: Date[] = [];
    try {
      let current = new Date();
      current.setSeconds(0, 0);

      // Simple match checker
      const matchField = (val: number, expr: string): boolean => {
        if (expr === '*') return true;
        if (expr.startsWith('*/')) {
          const step = parseInt(expr.replace('*/', ''), 10);
          return val % step === 0;
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

        const m = current.getMinutes();
        const h = current.getHours();
        const dom = current.getDate();
        const mon = current.getMonth() + 1; // 1-12
        const dow = current.getDay(); // 0-6

        const mMatch = matchField(m, minute);
        const hMatch = matchField(h, hour);
        const domMatch = matchField(dom, dayOfMonth);
        const monMatch = matchField(mon, month);
        const dowMatch = matchField(dow, dayOfWeek);

        if (mMatch && hMatch && domMatch && monMatch && dowMatch) {
          dates.push(new Date(current));
        }
      }
    } catch (e) {
      console.error('Schedule calc error', e);
    }
    return dates;
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

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
      answer: 'Standart Cron ifadesi boşlukla ayrılmış 5 alandan oluşur: [1. Dakika (0-59)] [2. Saat (0-23)] [3. Ayın Günü (1-31)] [4. Ay (1-12)] [5. Haftanın Günü (0-6, 0=Pazar)]. Örneğin "0 9 * * 1-5" ifadesi hafta içi her gün sabah 09:00 anlamına gelir.'
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
            Linux Crontab, Node.js, NestJS ve Spring Boot için görsel olarak Cron ifadeleri oluşturun, Türkçe insan diline çevirin ve sonraki çalışma zamanlarını görün.
          </p>
        </div>

        {/* Main Display Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6 mb-8">
          
          {/* Editable Cron String */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-brand-blue" />
                Oluşturulan Cron İfadesi
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                [dakika] [saat] [gün] [ay] [haftanın günü]
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={currentCron}
                onChange={(e) => handleCronStringChange(e.target.value)}
                className="w-full p-4 pr-32 font-mono text-xl sm:text-2xl font-bold bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 select-all tracking-wider"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(currentCron)}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
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

          {/* Humanized Description Banner */}
          <div className="p-4 rounded-2xl bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 flex items-start sm:items-center gap-3.5">
            <div className="p-2 rounded-xl bg-brand-blue text-white shrink-0 shadow-md shadow-brand-blue/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue block">
                Türkçe İnsan Dili Açıklaması:
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {humanizedDescription}
              </p>
            </div>
          </div>

          {/* 5 Field Visual Column Indicators */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {[
              { id: 'minutes', label: 'Dakika', val: minute, range: '0-59' },
              { id: 'hours', label: 'Saat', val: hour, range: '0-23' },
              { id: 'day', label: 'Ayın Günü', val: dayOfMonth, range: '1-31' },
              { id: 'month', label: 'Ay', val: month, range: '1-12' },
              { id: 'weekday', label: 'Hafta Günü', val: dayOfWeek, range: '0-6 (Pzr=0)' },
            ].map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setBuilderTab(col.id as any)}
                className={`p-3 rounded-2xl text-center transition-all cursor-pointer border ${
                  builderTab === col.id
                    ? 'bg-brand-blue/10 dark:bg-brand-blue/20 border-brand-blue text-brand-blue shadow-sm'
                    : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-extrabold uppercase">{col.label}</div>
                <div className="font-mono text-base font-black my-1 text-slate-900 dark:text-white">{col.val}</div>
                <div className="text-[10px] text-slate-400">{col.range}</div>
              </button>
            ))}
          </div>

          {/* Interactive Builder Area */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-4">
            
            {/* Minutes Tab */}
            {builderTab === 'minutes' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Dakika Ayarları:</h4>
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
                      onClick={() => setMinute(item.val)}
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
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Saat Ayarları:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Her Saat (*)', val: '*' },
                    { label: 'Her 2 Saatte Bir (*/2)', val: '*/2' },
                    { label: 'Her 4 Saatte Bir (*/4)', val: '*/4' },
                    { label: 'Her 6 Saatte Bir (*/6)', val: '*/6' },
                    { label: 'Her 12 Saatte Bir (*/12)', val: '*/12' },
                    { label: 'Gece 00:00', val: '0' },
                    { label: 'Sabah 06:00', val: '6' },
                    { label: 'Sabah 09:00', val: '9' },
                    { label: 'Öğle 12:00', val: '12' },
                    { label: 'Akşam 18:00', val: '18' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setHour(item.val)}
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
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Ayın Günü Ayarları:</h4>
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
                      onClick={() => setDayOfMonth(item.val)}
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
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Ay Ayarları:</h4>
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
                      onClick={() => setMonth(item.val)}
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
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Haftanın Günü Ayarları:</h4>
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
                      onClick={() => setDayOfWeek(item.val)}
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
                <div className="p-4 text-center text-xs text-slate-400">
                  Yakın zamanlı çalışma takvimi hesaplanamadı.
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
                    currentCron === p.cron
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
                code: `${currentCron} /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1`,
              },
              {
                id: 'node',
                label: 'Node.js (node-cron)',
                code: `cron.schedule('${currentCron}', () => {\n  console.log('Task executed');\n});`,
              },
              {
                id: 'nestjs',
                label: 'NestJS (@nestjs/schedule)',
                code: `@Cron('${currentCron}')\nhandleCron() {\n  this.logger.debug('Called');\n}`,
              },
              {
                id: 'spring',
                label: 'Spring Boot (Java)',
                code: `@Scheduled(cron = "${currentCron}")\npublic void executeTask() {\n  // your task\n}`,
              },
              {
                id: 'python',
                label: 'Python (Celery / croniter)',
                code: `from celery.schedules import crontab\n\n'schedule': crontab('${minute}', '${hour}', '${dayOfMonth}', '${month}', '${dayOfWeek}')`,
              },
              {
                id: 'golang',
                label: 'Go (robfig/cron)',
                code: `c := cron.New()\nc.AddFunc("${currentCron}", func() {\n  fmt.Println("Run")\n})`,
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
