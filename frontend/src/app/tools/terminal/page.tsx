'use client';

import { useEffect, useRef, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { api } from '@/lib/api';

export default function InteractiveTerminal() {
  const [theme, setTheme] = useState<'matrix' | 'classic' | 'ubuntu' | 'dark' | 'light'>('matrix');
  const [history, setHistory] = useState<{ type: 'input' | 'output'; text: string; isHtml?: boolean }[]>([
    { type: 'output', text: 'Tayfun Taşdemir Portfolyo CLI Terminaline Hoş Geldiniz! v1.0.0' },
    { type: 'output', text: "Kullanılabilir komutları listelemek için 'help' veya 'yardim' yazın." },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [posts, setPosts] = useState<any[]>([]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const quotes = [
    "Mevlana: 'Kendini bilmeyen, alemi bilemez.'",
    "İbn Arabi: 'Kendini bilen, Yaratan'ı bulur.'",
    "Hz. Ali: 'Kendini bilen, evrenin sırrına vakıf olur.'",
    "İbn Sina: 'Bir insan kendini tanıdığında, hayatını anlamlandırabilir.'"
  ];

  useEffect(() => {
    // Fetch last posts for command output
    api.get('/posts?limit=5')
      .then(res => setPosts(res.data?.data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      const newHistory = [...history, { type: 'input' as const, text: trimmed }];
      setHistory(newHistory);
      setCmdHistory([...cmdHistory, trimmed]);
      setHistoryIndex(-1);
      setInputVal('');

      processCommand(trimmed, newHistory);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIdx);
      setInputVal(cmdHistory[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex === cmdHistory.length - 1) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        const newIdx = Math.min(cmdHistory.length - 1, historyIndex + 1);
        setHistoryIndex(newIdx);
        setInputVal(cmdHistory[newIdx]);
      }
    }
  };

  const processCommand = (raw: string, currentHist: typeof history) => {
    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    let output = '';
    let isHtml = false;

    switch (cmd) {
      case 'help':
      case 'yardim':
        isHtml = true;
        output = `
          <p class="font-bold mb-1">Kullanılabilir Komutlar:</p>
          <table class="w-full max-w-lg text-left text-xs">
            <tr><td class="font-bold text-blue-450 pr-4">about / kimim</td><td>Tayfun Taşdemir hakkında detaylı bilgi.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">posts / yazilar</td><td>En son yayınlanan 5 blog yazısını listeler.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">tools / araclar</td><td>Uygulama merkezindeki araçları listeler.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">contact / iletisim</td><td>Sosyal ağlar ve iletişim kanalları.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">ip</td><td>IP adresinizi sorgular.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">date / tarih</td><td>Güncel tarih ve saat bilgisini gösterir.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">quote / soz</td><td>Rastgele bir bilge sözü yazdırır.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">theme [tema]</td><td>Tema değiştirir. matrix, classic, ubuntu, dark, light</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">home / anasayfa</td><td>Ana sayfaya yönlendirir.</td></tr>
            <tr><td class="font-bold text-blue-450 pr-4">clear / temizle</td><td>Terminal ekranını temizler.</td></tr>
          </table>
        `;
        break;

      case 'about':
      case 'kimim':
        isHtml = true;
        output = `
          <p><span class="font-bold text-blue-400">Tayfun Taşdemir</span></p>
          <p class="mt-1">Bilgisayar Mühendisi & Backend Geliştirici.</p>
          <p class="mt-2 text-justify">Laravel, PHP, SQL, Javascript ve modern web teknolojileri üzerinde çalışıyorum. Temiz kod yazmak, performanslı API'ler tasarlamak ve yeni teknolojiler keşfetmek tutkumdur.</p>
        `;
        break;

      case 'posts':
      case 'yazilar':
        isHtml = true;
        if (posts.length > 0) {
          let listStr = '<p class="font-bold text-blue-400 mb-1">En Son Blog Yazıları:</p><ul class="list-disc list-inside space-y-1">';
          posts.forEach(p => {
            listStr += `<li><a href="/post/${p.slug}" class="underline" target="_blank">${p.title}</a></li>`;
          });
          listStr += '</ul>';
          output = listStr;
        } else {
          output = '<p class="opacity-75">Kayıtlı blog yazısı bulunamadı.</p>';
        }
        break;

      case 'tools':
      case 'araclar':
        isHtml = true;
        output = `
          <p class="font-bold text-blue-400 mb-1">Sistemdeki Aktif Araçlar:</p>
          <ul class="list-disc list-inside space-y-1">
            <li>IP Sorgulama (/tools/ip)</li>
            <li>Epoch Converter (/tools/epoch)</li>
            <li>JSON Formatter (/tools/json)</li>
            <li>Base64 Atölyesi (/tools/base64)</li>
            <li>Hicri Dönüştürücü (/tools/hicri)</li>
            <li>İnteraktif Terminal (/tools/terminal)</li>
          </ul>
        `;
        break;

      case 'contact':
      case 'iletisim':
        isHtml = true;
        output = `
          <p class="font-bold text-blue-400 mb-1">İletişim Bilgileri:</p>
          <ul class="space-y-1">
            <li>E-Posta: <a href="mailto:info@tayfuntasdemir.com.tr" class="underline">info@tayfuntasdemir.com.tr</a></li>
            <li>GitHub: <a href="https://github.com/tafu18" target="_blank" class="underline">github.com/tafu18</a></li>
            <li>Telefon: +90 538 597 23 18</li>
          </ul>
        `;
        break;

      case 'ip':
        isHtml = true;
        output = '<p>IP adresi tespit ediliyor...</p>';
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => {
            setHistory(h => [...h, { type: 'output', text: `Sizin IP Adresiniz: ${data.ip}` }]);
          })
          .catch(() => {
            setHistory(h => [...h, { type: 'output', text: 'IP adresi alınamadı.' }]);
          });
        break;

      case 'date':
      case 'tarih':
        output = `Tarih/Saat: ${new Date().toLocaleString('tr-TR')}`;
        break;

      case 'quote':
      case 'soz':
        output = `“${quotes[Math.floor(Math.random() * quotes.length)]}”`;
        break;

      case 'theme':
        const themes: any = ['matrix', 'classic', 'ubuntu', 'dark', 'light'];
        if (themes.includes(arg)) {
          setTheme(arg as any);
          output = `Tema değiştirildi: ${arg}`;
        } else {
          output = `Geçersiz tema. Seçenekler: ${themes.join(', ')}`;
        }
        break;

      case 'clear':
      case 'temizle':
        setHistory([]);
        return;

      case 'home':
      case 'anasayfa':
        output = 'Ana sayfaya yönlendiriliyorsunuz...';
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        break;

      default:
        output = `Komut bulunamadı: '${cmd}'. Yardım almak için 'help' veya 'yardim' yazın.`;
    }

    if (output) {
      setHistory(h => [...h, { type: 'output', text: output, isHtml }]);
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return 'bg-zinc-950 text-blue-500 border-blue-500/20';
      case 'classic':
        return 'bg-stone-950 text-amber-500 border-amber-500/20';
      case 'ubuntu':
        return 'bg-[#2d0922] text-white border-orange-500/20';
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-700';
      case 'light':
        return 'bg-zinc-50 text-zinc-900 border-zinc-200';
    }
  };

  const getPromptColor = () => {
    switch (theme) {
      case 'matrix':
        return 'text-blue-450';
      case 'classic':
        return 'text-amber-450';
      case 'ubuntu':
        return 'text-orange-500';
      case 'dark':
        return 'text-sky-400';
      case 'light':
        return 'text-blue-600';
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-zinc-900 text-zinc-400 px-4 py-3 rounded-t-2xl border-b border-zinc-800">
          <div className="flex space-x-2">
            <div className="h-3.5 w-3.5 rounded-full bg-red-500" />
            <div className="h-3.5 w-3.5 rounded-full bg-yellow-500" />
            <div className="h-3.5 w-3.5 rounded-full bg-green-500" />
          </div>
          <span className="text-xs font-mono">tayfun@portfolio: ~</span>
          <div className="flex gap-2">
            {['matrix', 'classic', 'ubuntu', 'dark', 'light'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t as any)}
                className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                  theme === t ? 'border-white text-white' : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Body */}
        <div
          onClick={focusInput}
          className={`h-[500px] overflow-y-auto p-6 font-mono text-sm border-x border-b rounded-b-2xl shadow-lg transition-colors duration-300 cursor-text ${getThemeClasses()}`}
        >
          <div className="space-y-3">
            {history.map((line, idx) => (
              <div key={idx}>
                {line.type === 'input' ? (
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getPromptColor()}`}>tayfun@portfolio:~$</span>
                    <span>{line.text}</span>
                  </div>
                ) : line.isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: line.text }} className="pl-4 leading-relaxed" />
                ) : (
                  <div className="pl-4 leading-relaxed whitespace-pre-wrap">{line.text}</div>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Active Input Line */}
          <div className="flex items-center gap-2 mt-4">
            <span className={`font-bold ${getPromptColor()}`}>tayfun@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 font-mono text-sm"
              autoFocus
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
