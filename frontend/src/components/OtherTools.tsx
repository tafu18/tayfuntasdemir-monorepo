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
  KeyRound
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
    { name: 'Görsel Dönüştürücü', path: '/converter', icon: ImageIcon, desc: 'PNG, JPEG, WebP dönüştürücü', color: '#ec4899' },
    { name: 'HTML Canlı Önizleme', path: '/compiler', icon: Code, desc: 'HTML & CSS canlı izleyici', color: '#f97316' },
    { name: 'IP Adresim', path: '/ip', icon: Globe, desc: 'IP adresinizi görün', color: '#6366f1' },
    { name: 'Epoch Converter', path: '/epoch', icon: Clock, desc: 'Zaman damgası dönüştürücü', color: '#f59e0b' },
    { name: 'JSON Formatter', path: '/json', icon: FileCode, desc: 'JSON güzelleştir & doğrula', color: '#8b5cf6' },
    { name: 'Base64 Atölyesi', path: '/base64', icon: Lock, desc: 'Encode & Decode', color: '#0ea5e9' },
    { name: 'Şifre Oluşturucu', path: '/password-generator', icon: KeyRound, desc: 'Güçlü şifre üretici', color: '#eab308' },
    { name: 'Hicri Dönüştürücü', path: '/hicri', icon: Moon, desc: 'Miladi ↔ Hicri takvim', color: '#059669' },
    { name: 'İnteraktif Terminal', path: '/terminal', icon: TerminalIcon, desc: 'Komut satırı arayüzü', color: '#475569' },
    { name: 'Regex Tester', path: '/regex', icon: Search, desc: 'Regex desen test aracı', color: '#4f46e5' },
    { name: 'JWT Decoder', path: '/jwt', icon: Key, desc: 'JSON Web Token çözücü', color: '#8b5cf6' },
    { name: 'URL Codec', path: '/url', icon: LinkIcon, desc: 'URL Encode & Decode', color: '#0ea5e9' },
    { name: 'Code Diff Slider', path: '/code-diff', icon: Columns, desc: 'Kod karşılaştırma sürgüsü', color: '#f59e0b' },
    { name: 'Veri Üretici', path: '/generator', icon: Settings, desc: 'Test verileri (UUID, Plaka vb.)', color: '#10b981' }
  ];

  return (
    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
      <div className="flex items-center gap-2 text-base font-extrabold text-zinc-900 dark:text-white">
        <Grid className="h-5 w-5 text-zinc-500" />
        Diğer Araçlar
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isCurrent = pathname === tool.path;

          return (
            <Link
              key={tool.path}
              href={tool.path}
              className={`flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border rounded-2xl transition-all duration-200 group ${
                isCurrent
                  ? 'border-brand-blue bg-brand-blue/5 pointer-events-none'
                  : 'border-zinc-200 dark:border-zinc-800 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              style={{
                borderColor: isCurrent ? tool.color : undefined
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: tool.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-brand-blue dark:group-hover:text-brand-blue">
                  {tool.name} {isCurrent && '✓'}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {tool.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
