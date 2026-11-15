'use client';

import { useMemo, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Clock,
  Code,
  Coins,
  Columns,
  Compass,
  FileCode,
  Gamepad2,
  Globe,
  Image as ImageIcon,
  Key,
  KeyRound,
  Link2,
  Lock,
  LockKeyhole,
  Moon,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Webhook,
  BookOpen,
  Bomb,
  Brain,
  Hand,
  Skull,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type AppCategory = 'all' | 'cloud' | 'dev' | 'utility' | 'games';

interface AppItem {
  name: string;
  desc: string;
  path: string;
  icon: LucideIcon;
  color: string;
  category: Exclude<AppCategory, 'all'>;
  featured?: boolean;
  badge?: string;
}

const ITEMS: AppItem[] = [
  // Bulut & Canlı Mikro Servisler
  {
    name: 'KısaLink',
    desc: 'Özel kod, geçerlilik süresi, QR kod ve e-posta ile cihazlar arası senkronlu link kısaltıcı.',
    path: '/kisa-link',
    icon: Link2,
    color: '#2563eb',
    category: 'cloud',
    featured: true,
    badge: 'Bulut • QR',
  },
  {
    name: 'Webhook Yakalayıcı',
    desc: 'Benzersiz URL üret, gelen HTTP isteklerinin body, header ve query verilerini canlı izle.',
    path: '/webhook',
    icon: Webhook,
    color: '#6366f1',
    category: 'cloud',
    featured: true,
    badge: 'Canlı',
  },
  {
    name: 'Uptime & SSL Monitörü',
    desc: 'Sitelerini 5 dakikada bir otomatik kontrol et, SSL bitişini ve kesintileri e-postayla izle.',
    path: '/uptime',
    icon: Activity,
    color: '#10b981',
    category: 'cloud',
    featured: true,
    badge: 'Cron • SSL',
  },
  {
    name: 'PusulaAPI',
    desc: 'Tarayıcıdan HTTP istekleri gönderip yanıtları inceleyebileceğin gelişmiş API test istemcisi.',
    path: '/pusula-api',
    icon: Compass,
    color: '#0ea5e9',
    category: 'cloud',
    featured: true,
    badge: 'API Client',
  },
  {
    name: 'Canlı Aktivite Paneli',
    desc: 'Blog anlık okuma ve ziyaretçi hareketlerini canlı olarak takip edin.',
    path: '/live-dashboard',
    icon: Radio,
    color: '#22c55e',
    category: 'cloud',
  },

  // Geliştirici Araçları
  { name: 'cURL Dönüştürücü', desc: 'cURL komutlarını Fetch, Axios ve Python kodlarına çevirin.', path: '/curl-converter', icon: Terminal, color: '#6366f1', category: 'dev' },
  { name: 'Cron Generator', desc: 'Crontab üretici, Türkçe açıklayıcı ve sonraki çalışma zamanları.', path: '/cron-generator', icon: Clock, color: '#0ea5e9', category: 'dev' },
  { name: 'JWT Secret Üretici', desc: 'Kriptografik güvenli JWT Secret Key ve örnek Token üretici.', path: '/jwt-secret-generator', icon: ShieldCheck, color: '#10b981', category: 'dev' },
  { name: 'JWT Decoder', desc: 'JSON Web Token (JWT) header ve payload verilerini çözün.', path: '/jwt', icon: Key, color: '#8b5cf6', category: 'dev' },
  { name: 'JSON Formatter', desc: 'JSON verilerini doğrulayın, biçimlendirin ve küçültün.', path: '/json', icon: FileCode, color: '#a855f7', category: 'dev' },
  { name: 'Regex Tester', desc: 'Düzenli ifadeleri canlı eşleşme vurgulamasıyla test edin.', path: '/regex', icon: Search, color: '#4f46e5', category: 'dev' },
  { name: 'Code Diff Slider', desc: 'İki kod bloğu arasındaki farkları sürgülü karşılaştırın.', path: '/code-diff', icon: Columns, color: '#f59e0b', category: 'dev' },
  { name: 'Base64 Atölyesi', desc: 'Metin ve verileri hızlıca Base64 encode & decode edin.', path: '/base64', icon: Lock, color: '#0ea5e9', category: 'dev' },
  { name: 'Hash Üretici', desc: 'Metin ve dosyaların SHA-256, SHA-512, MD5 hash değerlerini hesaplayın.', path: '/hash', icon: LockKeyhole, color: '#6366f1', category: 'dev' },
  { name: 'URL Codec', desc: 'URL kodlama ve çözme (encodeURIComponent / decode) aracı.', path: '/url', icon: Link2, color: '#0284c7', category: 'dev' },
  { name: 'Epoch Converter', desc: 'Unix zaman damgasını insan okunur tarihe çevirin.', path: '/epoch', icon: Clock, color: '#d97706', category: 'dev' },
  { name: 'HTML Canlı Önizleme', desc: 'HTML ve CSS kodlarını yazarken anlık önizleyin.', path: '/compiler', icon: Code, color: '#f97316', category: 'dev' },

  // Yardımcı Araçlar
  { name: 'Test Verisi Üretici', desc: 'TCKN, VKN, IBAN, kredi kartı ve UUID test verileri üretin.', path: '/generator', icon: Settings, color: '#10b981', category: 'utility' },
  { name: 'Şifre Oluşturucu', desc: 'Kriptografik rastgele, kırılması zor güçlü parolalar oluşturun.', path: '/password-generator', icon: KeyRound, color: '#eab308', category: 'utility' },
  { name: 'QR Kod Oluşturucu', desc: 'Metin, URL ve Wi-Fi ağları için özelleştirilebilir QR kod.', path: '/qr', icon: Smartphone, color: '#0ea5e9', category: 'utility' },
  { name: 'Görsel Dönüştürücü', desc: 'PNG, JPEG ve WebP formatları arasında tarayıcıda dönüştürün.', path: '/converter', icon: ImageIcon, color: '#ec4899', category: 'utility' },
  { name: 'IP Adresim', desc: 'Dış IP adresinizi ve temel ağ bilgilerinizi görüntüleyin.', path: '/ip', icon: Globe, color: '#3b82f6', category: 'utility' },
  { name: 'Döviz & Altın', desc: 'TCMB anlık döviz kurları ve altın fiyatları.', path: '/doviz', icon: Coins, color: '#f59e0b', category: 'utility' },
  { name: 'Namaz Vakitleri', desc: 'Konumunuza ve şehrinize göre güncel namaz vakitleri.', path: '/namaz-vakitleri', icon: Moon, color: '#16a34a', category: 'utility' },
  { name: 'Hicri Dönüştürücü', desc: 'Hicri ve Miladi takvim arasında tarih dönüşümü.', path: '/hicri', icon: Moon, color: '#059669', category: 'utility' },
  { name: 'Yazılımcı Sözlüğü', desc: 'Yazılım ve teknoloji terimlerinin Türkçe açıklamaları.', path: '/sozluk', icon: BookOpen, color: '#6366f1', category: 'utility' },
  { name: 'İnteraktif Terminal', desc: 'Siteyi komut satırı arayüzü üzerinden keşfedin.', path: '/terminal', icon: Terminal, color: '#64748b', category: 'utility' },

  // Oyunlar
  { name: 'Adam Asmaca', desc: 'Klasik kelime tahmin oyunu.', path: '/game/hangman', icon: Skull, color: '#64748b', category: 'games' },
  { name: 'Mayın Tarlası', desc: 'Dikkatli ol, mayınlara basma!', path: '/game/minesweeper', icon: Bomb, color: '#ef4444', category: 'games' },
  { name: 'Taş Kağıt Makas', desc: 'Klasik strateji oyunu.', path: '/game/rock', icon: Hand, color: '#f59e0b', category: 'games' },
  { name: 'Yılan Oyunu', desc: 'Yılanı büyüt ve rekorları kır!', path: '/game/snake', icon: Zap, color: '#22c55e', category: 'games' },
  { name: 'Hafıza Oyunu', desc: 'Kartları eşleştir, hafızanı test et.', path: '/game/memory', icon: Brain, color: '#a855f7', category: 'games' },
];

const CATEGORIES: { key: AppCategory; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'cloud', label: 'Bulut & API' },
  { key: 'dev', label: 'Geliştirici' },
  { key: 'utility', label: 'Günlük Araçlar' },
  { key: 'games', label: 'Oyunlar' },
];

export default function Applications() {
  const [category, setCategory] = useState<AppCategory>('all');
  const [query, setQuery] = useState('');

  const featured = useMemo(() => ITEMS.filter((i) => i.featured), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <PageTransition>
      <div className="relative bg-white dark:bg-zinc-950 py-12 sm:py-16 transition-colors duration-300 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              {ITEMS.length} Araç & Mini Oyun
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-['Outfit']">
              Uygulama Merkezi
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Geliştiriciler için bulut destekli servisler, günlük pratik araçlar ve mini oyunlar tek çatı altında.
            </p>
          </header>

          {/* Featured Cloud / API Spotlight */}
          {category === 'all' && !query.trim() && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Öne Çıkan Bulut & API Araçları
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featured.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        href={item.path}
                        className="group relative flex flex-col justify-between h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/90 dark:to-zinc-950 p-5 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div
                              className="h-11 w-11 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                              style={{ backgroundColor: `${item.color}18`, color: item.color }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            {item.badge && (
                              <span
                                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                style={{ backgroundColor: `${item.color}15`, color: item.color }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                          <span>Aracı Aç</span>
                          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Filter & Search Toolbar */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 ${
                      category === cat.key
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/70 dark:border-zinc-800'
                    }`}
                  >
                    {cat.key === 'games' && <Gamepad2 className="w-3.5 h-3.5" />}
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Araç, servis veya oyun ara..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-16 text-center text-sm text-zinc-500">
                Aramanla eşleşen uygulama bulunamadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map((app, index) => {
                  const Icon = app.icon;
                  return (
                    <motion.div
                      key={app.path}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.015, 0.25) }}
                    >
                      <Link
                        href={app.path}
                        className="group flex flex-col justify-between h-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3.5">
                            <div
                              className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: `${app.color}18`, color: app.color }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {app.name}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            {app.desc}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
