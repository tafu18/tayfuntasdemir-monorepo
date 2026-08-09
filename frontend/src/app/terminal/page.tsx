'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageTransition from '@/components/PageTransition';
import { useRouter } from 'next/navigation';
import OtherTools from '@/components/OtherTools';

const appsList = [
  { name: 'IP Adresim', route: '/ip', desc: 'IP Sorgu Ekranı' },
  { name: 'Epoch Converter', route: '/epoch', desc: 'Zaman Damgası Dönüştürücü' },
  { name: 'JSON Formatter', route: '/json', desc: 'JSON Düzenleyici' },
  { name: 'Regex Tester', route: '/regex', desc: 'Regex Test ve Eşleşme Analizi' },
  { name: 'JWT Decoder', route: '/jwt', desc: 'JSON Web Token Kod Çözücü' },
  { name: 'URL Codec', route: '/url', desc: 'URL Kodlama ve Çözme' },
  { name: 'Code Diff Slider', route: '/code-diff', desc: 'Görsel Kod Karşılaştırma Sürgüsü' },
  { name: 'Base64 Encode/Decode', route: '/base64', desc: 'Base64 İşlemleri' },
  { name: 'Hicri Çevirici', route: '/hicri', desc: 'Hicri/Miladi Çevirici' }
];

const quotesList = [
  "Mevlana: “İki günü eşit olan zarardadır.”",
  "Yunus Emre: “Biri var, her zaman seninle, o da sensin.”",
  "İbn Sina: “Bilgi, insanın içindeki karanlıkları aydınlatır.”",
  "Hz. Ali: “Kendini bilmek, her şeyin başlangıcıdır.”",
  "İmam Gazali: “İlim, insanın gönlünde huzur yaratır.”"
];

export default function TerminalCli() {
  const router = useRouter();
  const [theme, setTheme] = useState('matrix');
  const [history, setHistory] = useState<React.ReactNode[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [ip, setIp] = useState('Yükleniyor...');
  const [posts, setPosts] = useState<{ title: string, slug: string }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('https://api64.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Bilinmiyor'));

    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setPosts(data.data.slice(0, 5).map((p: any) => ({ title: p.title, slug: p.slug })));
        }
      })
      .catch(() => { });
  }, []);

  const scrollToBottom = () => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, inputVal]);

  const executeCommand = (rawCommand: string) => {
    const parts = rawCommand.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    const newHistory = [...history];

    newHistory.push(
      <div key={Date.now() + Math.random()}>
        <span className="term-prompt font-bold">tayfun@portfolio:~$</span> <span>{rawCommand}</span>
      </div>
    );

    let responseContent: React.ReactNode = null;

    switch (cmd) {
      case 'help':
      case 'yardim':
        responseContent = (
          <div className="mt-1 mb-3">
            <p className="font-bold mb-1">Kullanılabilir Komutlar:</p>
            <table className="table-auto border-none text-left w-full max-w-lg">
              <tbody>
                <tr><td className="term-accent font-bold pr-4 w-1/3">about / kimim</td><td>Tayfun Taşdemir hakkında detaylı bilgi.</td></tr>
                <tr><td className="term-accent font-bold pr-4">posts / yazilar</td><td>En son yayınlanan 5 blog yazısını listeler.</td></tr>
                <tr><td className="term-accent font-bold pr-4">tools / araclar</td><td>Uygulama merkezindeki araçları listeler.</td></tr>
                <tr><td className="term-accent font-bold pr-4">contact / iletisim</td><td>Sosyal ağlar ve iletişim kanalları.</td></tr>
                <tr><td className="term-accent font-bold pr-4">ip</td><td>IP adresinizi yazdırır.</td></tr>
                <tr><td className="term-accent font-bold pr-4">date / tarih</td><td>Güncel tarih ve saat bilgisini gösterir.</td></tr>
                <tr><td className="term-accent font-bold pr-4">quote / soz</td><td>Rastgele bir bilge sözü yazdırır.</td></tr>
                <tr><td className="term-accent font-bold pr-4">theme [tema]</td><td>Tema değiştirir. Kullanım: <span className="opacity-75">theme matrix, classic, ubuntu, dark, light</span></td></tr>
                <tr><td className="term-accent font-bold pr-4">home / anasayfa</td><td>Ana sayfaya yönlendirir.</td></tr>
                <tr><td className="term-accent font-bold pr-4">clear / temizle</td><td>Terminal penceresini temizler.</td></tr>
              </tbody>
            </table>
          </div>
        );
        break;
      case 'about':
      case 'kimim':
        responseContent = (
          <div className="mt-1 mb-3">
            <p><span className="font-bold term-accent">Tayfun Taşdemir</span></p>
            <p className="mt-1">Bilgisayar Mühendisi & Backend Geliştirici.</p>
            <p className="mt-2 text-justify">Laravel, PHP, SQL, Javascript ve modern web teknolojileri üzerinde çalışıyorum. Temiz kod yazmak, performanslı API'ler tasarlamak ve yeni teknolojiler keşfetmek tutkumdur. Bu siteyi de kendi geliştirdiğim projeleri ve bilgileri tek bir yerde toplamak için kurdum.</p>
          </div>
        );
        break;
      case 'posts':
      case 'yazilar':
        responseContent = (
          <div className="mt-1 mb-3">
            {posts.length > 0 ? (
              <>
                <p className="font-bold term-accent mb-1">En Son Blog Yazıları:</p>
                <ul className="list-disc list-inside space-y-1">
                  {posts.map((p, i) => (
                    <li key={i}><a href={`/post/${p.slug}`} className="hover:underline text-inherit font-semibold">{p.title}</a> <span className="text-xs opacity-75">(Detay için tıkla)</span></li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="opacity-75">Kayıtlı blog yazısı bulunamadı.</p>
            )}
          </div>
        );
        break;
      case 'tools':
      case 'araclar':
        responseContent = (
          <div className="mt-1 mb-3">
            <p className="font-bold term-accent mb-1">Sistemdeki Aktif Araçlar:</p>
            <ul className="list-disc list-inside space-y-1">
              {appsList.map((a, i) => (
                <li key={i}><a href={a.route} className="hover:underline font-semibold">{a.name}</a> - <span className="opacity-75">{a.desc}</span></li>
              ))}
            </ul>
          </div>
        );
        break;
      case 'contact':
      case 'iletisim':
        responseContent = (
          <div className="mt-1 mb-3">
            <p className="font-bold term-accent mb-1">İletişim Bilgileri:</p>
            <ul className="space-y-1">
              <li>E-Posta: <a href="mailto:tayfu.tasdemir@gmail.com" className="hover:underline">tayfu.tasdemir@gmail.com</a></li>
              <li>GitHub: <a href="https://github.com/vaktihuzur" target="_blank" className="hover:underline">github.com/vaktihuzur</a></li>
              <li>WhatsApp: <a href="https://wa.me/905385972318" target="_blank" className="hover:underline">+90 538 597 23 18</a></li>
              <li>Vakt-i Huzur Uygulaması: <a href="https://vaktihuzur.com.tr" target="_blank" className="hover:underline">vaktihuzur.com.tr</a></li>
            </ul>
          </div>
        );
        break;
      case 'ip':
        responseContent = (
          <div className="mt-1 mb-3">
            <p>Sizin IP Adresiniz: <span className="font-bold term-accent">{ip}</span></p>
          </div>
        );
        break;
      case 'date':
      case 'tarih':
        responseContent = (
          <div className="mt-1 mb-3">
            <p>Tarih/Saat: <span className="font-bold term-accent">{new Date().toLocaleString('tr-TR')}</span></p>
          </div>
        );
        break;
      case 'quote':
      case 'soz':
        responseContent = (
          <div className="mt-1 mb-3">
            <p className="italic text-justify">“{quotesList[Math.floor(Math.random() * quotesList.length)]}”</p>
          </div>
        );
        break;
      case 'theme':
        const allowedThemes = ['matrix', 'classic', 'ubuntu', 'dark', 'light'];
        if (allowedThemes.includes(arg)) {
          setTheme(arg);
          responseContent = <div className="mt-1 mb-3"><p>Tema başarıyla değiştirildi: <span className="font-bold term-accent">{arg}</span></p></div>;
        } else {
          responseContent = <div className="mt-1 mb-3"><p className="text-red-500">Geçersiz tema. Kullanılabilir temalar: matrix, classic, ubuntu, dark, light</p></div>;
        }
        break;
      case 'clear':
      case 'temizle':
        setHistory([]);
        return; // do not append to newHistory since it's cleared
      case 'home':
      case 'anasayfa':
        responseContent = <div className="mt-1 mb-3"><p className="term-accent">Ana sayfaya yönlendiriliyorsunuz...</p></div>;
        setTimeout(() => {
          router.push('/');
        }, 1000);
        break;
      default:
        responseContent = <div className="mt-1 mb-3"><p className="text-red-500">Komut bulunamadı: '{cmd}'. Yardım için 'help' veya 'yardim' yazın.</p></div>;
        break;
    }

    if (responseContent) {
      newHistory.push(<div key={Date.now() + Math.random() + 1}>{responseContent}</div>);
    }

    setHistory(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = inputVal.trim();
      if (command) {
        executeCommand(command);
        const newCmds = [...cmdHistory, command];
        setCmdHistory(newCmds);
        setHistoryIndex(newCmds.length);
      } else {
        setHistory(prev => [...prev, <div key={Date.now()}><span className="term-prompt font-bold">tayfun@portfolio:~$</span></div>]);
      }
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      } else {
        setHistoryIndex(cmdHistory.length);
        setInputVal('');
      }
    }
  };

  return (
    <PageTransition>
      <div className={`terminal-container theme-${theme} min-h-[85vh] py-12 px-4 transition-colors duration-300`} style={{ backgroundColor: 'var(--bg-color)' }} onClick={() => inputRef.current?.focus()}>

        <style dangerouslySetInnerHTML={{
          __html: `
          .terminal-container { font-family: 'Fira Code', 'Courier New', Courier, monospace; transition: all 0.3s ease; }
          .theme-matrix { --bg-color: #030712; --terminal-bg: #0b0f19; --text-color: #10b981; --prompt-color: #34d399; --accent-color: #059669; --border-color: #10b98150; --header-bg: #111827; --header-text: #9ca3af; }
          .theme-classic { --bg-color: #0c0a09; --terminal-bg: #1c1917; --text-color: #f59e0b; --prompt-color: #fbbf24; --accent-color: #d97706; --border-color: #f59e0b40; --header-bg: #292524; --header-text: #d6d3d1; }
          .theme-ubuntu { --bg-color: #1e0b18; --terminal-bg: #2d0922; --text-color: #ffffff; --prompt-color: #dfdbd2; --accent-color: #e95420; --border-color: #e9542060; --header-bg: #3d1b33; --header-text: #dfdbd2; }
          .theme-dark { --bg-color: #0f172a; --terminal-bg: #1e293b; --text-color: #f8fafc; --prompt-color: #38bdf8; --accent-color: #0ea5e9; --border-color: #334155; --header-bg: #1e293b; --header-text: #94a3b8; }
          .theme-light { --bg-color: #f8fafc; --terminal-bg: #ffffff; --text-color: #334155; --prompt-color: #2563eb; --accent-color: #3b82f6; --border-color: #e2e8f0; --header-bg: #f1f5f9; --header-text: #64748b; }
          
          .term-window { background-color: var(--terminal-bg); color: var(--text-color); border: 1px solid var(--border-color); }
          .term-header { background-color: var(--header-bg); color: var(--header-text); }
          .term-prompt { color: var(--prompt-color); }
          .term-accent { color: var(--accent-color); }
          
          .blinking-cursor { animation: blink 1s step-end infinite; background-color: var(--text-color); color: var(--terminal-bg); }
          @keyframes blink { from, to { background-color: transparent } 50% { background-color: var(--text-color) } }
          
          .term-body::-webkit-scrollbar { width: 8px; }
          .term-body::-webkit-scrollbar-track { background: var(--terminal-bg); }
          .term-body::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        `}} />

        <div className="max-w-4xl mx-auto">
          {/* Terminal Window */}
          <div className="term-window rounded-xl shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="term-header px-4 py-3 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <div className="text-xs font-semibold tracking-wider">tayfun@portfolio: ~</div>
              <div className="w-12"></div>
            </div>

            {/* Body */}
            <div ref={bodyRef} className="term-body h-[380px] md:h-[550px] overflow-y-auto p-4 md:p-6 text-sm leading-relaxed" onClick={() => inputRef.current?.focus()}>

              {/* Welcome Msg */}
              <div className="mb-4">
                <pre className="hidden sm:block font-bold text-xs sm:text-sm md:text-base leading-tight mb-4 select-none">
                  {`████████╗ █████╗ ██╗   ██╗███████╗██╗   ██╗███╗   ██╗
╚══██╔══╝██╔══██╗╚██╗ ██╔╝██╔════╝██║   ██║████╗  ██║
   ██║   ███████║ ╚████╔╝ █████╗  ██║   ██║██╔██╗ ██║
   ██║   ██╔══██║  ╚██╔╝  ██╔══╝  ██║   ██║██║╚██╗██║
   ██║   ██║  ██║   ██║   ██║     ╚██████╔╝██║ ╚████║
   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═══╝`}
                </pre>
                <div className="block sm:hidden font-bold text-lg mb-2 select-none">_TAYFUN_TASTEMIR_</div>
                <p className="mb-1"><span className="font-bold">Tayfun Taşdemir</span> - İnteraktif Portföy Terminali v1.0.0</p>
                <p className="mb-2">Hoş geldiniz! Sitede gezinmek ve bilgi almak için komut satırını kullanabilirsiniz.</p>
                <p className="text-xs opacity-75">Yardım almak için <span className="font-bold underline cursor-pointer" onClick={(e) => { e.stopPropagation(); executeCommand('help'); }}>help</span> veya <span className="font-bold underline cursor-pointer" onClick={(e) => { e.stopPropagation(); executeCommand('yardim'); }}>yardim</span> yazabilirsiniz.</p>
              </div>

              {/* History */}
              <div>{history}</div>

              {/* Input Area */}
              <div className="flex items-start mt-2">
                <span className="term-prompt font-bold mr-2 select-none">tayfun@portfolio:~$</span>
                <div className="flex-grow relative flex items-center min-h-[20px]">
                  <span className="whitespace-pre-wrap break-all mr-1">{inputVal}</span>
                  <span className="w-2 h-4 inline-block blinking-cursor select-none">&nbsp;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-default focus:outline-none text-transparent"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center text-xs text-slate-400 select-none">
            <span className="mr-2 pt-1">Hızlı Tema Değiştir:</span>
            <button onClick={(e) => { e.stopPropagation(); setTheme('matrix'); }} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[#10b981] rounded border border-gray-700">Matrix</button>
            <button onClick={(e) => { e.stopPropagation(); setTheme('classic'); }} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[#f59e0b] rounded border border-gray-700">Classic</button>
            <button onClick={(e) => { e.stopPropagation(); setTheme('ubuntu'); }} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[#e95420] rounded border border-gray-700">Ubuntu</button>
            <button onClick={(e) => { e.stopPropagation(); setTheme('dark'); }} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700">Dark</button>
            <button onClick={(e) => { e.stopPropagation(); setTheme('light'); }} className="px-2 py-1 bg-white hover:bg-gray-100 text-slate-800 rounded border border-gray-300">Light</button>
          </div>

          <div className="mt-12 max-w-5xl mx-auto">
            <OtherTools />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
