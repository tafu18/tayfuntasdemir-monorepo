'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Pencil,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  Download,
  ChevronRight,
  ExternalLink,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import OtherTools from '@/components/OtherTools';
import { api } from '@/lib/api';

interface LinkItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  isActive: boolean;
  clicks: number;
  lastClickedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

type SortMode = 'newest' | 'popular';
type StatusFilter = 'all' | 'active' | 'inactive' | 'expired';
type ExpiryPreset = 'never' | '1h' | '24h' | '7d' | '30d';

const EXPIRY_OPTIONS: { value: ExpiryPreset; label: string; ms: number | null }[] = [
  { value: 'never', label: 'Süresiz', ms: null },
  { value: '1h', label: '1 Saat', ms: 60 * 60 * 1000 },
  { value: '24h', label: '24 Saat', ms: 24 * 60 * 60 * 1000 },
  { value: '7d', label: '7 Gün', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: '30 Gün', ms: 30 * 24 * 60 * 60 * 1000 },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function isExpired(link: LinkItem): boolean {
  return Boolean(link.expiresAt && new Date(link.expiresAt).getTime() <= Date.now());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelative(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'az önce';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} sa önce`;
  return `${Math.floor(diffHour / 24)} gün önce`;
}

function extractApiError(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = anyErr?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  if (anyErr?.message === 'Network Error') return 'API sunucusuna ulaşılamıyor';
  return anyErr?.message || 'Bir hata oluştu';
}

export default function KisaLinkPage() {
  const [origin, setOrigin] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>('never');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [latestLink, setLatestLink] = useState<LinkItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  const [qrModal, setQrModal] = useState<{ link: LinkItem; dataUrl: string } | null>(null);
  const [editModal, setEditModal] = useState<{
    link: LinkItem;
    title: string;
    originalUrl: string;
    clearExpiry: boolean;
  } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const buildShortUrl = useCallback(
    (code: string) => `${origin || ''}/r/${code}`,
    [origin],
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const loadLinks = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const { data } = await api.get<LinkItem[]>('/links');
      setLinks(data);
      setError('');
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    let active = true;
    api
      .get<LinkItem[]>('/links')
      .then(({ data }) => {
        if (active) {
          setLinks(data);
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(extractApiError(e));
      });

    const onFocus = () => {
      void loadLinks(true);
    };
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [loadLinks]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        showToast('Panodan yapıştırıldı');
      }
    } catch {
      showToast('Pano izni verilemedi');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedCode = customCode.trim();
    const trimmedTitle = title.trim();
    if (!trimmedUrl) return;

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError('Geçersiz URL: http:// veya https:// ile başlamalı');
      return;
    }

    const preset = EXPIRY_OPTIONS.find((o) => o.value === expiryPreset);
    const expiresAt = preset?.ms ? new Date(Date.now() + preset.ms).toISOString() : undefined;

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<LinkItem>('/links', {
        originalUrl: trimmedUrl,
        ...(trimmedCode ? { shortCode: trimmedCode } : {}),
        ...(trimmedTitle ? { title: trimmedTitle } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      });
      setLatestLink(data);
      setUrl('');
      setTitle('');
      setCustomCode('');
      setExpiryPreset('never');
      setShowAdvanced(false);
      await loadLinks(true);
      showToast('Kısa link oluşturuldu!');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Link panoya kopyalandı');
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleToggleActive = async (link: LinkItem) => {
    try {
      await api.patch(`/links/${encodeURIComponent(link.id)}`, {
        isActive: !link.isActive,
      });
      await loadLinks(true);
      showToast(link.isActive ? 'Link duraklatıldı' : 'Link tekrar aktifleştirildi');
    } catch (err) {
      showToast(extractApiError(err));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setSavingEdit(true);
    try {
      await api.patch(`/links/${encodeURIComponent(editModal.link.id)}`, {
        originalUrl: editModal.originalUrl.trim(),
        title: editModal.title.trim() || null,
        ...(editModal.clearExpiry ? { expiresAt: null } : {}),
      });
      setEditModal(null);
      await loadLinks(true);
      showToast('Link güncellendi');
    } catch (err) {
      showToast(extractApiError(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenQr = async (link: LinkItem) => {
    try {
      const shortUrl = buildShortUrl(link.shortCode);
      const dataUrl = await QRCode.toDataURL(shortUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#09090b', light: '#ffffff' },
      });
      setQrModal({ link, dataUrl });
    } catch {
      showToast('QR kod oluşturulamadı');
    }
  };

  const handleDelete = async (code: string) => {
    setError('');
    try {
      await api.delete(`/links/${encodeURIComponent(code)}`);
      if (latestLink?.shortCode === code) {
        setLatestLink(null);
      }
      await loadLinks(true);
      showToast('Link silindi');
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleExportCsv = () => {
    if (links.length === 0) return;
    const header = ['Baslik', 'KisaKod', 'KisaURL', 'HedefURL', 'Tiklanma', 'Durum', 'Olusturulma'];
    const rows = links.map((l) => {
      const status = isExpired(l) ? 'Süresi Doldu' : l.isActive ? 'Aktif' : 'Pasif';
      return [
        l.title || '',
        l.shortCode,
        buildShortUrl(l.shortCode),
        l.originalUrl,
        String(l.clicks || 0),
        status,
        l.createdAt,
      ]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `kisalink-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
    showToast('CSV raporu indirildi');
  };

  const stats = useMemo(() => {
    const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
    const activeCount = links.filter((l) => l.isActive && !isExpired(l)).length;
    const topLink = links.reduce<LinkItem | null>(
      (best, cur) => (!best || cur.clicks > best.clicks ? cur : best),
      null,
    );
    return {
      totalLinks: links.length,
      activeCount,
      totalClicks,
      topCode: topLink && topLink.clicks > 0 ? `/r/${topLink.shortCode}` : '—',
    };
  }, [links]);

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = links.filter((l) => {
      if (statusFilter === 'active' && (!l.isActive || isExpired(l))) return false;
      if (statusFilter === 'inactive' && (l.isActive || isExpired(l))) return false;
      if (statusFilter === 'expired' && !isExpired(l)) return false;

      if (!q) return true;
      return (
        l.originalUrl.toLowerCase().includes(q) ||
        l.shortCode.toLowerCase().includes(q) ||
        (l.title || '').toLowerCase().includes(q)
      );
    });

    if (sort === 'popular') {
      list.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [links, search, sort, statusFilter]);

  return (
    <PageTransition>
      <div className="bg-white dark:bg-zinc-950 py-10 sm:py-14 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              Akıllı Link Yönetimi & Analitik
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-['Outfit']">
              KısaLink
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Bağlantılarını kısalt, özel takma ad ve geçerlilik süresi ekle, tek tıkla duraklat, QR kod üret ve tıklanmaları dışa aktar.
            </p>
          </div>

          {/* Main Card */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 p-5 sm:p-7 shadow-sm space-y-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="url-input"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Hedef Bağlantı
                </label>
                <div className="relative flex items-center">
                  <Link2 className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://ornek-site.com/cok-uzun-baglanti"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-950 pl-10 pr-24 py-3 text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="absolute right-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    Yapıştır
                  </button>
                </div>
              </div>

              {/* Advanced options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  />
                  {showAdvanced
                    ? 'Gelişmiş seçenekleri gizle'
                    : 'Başlık, özel kod ve geçerlilik süresi ekle'}
                </button>

                {showAdvanced && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Başlık / Etiket (opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Portfolyo, Kampanya"
                        maxLength={80}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Özel Kısa Kod (opsiyonel)
                      </label>
                      <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <span className="px-2.5 py-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 select-none">
                          /r/
                        </span>
                        <input
                          type="text"
                          value={customCode}
                          onChange={(e) => setCustomCode(e.target.value)}
                          placeholder="benim-linkim"
                          maxLength={20}
                          className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Geçerlilik Süresi
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EXPIRY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setExpiryPreset(opt.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition cursor-pointer ${
                              expiryPreset === opt.value
                                ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300'
                                : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3.5 font-semibold text-white shadow-sm disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Kısaltılıyor...' : 'Linki Kısalt'}
              </button>
            </form>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300 text-center">
                {error}
              </div>
            )}

            {latestLink && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-0.5">
                    Hazır! {latestLink.title ? `(${latestLink.title})` : 'Kısa bağlantın:'}
                  </p>
                  <a
                    href={buildShortUrl(latestLink.shortCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm sm:text-base font-semibold text-zinc-900 dark:text-white hover:underline inline-flex items-center gap-1.5 truncate max-w-full"
                  >
                    {buildShortUrl(latestLink.shortCode)}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(buildShortUrl(latestLink.shortCode), 'latest')}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {copiedId === 'latest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'latest' ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQr(latestLink)}
                    className="rounded-lg border border-emerald-500/40 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Stats Strip */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Toplam Link</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">{stats.totalLinks}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Aktif Link</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.activeCount}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Toplam Tıklanma</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {stats.totalClicks}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">En Popüler</p>
              <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-300 mt-1 truncate">
                {stats.topCode}
              </p>
            </div>
          </section>

          {/* Links List */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Kısa Linkler</h2>
                  <button
                    type="button"
                    onClick={() => loadLinks()}
                    disabled={refreshing}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-300 transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                    Yenile
                  </button>
                </div>

                {links.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV Dışa Aktar
                  </button>
                )}
              </div>

              {links.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ['all', 'Tümü'],
                        ['active', 'Aktif'],
                        ['inactive', 'Pasif'],
                        ['expired', 'Süresi Dolmuş'],
                      ] as [StatusFilter, string][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatusFilter(key)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                          statusFilter === key
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-52">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Başlık, link veya kod..."
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortMode)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">En Yeni</option>
                      <option value="popular">En Çok Tıklanan</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {filteredLinks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 py-12 text-center text-sm text-zinc-500">
                {links.length === 0
                  ? 'Henüz kısaltılmış link yok. Yukarıdan ilk linkini oluştur!'
                  : 'Seçili filtre veya aramanla eşleşen link bulunamadı.'}
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredLinks.map((link) => {
                  const expired = isExpired(link);
                  const shortUrl = buildShortUrl(link.shortCode);
                  const statusBadge = expired
                    ? {
                        text: 'Süresi Doldu',
                        cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
                      }
                    : link.isActive
                      ? {
                          text: 'Aktif',
                          cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
                        }
                      : {
                          text: 'Pasif',
                          cls: 'bg-zinc-200/60 dark:bg-zinc-700/40 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600/40',
                        };

                  return (
                    <li
                      key={link.id}
                      className={`rounded-xl border p-4 transition-all ${
                        !link.isActive || expired
                          ? 'border-zinc-200/70 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/40 opacity-80'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/75 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 flex items-center justify-center shrink-0 text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                            {getDomain(link.originalUrl).slice(0, 2)}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {link.title && (
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                  {link.title}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadge.cls}`}
                              >
                                {statusBadge.text}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                {link.clicks || 0} tıklanma
                              </span>
                            </div>
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
                            >
                              {shortUrl}
                            </a>
                            <span
                              className="text-xs text-zinc-500 dark:text-zinc-400 truncate"
                              title={link.originalUrl}
                            >
                              {link.originalUrl}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                              <span>{getDomain(link.originalUrl)}</span>
                              <span>•</span>
                              <span>Oluşturulma: {formatDate(link.createdAt)}</span>
                              {link.lastClickedAt && (
                                <>
                                  <span>•</span>
                                  <span>Son tıklanma: {formatRelative(link.lastClickedAt)}</span>
                                </>
                              )}
                              {link.expiresAt && (
                                <>
                                  <span>•</span>
                                  <span>Bitiş: {formatDate(link.expiresAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopy(shortUrl, link.id)}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition cursor-pointer inline-flex items-center gap-1"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copiedId === link.id ? 'Kopyalandı' : 'Kopyala'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenQr(link)}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            QR
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditModal({
                                link,
                                title: link.title || '',
                                originalUrl: link.originalUrl,
                                clearExpiry: false,
                              })
                            }
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(link)}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-300 transition cursor-pointer inline-flex items-center gap-1"
                          >
                            {link.isActive ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            {link.isActive ? 'Duraklat' : 'Aktifleştir'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(link.shortCode)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Sil
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <OtherTools />
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEditModal(null)}
        >
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Linki Düzenle (/r/{editModal.link.shortCode})
              </h3>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Başlık</label>
              <input
                type="text"
                value={editModal.title}
                onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                placeholder="Başlık (opsiyonel)"
                maxLength={80}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Hedef URL</label>
              <input
                type="url"
                required
                value={editModal.originalUrl}
                onChange={(e) => setEditModal({ ...editModal, originalUrl: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {editModal.link.expiresAt && (
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModal.clearExpiry}
                  onChange={(e) => setEditModal({ ...editModal, clearExpiry: e.target.checked })}
                />
                Son kullanma tarihini kaldır (süresiz yap)
              </label>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={savingEdit}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition cursor-pointer"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setQrModal(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">QR Kod</h3>
            <div className="mx-auto w-fit rounded-xl bg-white p-3 border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrModal.dataUrl}
                alt={buildShortUrl(qrModal.link.shortCode)}
                className="w-48 h-48"
              />
            </div>
            <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
              {buildShortUrl(qrModal.link.shortCode)}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={qrModal.dataUrl}
                download={`kisalink-${qrModal.link.shortCode}.png`}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition"
              >
                PNG İndir
              </a>
              <button
                type="button"
                onClick={() => setQrModal(null)}
                className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:text-white shadow-xl backdrop-blur">
          {toast}
        </div>
      )}
    </PageTransition>
  );
}
