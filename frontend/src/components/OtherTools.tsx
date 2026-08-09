'use client';

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
  ShieldCheck
} from 'lucide-react';

interface ToolItem {
  name: string;
  path: string;
  desc: string;
  color: string;
  icon: any;
}

export default function OtherTools() {
  const pathname = usePathname();

  const tools: ToolItem[] = [
    { name: 'Cron Generator', path: '/cron-generator', icon: Clock, desc: 'Crontab üretici & açıklayıcı', color: '#0ea5e9' },
    { name: 'cURL Dönüştürücü', path: '/curl-converter', icon: TerminalIcon, desc: 'cURL to Fetch, Axios, Python', color: '#6366f1' },
    { name: 'Test Verisi Üretici', path: '/generator', icon: Settings, desc: 'TCKN, VKN, IBAN, Kart, UUID', color: '#10b981' },
    { name: 'JWT Secret Üretici', path: '/jwt-secret-generator', icon: ShieldCheck, desc: 'Kriptografik JWT Secret & Token', color: '#10b981' },
    { name: 'JWT Decoder', path: '/jwt', icon: Key, desc: 'JSON Web Token çözücü', color: '#8b5cf6' },
    { name: 'JSON Formatter', path: '/json', icon: FileCode, desc: 'JSON güzelleştir & doğrula', color: '#8b5cf6' },
    { name: 'Base64 Atölyesi', path: '/base64', icon: Lock, desc: 'Encode & Decode', color: '#0ea5e9' },
    { name: 'Şifre Oluşturucu', path: '/password-generator', icon: KeyRound, desc: 'Güçlü şifre üretici', color: '#eab308' },
    { name: 'Görsel Dönüştürücü', path: '/converter', icon: ImageIcon, desc: 'PNG, JPEG, WebP dönüştürücü', color: '#ec4899' },
    { name: 'HTML Canlı Önizleme', path: '/compiler', icon: Code, desc: 'HTML & CSS canlı izleyici', color: '#f97316' },
    { name: 'Regex Tester', path: '/regex', icon: Search, desc: 'Regex desen test aracı', color: '#4f46e5' },
    { name: 'URL Codec', path: '/url', icon: LinkIcon, desc: 'URL Encode & Decode', color: '#0ea5e9' },
    { name: 'Epoch Converter', path: '/epoch', icon: Clock, desc: 'Zaman damgası dönüştürücü', color: '#f59e0b' },
    { name: 'IP Adresim', path: '/ip', icon: Globe, desc: 'IP adresinizi görün', color: '#6366f1' },
    { name: 'Code Diff Slider', path: '/code-diff', icon: Columns, desc: 'Kod karşılaştırma sürgüsü', color: '#f59e0b' },
    { name: 'Hicri Dönüştürücü', path: '/hicri', icon: Moon, desc: 'Miladi ↔ Hicri takvim', color: '#059669' },
    { name: 'İnteraktif Terminal', path: '/terminal', icon: TerminalIcon, desc: 'Komut satırı arayüzü', color: '#475569' },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
      <div className="flex items-center gap-2 text-base font-extrabold text-zinc-900 dark:text-white font-['Outfit']">
        <Grid className="h-5 w-5 text-brand-blue" />
        Tüm Geliştirici Araçları
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isCurrent = pathname === tool.path;

          if (isCurrent) return null;

          return (
            <Link
              key={tool.path}
              href={tool.path}
              className="group relative flex flex-col justify-between p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm"
                  style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-brand-blue dark:group-hover:text-brand-blue transition-colors">
                  {tool.name}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-bold text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Kullan →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
