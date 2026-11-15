'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Pause,
  Play,
  Trash2,
  Mail,
  ExternalLink,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import OtherTools from '@/components/OtherTools';
import { api } from '@/lib/api';

interface UptimeCheckItem {
  id: string;
  status: 'up' | 'down';
  statusCode: number | null;
  responseTimeMs: number;
  error: string | null;
  checkedAt: string;
}

interface UptimeMonitorItem {
  id: string;
  name: string;
  url: string;
  alertEmail: string | null;
  isActive: boolean;
  lastStatus: 'up' | 'down' | 'pending';
  lastStatusCode: number | null;
  lastResponseTimeMs: number | null;
  sslDaysRemaining: number | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  recentChecks: UptimeCheckItem[];
}

const OWNER_ID_KEY = 'kisalink_owner_id';

function getOwnerHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  let id = localStorage.getItem(OWNER_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(OWNER_ID_KEY, id);
  }
  return { 'x-owner-id': id };
}

export default function UptimePage() {
  const [monitors, setMonitors] = useState<UptimeMonitorItem[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2500);
  }, []);

  const loadMonitors = useCallback(async () => {
    try {
      const { data } = await api.get<UptimeMonitorItem[]>('/uptime/monitors', {
        headers: getOwnerHeaders(),
      });
      setMonitors(data);
      setError('');
    } catch {
      setError('Monitörler yüklenemedi');
    }
  }, []);

  useEffect(() => {
    void loadMonitors();
    const timer = setInterval(() => {
      void loadMonitors();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadMonitors]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post(
        '/uptime/monitors',
        {
          name: name.trim(),
          url: url.trim(),
          ...(alertEmail.trim() ? { alertEmail: alertEmail.trim() } : {}),
        },
        { headers: getOwnerHeaders() },
      );
      setName('');
      setUrl('');
      setAlertEmail('');
      await loadMonitors();
      showToast('Monitör eklendi ve ilk kontrol tamamlandı');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
        ?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Monitör eklenemedi');
    } finally {
      setCreating(false);
    }
  };

  const handleCheckNow = async (id: string) => {
    setCheckingId(id);
    try {
      await api.post(`/uptime/monitors/${id}/check`, {}, { headers: getOwnerHeaders() });
      await loadMonitors();
      showToast('Kontrol tamamlandı');
    } finally {
      setCheckingId(null);
    }
  };

  const handleToggle = async (m: UptimeMonitorItem) => {
    await api.patch(
      `/uptime/monitors/${m.id}`,
      { isActive: !m.isActive },
      { headers: getOwnerHeaders() },
    );
    await loadMonitors();
    showToast(m.isActive ? 'Monitör duraklatıldı' : 'Monitör aktifleştirildi');
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/uptime/monitors/${id}`, { headers: getOwnerHeaders() });
    await loadMonitors();
    showToast('Monitör silindi');
  };

  const stats = useMemo(() => {
    const up = monitors.filter((m) => m.lastStatus === 'up').length;
    const down = monitors.filter((m) => m.lastStatus === 'down').length;
    const latencies = monitors
      .map((m) => m.lastResponseTimeMs)
      .filter((v): v is number => typeof v === 'number');
    const avgMs =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0;
    return { total: monitors.length, up, down, avgMs };
  }, [monitors]);

  return (
    <PageTransition>
      <div className="bg-white dark:bg-zinc-950 py-10 sm:py-14 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              5 Dakikada Bir Otomatik Kontrol + SSL Takibi
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white font-['Outfit']">
              Uptime & SSL Monitörü
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Web sitelerini ve API uçlarını izle, yanıt süresini ve SSL sertifikasının kalan gününü takip et, kesintide e-posta uyarısı al.
            </p>
          </div>

          {/* Add Monitor Form */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 p-5 sm:p-6 space-y-4">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Servis Adı (ör: Ana Site)"
                maxLength={80}
                className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ornek.com/health"
                className="md:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Uyarı e-postası (opsiyonel)"
                className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={creating}
                className="md:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </form>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Toplam Monitör</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Aktif (UP)</p>
              <p className="text-2xl font-bold text-emerald-500 mt-0.5">{stats.up}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Kesinti (DOWN)</p>
              <p className="text-2xl font-bold text-red-500 mt-0.5">{stats.down}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Ort. Yanıt Süresi</p>
              <p className="text-2xl font-bold text-blue-500 mt-0.5">{stats.avgMs} ms</p>
            </div>
          </section>

          {/* Monitors List */}
          <section className="space-y-3">
            {monitors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-14 text-center text-sm text-zinc-500">
                Henüz monitör eklenmemiş. Yukarıdan takip etmek istediğin URL&apos;yi ekle!
              </div>
            ) : (
              monitors.map((m) => {
                const isUp = m.lastStatus === 'up';
                const sslColor =
                  m.sslDaysRemaining === null
                    ? ''
                    : m.sslDaysRemaining <= 7
                      ? 'text-red-500 border-red-500/30 bg-red-500/10'
                      : m.sslDaysRemaining <= 30
                        ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                        : 'text-emerald-600 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10';

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition ${
                      !m.isActive
                        ? 'border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/40 opacity-75'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                              isUp
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                : m.lastStatus === 'down'
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-300'
                                  : 'bg-zinc-500/15 text-zinc-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isUp ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                              }`}
                            />
                            {m.lastStatus.toUpperCase()}
                          </span>
                          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                            {m.name}
                          </h3>
                          {m.lastStatusCode && (
                            <span className="text-xs font-mono text-zinc-500">
                              HTTP {m.lastStatusCode}
                            </span>
                          )}
                          {m.lastResponseTimeMs !== null && (
                            <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                              {m.lastResponseTimeMs} ms
                            </span>
                          )}
                          {m.sslDaysRemaining !== null && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sslColor}`}
                            >
                              {m.sslDaysRemaining <= 14 ? (
                                <ShieldAlert className="w-3 h-3" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              SSL: {m.sslDaysRemaining} gün
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline truncate max-w-md"
                          >
                            {m.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {m.alertEmail && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {m.alertEmail}
                            </span>
                          )}
                          {m.lastError && <span className="text-red-500">{m.lastError}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCheckNow(m.id)}
                          disabled={checkingId === m.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${checkingId === m.id ? 'animate-spin' : ''}`}
                          />
                          Kontrol Et
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(m)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-300 cursor-pointer"
                        >
                          {m.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {m.isActive ? 'Duraklat' : 'Başlat'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mini Uptime Bar (last 20 checks) */}
                    {m.recentChecks.length > 0 && (
                      <div className="flex items-center gap-1 pt-1">
                        {m.recentChecks.map((chk) => (
                          <div
                            key={chk.id}
                            title={`${chk.status.toUpperCase()} • ${chk.responseTimeMs}ms • ${new Date(
                              chk.checkedAt,
                            ).toLocaleTimeString('tr-TR')}`}
                            className={`h-5 flex-1 max-w-[18px] rounded-sm transition ${
                              chk.status === 'up'
                                ? 'bg-emerald-500/80 hover:bg-emerald-400'
                                : 'bg-red-500/80 hover:bg-red-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <OtherTools />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:text-white shadow-xl">
          {toast}
        </div>
      )}
    </PageTransition>
  );
}
