'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Webhook,
  Plus,
  Copy,
  Check,
  Send,
  Trash2,
  RefreshCw,
  Terminal,
  Settings2,
  Pause,
  Play,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import OtherTools from '@/components/OtherTools';
import { api } from '@/lib/api';

interface WebhookEndpoint {
  id: string;
  token: string;
  name: string | null;
  responseStatus: number;
  responseBody: string | null;
  createdAt: string;
}

interface WebhookRequestItem {
  id: string;
  endpointId: string;
  method: string;
  path: string;
  headers: string;
  query: string;
  body: string | null;
  ip: string | null;
  createdAt: string;
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

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  POST: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
  PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
  PATCH: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30',
};

export default function WebhookPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
  const [requests, setRequests] = useState<WebhookRequestItem[]>([]);
  const [selectedReq, setSelectedReq] = useState<WebhookRequestItem | null>(null);
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'query' | 'response'>('body');

  const [newName, setNewName] = useState('');
  const [autoPoll, setAutoPoll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [respStatus, setRespStatus] = useState(200);
  const [respBody, setRespBody] = useState('{"ok": true}');
  const [savingResp, setSavingResp] = useState(false);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2500);
  }, []);

  const fetchRequests = useCallback(async (endpointId: string) => {
    try {
      const { data } = await api.get<WebhookRequestItem[]>(
        `/webhooks/endpoints/${endpointId}/requests`,
        { headers: getOwnerHeaders() },
      );
      setRequests(data);
      setSelectedReq((prev) => {
        if (!prev) return data[0] ?? null;
        return data.find((r) => r.id === prev.id) ?? data[0] ?? null;
      });
    } catch {
      // ignore polling error
    }
  }, []);

  const fetchEndpoints = useCallback(async () => {
    const { data } = await api.get<WebhookEndpoint[]>('/webhooks/endpoints', {
      headers: getOwnerHeaders(),
    });
    setEndpoints(data);
    if (data.length > 0) {
      setSelectedEndpoint((prev) => {
        const match = prev ? data.find((e) => e.id === prev.id) : null;
        return match ?? data[0];
      });
    } else {
      setSelectedEndpoint(null);
      setRequests([]);
      setSelectedReq(null);
    }
  }, []);

  useEffect(() => {
    void fetchEndpoints();
  }, [fetchEndpoints]);

  useEffect(() => {
    if (!selectedEndpoint) return;
    setRespStatus(selectedEndpoint.responseStatus || 200);
    setRespBody(selectedEndpoint.responseBody || '{"ok": true}');
    void fetchRequests(selectedEndpoint.id);

    if (!autoPoll) return;
    const timer = setInterval(() => {
      void fetchRequests(selectedEndpoint.id);
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedEndpoint, autoPoll, fetchRequests]);

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await api.post<WebhookEndpoint>(
      '/webhooks/endpoints',
      { ...(newName.trim() ? { name: newName.trim() } : {}) },
      { headers: getOwnerHeaders() },
    );
    setNewName('');
    await fetchEndpoints();
    setSelectedEndpoint(data);
    showToast('Yeni webhook URL oluşturuldu');
  };

  const handleDeleteEndpoint = async (id: string) => {
    await api.delete(`/webhooks/endpoints/${id}`, { headers: getOwnerHeaders() });
    await fetchEndpoints();
    showToast('Webhook silindi');
  };

  const handleSendTest = async () => {
    if (!selectedEndpoint) return;
    setSendingTest(true);
    try {
      await fetch(`${apiBase}/api/hook/${selectedEndpoint.token}?source=ui-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-test': 'true' },
        body: JSON.stringify({
          event: 'order.completed',
          orderId: Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toISOString(),
        }),
      });
      await fetchRequests(selectedEndpoint.id);
      showToast('Test isteği yakalandı!');
    } finally {
      setSendingTest(false);
    }
  };

  const handleClearRequests = async () => {
    if (!selectedEndpoint) return;
    await api.delete(`/webhooks/endpoints/${selectedEndpoint.id}/requests`, {
      headers: getOwnerHeaders(),
    });
    setRequests([]);
    setSelectedReq(null);
    showToast('Gelen istekler temizlendi');
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEndpoint) return;
    setSavingResp(true);
    try {
      const { data } = await api.patch<WebhookEndpoint>(
        `/webhooks/endpoints/${selectedEndpoint.id}`,
        { responseStatus: Number(respStatus), responseBody: respBody },
        { headers: getOwnerHeaders() },
      );
      setSelectedEndpoint(data);
      showToast('Özel yanıt ayarları kaydedildi');
    } finally {
      setSavingResp(false);
    }
  };

  const hookUrl = selectedEndpoint ? `${apiBase}/api/hook/${selectedEndpoint.token}` : '';

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Panoya kopyalandı');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <PageTransition>
      <div className="bg-white dark:bg-zinc-950 py-10 sm:py-14 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Webhook className="w-3.5 h-3.5" />
              Gerçek Zamanlı HTTP İstek Yakalayıcı
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white font-['Outfit']">
              Webhook Yakalayıcı
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Özel bir webhook adresi oluştur; dış servislerden gelen tüm HTTP isteklerini header, query ve body detaylarıyla canlı incele.
            </p>
          </div>

          {/* Endpoint Bar */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <form onSubmit={handleCreateEndpoint} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Yeni webhook adı (ör: Stripe Test)"
                  maxLength={80}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Endpoint
                </button>
              </form>

              {endpoints.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedEndpoint?.id || ''}
                    onChange={(e) => {
                      const found = endpoints.find((ep) => ep.id === e.target.value) || null;
                      setSelectedEndpoint(found);
                    }}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    {endpoints.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.name || ep.token} (/api/hook/{ep.token})
                      </option>
                    ))}
                  </select>
                  {selectedEndpoint && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEndpoint(selectedEndpoint.id)}
                      title="Endpoint'i sil"
                      className="rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 p-2 text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectedEndpoint && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 min-w-0 flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2">
                  <span className="text-[11px] font-bold uppercase text-indigo-500 shrink-0">URL</span>
                  <code className="font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 truncate flex-1">
                    {hookUrl}
                  </code>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(hookUrl)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Kopyala
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X POST "${hookUrl}" -H "Content-Type: application/json" -d '{"hello":"world"}'`,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    cURL
                  </button>
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={sendingTest}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingTest ? 'Gönderiliyor...' : 'Test İsteği At'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoPoll((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium cursor-pointer ${
                      autoPoll
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {autoPoll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {autoPoll ? 'Canlı (3sn)' : 'Duraklatıldı'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Main Inspector */}
          {selectedEndpoint ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[460px]">
              {/* Left: Requests List */}
              <div className="lg:col-span-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Gelen İstekler ({requests.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fetchRequests(selectedEndpoint.id)}
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
                      title="Yenile"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {requests.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearRequests}
                        className="text-[11px] font-medium text-red-500 hover:underline px-1.5 cursor-pointer"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/70 dark:divide-zinc-800/70 max-h-[520px]">
                  {requests.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500">
                      Henüz istek yok. Yukarıdan <strong>Test İsteği At</strong> butonuna bas veya cURL ile istek gönder.
                    </div>
                  ) : (
                    requests.map((reqItem) => (
                      <button
                        key={reqItem.id}
                        type="button"
                        onClick={() => setSelectedReq(reqItem)}
                        className={`w-full text-left px-4 py-3 transition cursor-pointer flex items-center justify-between gap-2 ${
                          selectedReq?.id === reqItem.id
                            ? 'bg-indigo-500/10 border-l-2 border-indigo-500'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                METHOD_COLORS[reqItem.method] || 'bg-zinc-500/10 text-zinc-400'
                              }`}
                            >
                              {reqItem.method}
                            </span>
                            <span className="font-mono text-xs text-zinc-700 dark:text-zinc-200 truncate">
                              {reqItem.path}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {new Date(reqItem.createdAt).toLocaleTimeString('tr-TR')} •{' '}
                            {reqItem.ip || 'IP yok'}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Request Details */}
              <div className="lg:col-span-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 flex flex-col overflow-hidden">
                <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                  {(
                    [
                      ['body', 'Body'],
                      ['headers', 'Headers'],
                      ['query', 'Query'],
                      ['response', 'Yanıt Ayarları'],
                    ] as const
                  ).map(([tabKey, label]) => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setActiveTab(tabKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 ${
                        activeTab === tabKey
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {tabKey === 'response' && <Settings2 className="w-3.5 h-3.5" />}
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-4 flex-1 overflow-auto">
                  {activeTab === 'response' ? (
                    <form onSubmit={handleSaveResponse} className="space-y-4 max-w-lg">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          HTTP Durum Kodu
                        </label>
                        <input
                          type="number"
                          min={100}
                          max={599}
                          value={respStatus}
                          onChange={(e) => setRespStatus(Number(e.target.value))}
                          className="w-32 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Yanıt Gövdesi (JSON veya Text)
                        </label>
                        <textarea
                          rows={6}
                          value={respBody}
                          onChange={(e) => setRespBody(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={savingResp}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                      >
                        {savingResp ? 'Kaydediliyor...' : 'Yanıtı Kaydet'}
                      </button>
                    </form>
                  ) : !selectedReq ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500 py-16">
                      İncelemek için soldan bir istek seçin.
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
                      {activeTab === 'body' && (selectedReq.body || '(Boş gövde)')}
                      {activeTab === 'headers' && selectedReq.headers}
                      {activeTab === 'query' && selectedReq.query}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-14 text-center text-sm text-zinc-500">
              Başlamak için yukarıdan bir <strong>Yeni Endpoint</strong> oluştur.
            </div>
          )}

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
