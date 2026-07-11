'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Clock, RefreshCw, Calendar, ArrowRightLeft } from 'lucide-react';

export default function EpochConverter() {
  // Live Ticker
  const [currentUnix, setCurrentUnix] = useState(0);

  // Convert Epoch -> Date
  const [inputEpoch, setInputEpoch] = useState('');
  const [outputDate, setOutputDate] = useState<any>(null);

  // Convert Date -> Epoch
  const [inputDate, setInputDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
    tz: 'local',
  });
  const [outputEpoch, setOutputEpoch] = useState<any>(null);

  useEffect(() => {
    setCurrentUnix(Math.floor(Date.now() / 1000));
    const interval = setInterval(() => {
      setCurrentUnix(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEpochToDate = () => {
    if (!inputEpoch) return;
    try {
      const val = Number(inputEpoch);
      const isMillis = val > 9999999999; // Simple heuristic for milliseconds
      const date = new Date(isMillis ? val : val * 1000);

      if (isNaN(date.getTime())) {
        setOutputDate({ error: 'Geçersiz zaman damgası.' });
        return;
      }

      setOutputDate({
        local: date.toLocaleString('tr-TR'),
        gmt: date.toUTCString(),
        isMillis,
      });
    } catch {
      setOutputDate({ error: 'Dönüştürme hatası.' });
    }
  };

  const handleDateToEpoch = () => {
    try {
      const { year, month, day, hours, minutes, seconds, tz } = inputDate;
      let date: Date;

      if (tz === 'gmt') {
        date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
      } else {
        date = new Date(year, month - 1, day, hours, minutes, seconds);
      }

      if (isNaN(date.getTime())) {
        setOutputEpoch({ error: 'Geçersiz tarih değerleri.' });
        return;
      }

      const secondsVal = Math.floor(date.getTime() / 1000);
      const millisVal = date.getTime();

      setOutputEpoch({
        seconds: secondsVal,
        millis: millisVal,
      });
    } catch {
      setOutputEpoch({ error: 'Dönüştürme hatası.' });
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-650 dark:bg-violet-950/30 dark:text-violet-400">
            Unix Zaman Damgası Dönüştürücü
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            Epoch <span className="bg-gradient-to-r from-violet-600 to-indigo-650 bg-clip-text text-transparent">Converter</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Zaman damgası ile insan tarafından okunabilir tarih formatı arasında hızlı dönüşüm yapın.
          </p>
        </header>

        {/* Live Ticker */}
        <section className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-emerald-500" />
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-violet-450" /> Canlı Unix Zaman Damgası
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold mt-2 tracking-wider">
              {currentUnix}
            </div>
          </div>
          <button
            onClick={() => setCurrentUnix(Math.floor(Date.now() / 1000))}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-sm font-bold border border-zinc-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Güncelle
          </button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Epoch -> Date */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-violet-500" /> Epoch to Tarih
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-450 uppercase mb-2">Unix Zaman Damgası (Saniye veya Milisaniye)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={inputEpoch}
                    onChange={(e) => setInputEpoch(e.target.value)}
                    placeholder="örn: 1700000000"
                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={handleEpochToDate}
                    className="px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold shrink-0 transition-colors"
                  >
                    Dönüştür
                  </button>
                </div>
              </div>

              {outputDate && (
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-5 rounded-2xl space-y-3">
                  {outputDate.error ? (
                    <p className="text-sm text-red-500 font-medium">{outputDate.error}</p>
                  ) : (
                    <>
                      <div className="text-xs text-zinc-450">Tepsi Tipi: {outputDate.isMillis ? 'Milisaniye' : 'Saniye'}</div>
                      <div>
                        <span className="block text-xs font-semibold text-zinc-400">Yerel Saat (Gereken Dil):</span>
                        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{outputDate.local}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-zinc-400">GMT / UTC Saat:</span>
                        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{outputDate.gmt}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Date -> Epoch */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" /> Tarih to Epoch
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Yıl</label>
                  <input
                    type="number"
                    value={inputDate.year}
                    onChange={(e) => setInputDate({ ...inputDate, year: Number(e.target.value) })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Ay</label>
                  <input
                    type="number"
                    value={inputDate.month}
                    onChange={(e) => setInputDate({ ...inputDate, month: Number(e.target.value) })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Gün</label>
                  <input
                    type="number"
                    value={inputDate.day}
                    onChange={(e) => setInputDate({ ...inputDate, day: Number(e.target.value) })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Saat</label>
                  <input
                    type="number"
                    value={inputDate.hours}
                    onChange={(e) => setInputDate({ ...inputDate, hours: Number(e.target.value) })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Dakika</label>
                  <input
                    type="number"
                    value={inputDate.minutes}
                    onChange={(e) => setInputDate({ ...inputDate, minutes: Number(e.target.value) })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Saniye</label>
                  <input
                    type="number"
                    value={inputDate.seconds}
                    onChange={(e) => setInputDate({ ...inputDate, seconds: Number(e.target.value) })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Saat Dilimi</label>
                  <select
                    value={inputDate.tz}
                    onChange={(e) => setInputDate({ ...inputDate, tz: e.target.value })}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-2 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white text-center text-xs focus:outline-none"
                  >
                    <option value="local">Yerel</option>
                    <option value="gmt">GMT/UTC</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleDateToEpoch}
                className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-sm font-bold transition-colors"
              >
                Epoch Değerine Dönüştür
              </button>

              {outputEpoch && (
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-5 rounded-2xl space-y-3">
                  {outputEpoch.error ? (
                    <p className="text-sm text-red-500 font-medium">{outputEpoch.error}</p>
                  ) : (
                    <>
                      <div>
                        <span className="block text-xs font-semibold text-zinc-400">Epoch (Saniye):</span>
                        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{outputEpoch.seconds}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-zinc-400">Epoch (Milisaniye):</span>
                        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{outputEpoch.millis}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
