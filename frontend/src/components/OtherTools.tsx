'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Clock,
  FileCode,
  Lock,
  Moon,
  Terminal as TerminalIcon,
  Search,
  Key,
  Link as LinkIcon,
  Columns,
  Grid,
  Settings,
  Image as ImageIcon,
  Code,
  KeyRound,
  ShieldCheck,
  LockKeyhole,
  Smartphone,
  Activity,
  Webhook,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ToolCategory = 'all' | 'cloud' | 'dev' | 'other';

interface ToolItem {
  name: string;
  path: string;
  desc: string;
  color: string;
  icon: LucideIcon;
  category: Exclude<ToolCategory, 'all'>;
  badge?: string;
}

const TOOLS: ToolItem[] = [
  { name: 'KısaLink', path: '/kisa-link', icon: LinkIcon, desc: 'Link kısaltıcı, QR & e-posta senkronu', color: '#2563eb', category: 'cloud', badge: 'Bulut' },
  { name: 'Webhook Yakalayıcı', path: '/webhook', icon: Webhook, desc: 'Canlı HTTP istek yakalama & inceleme', color: '#6366f1', category: 'cloud', badge: 'Bulut' },
  { name: 'Uptime & SSL Monitörü', path: '/uptime', icon: Activity, desc: '5 dk otomatik kontrol & SSL takibi', color: '#10b981', category: 'cloud', badge: 'Bulut' },
  { name: 'PusulaAPI', path: '/pusula-api', icon: Compass, desc: 'Gelişmiş HTTP & API test istemcisi', color: '#0ea5e9', category: 'cloud' },
  { name: 'Cron Generator', path: '/cron-generator', icon: Clock, desc: 'Crontab üretici & açıklayıcı', color: '#0ea5e9', category: 'dev' },
  { name: 'cURL Dönüştürücü', path: '/curl-converter', icon: TerminalIcon, desc: 'cURL → Fetch, Axios, Python', color: '#6366f1', category: 'dev' },
  { name: 'JWT Secret Üretici', path: '/jwt-secret-generator', icon: ShieldCheck, desc: 'Kriptografik JWT Secret & Token', color: '#10b981', category: 'dev' },
  { name: 'JWT Decoder', path: '/jwt', icon: Key, desc: 'JSON Web Token çözücü', color: '#8b5cf6', category: 'dev' },
  { name: 'JSON Formatter', path: '/json', icon: FileCode, desc: 'JSON güzelleştir & doğrula', color: '#8b5cf6', category: 'dev' },
  { name: 'Regex Tester', path: '/regex', icon: Search, desc: 'Regex desen test aracı', color: '#4f46e5', category: 'dev' },
  { name: 'Code Diff Slider', path: '/code-diff', icon: Columns, desc: 'Kod karşılaştırma sürgüsü', color: '#f59e0b', category: 'dev' },
  { name: 'Base64 Atölyesi', path: '/base64', icon: Lock, desc: 'Encode & Decode', color: '#0ea5e9', category: 'dev' },
  { name: 'Hash Üretici', path: '/hash', icon: LockKeyhole, desc: 'Metin ve dosya hash hesaplayıcı', color: '#6366f1', category: 'dev' },
  { name: 'URL Codec', path: '/url', icon: LinkIcon, desc: 'URL Encode & Decode', color: '#0ea5e9', category: 'dev' },
  { name: 'Epoch Converter', path: '/epoch', icon: Clock, desc: 'Zaman damgası dönüştürücü', color: '#f59e0b', category: 'dev' },
  { name: 'Test Verisi Üretici', path: '/generator', icon: Settings, desc: 'TCKN, VKN, IBAN, Kart, UUID', color: '#10b981', category: 'other' },
  { name: 'QR Kod Oluşturucu', path: '/qr', icon: Smartphone, desc: 'Metin, URL ve Wi-Fi QR üretici', color: '#0ea5e9', category: 'other' },
  { name: 'Şifre Oluşturucu', path: '/password-generator', icon: KeyRound, desc: 'Güçlü rastgele şifre üretici', color: '#eab308', category: 'other' },
  { name: 'Görsel Dönüştürücü', path: '/converter', icon: ImageIcon, desc: 'PNG, JPEG, WebP dönüştürücü', color: '#ec4899', category: 'other' },
  { name: 'HTML Canlı Önizleme', path: '/compiler', icon: Code, desc: 'HTML & CSS canlı editör', color: '#f97316', category: 'other' },
  { name: 'IP Adresim', path: '/ip', icon: Globe, desc: 'Dış IP adresinizi öğrenin', color: '#6366f1', category: 'other' },
  { name: 'Hicri Dönüştürücü', path: '/hicri', icon: Moon, desc: 'Miladi ↔ Hicri takvim', color: '#059669', category: 'other' },
  { name: 'Döviz & Altın Kurları', path: '/doviz', icon: Globe, desc: 'Canlı piyasa kurları', color: '#10b981', category: 'other' },
  { name: 'Yazılımcı Sözlüğü', path: '/sozluk', icon: Search, desc: 'Teknoloji & yazılım terimleri', color: '#6366f1', category: 'other' },
  { name: 'İnteraktif Terminal', path: '/terminal', icon: TerminalIcon, desc: 'Komut satırı arayüzü', color: '#475569', category: 'other' },
];

export default function OtherTools() {
  const pathname = usePathname();
  const [category, setCategory] = useState<ToolCategory>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      if (tool.path === pathname) return false;
      if (category !== 'all' && tool.category !== category) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q)
      );
    });
  }, [pathname, category, query]);

  return (
    <section className="mt-14 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Grid className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-['Outfit']">
              Diğer Araçlar
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              İhtiyacın olan araca tek tıkla geç
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-1">
            {(
              [
                ['all', 'Tümü'],
                ['cloud', 'Bulut & API'],
                ['dev', 'Geliştirici'],
                ['other', 'Diğer'],
              ] as [ToolCategory, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  category === key
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Araç ara..."
              className="w-40 sm:w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500">
          Aramanla eşleşen araç bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                href={tool.path}
                className="group flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${tool.color}18`, color: tool.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h4>
                      {tool.badge && (
                        <span className="shrink-0 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
