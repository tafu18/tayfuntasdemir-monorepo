'use client';

import { useEffect, useState } from 'react';
import { Mail, ShieldCheck, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

export const OWNER_ID_KEY = 'kisalink_owner_id';
export const EMAIL_TOKEN_KEY = 'kisalink_email_token';
export const EMAIL_ADDR_KEY = 'kisalink_email';

export function getOrCreateOwnerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(OWNER_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(OWNER_ID_KEY, id);
  }
  return id;
}

export function getWorkspaceHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const headers: Record<string, string> = {};
  const ownerId = getOrCreateOwnerId();
  if (ownerId) headers['x-owner-id'] = ownerId;
  const emailToken = localStorage.getItem(EMAIL_TOKEN_KEY);
  if (emailToken) headers['x-link-session'] = emailToken;
  return headers;
}

interface EmailSyncBannerProps {
  scopeLabel?: string;
  onChanged?: () => void;
  onNotify?: (message: string) => void;
}

export default function EmailSyncBanner({
  scopeLabel = 'verilerin',
  onChanged,
  onNotify,
}: EmailSyncBannerProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateOwnerId();
    setIsAdmin(Boolean(localStorage.getItem('token')));
    setLinkedEmail(localStorage.getItem(EMAIL_ADDR_KEY));
  }, []);

  if (isAdmin) return null;

  const notify = (msg: string) => {
    onNotify?.(msg);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);
    setDevCodeHint(null);
    try {
      const { data } = await api.post<{ sent: boolean; devCode?: string }>(
        '/links/email/request',
        { email: emailInput.trim() },
        { headers: getWorkspaceHeaders() },
      );
      setCodeSent(true);
      if (data.devCode) setDevCodeHint(data.devCode);
      notify('Doğrulama kodu gönderildi');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      notify(msg || 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !codeInput.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; email: string }>(
        '/links/email/verify',
        { email: emailInput.trim(), code: codeInput.trim() },
        { headers: getWorkspaceHeaders() },
      );
      localStorage.setItem(EMAIL_TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_ADDR_KEY, data.email);
      setLinkedEmail(data.email);
      setCodeSent(false);
      setCodeInput('');
      setDevCodeHint(null);
      onChanged?.();
      notify(`${data.email} ile bağlandı`);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      notify(msg || 'Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(EMAIL_TOKEN_KEY);
    localStorage.removeItem(EMAIL_ADDR_KEY);
    setLinkedEmail(null);
    setEmailInput('');
    setCodeSent(false);
    onChanged?.();
    notify('E-posta oturumu kapatıldı');
  };

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-4 sm:p-5">
      {linkedEmail ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-200">
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-bold mr-2">
                Bağlı
              </span>
              <strong className="font-semibold">{linkedEmail}</strong> adresine bağlı — tüm cihazlarından {scopeLabel} erişebilirsin.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Çıkış Yap
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              Bu sayfadaki {scopeLabel} şu an sadece bu tarayıcıya özel.{' '}
              <strong className="text-zinc-900 dark:text-white">
                Her cihazından erişmek istersen
              </strong>{' '}
              e-posta adresini doğrula; mevcut kayıtların hesabına bağlansın.
            </p>
          </div>

          {!codeSent ? (
            <form onSubmit={handleRequestCode} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ornek@eposta.com"
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !emailInput.trim()}
                className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 px-4 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="6 haneli kod"
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm font-mono tracking-widest text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || codeInput.trim().length !== 6}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Onaylanıyor...' : 'Onayla & Bağla'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setCodeInput('');
                    setDevCodeHint(null);
                  }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  Geri
                </button>
              </div>
              {devCodeHint && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                  Local SMTP kapalı — test doğrulama kodu: <strong>{devCodeHint}</strong>
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </section>
  );
}
