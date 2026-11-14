'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import QRCode from 'qrcode';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import {
  Trash,
  Type,
  Wifi,
  Mail,
  Phone,
  QrCode,
  Download,
  Upload,
  ImagePlus,
  Check,
  X,
  ScanLine,
  Smartphone,
} from 'lucide-react';

type TabId = 'text' | 'wifi' | 'email' | 'phone';
type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

const TABS: { id: TabId; label: string; icon: typeof Type }[] = [
  { id: 'text', label: 'Metin/URL', icon: Type },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'email', label: 'E-posta', icon: Mail },
  { id: 'phone', label: 'Telefon', icon: Phone },
];

const ERROR_LEVELS: { id: ErrorLevel; label: string; hint: string }[] = [
  { id: 'L', label: 'L', hint: 'Düşük' },
  { id: 'M', label: 'M', hint: 'Orta' },
  { id: 'Q', label: 'Q', hint: 'Yüksek' },
  { id: 'H', label: 'H', hint: 'En yüksek' },
];

const ENCRYPTIONS = [
  { id: 'WPA', label: 'WPA/WPA2' },
  { id: 'WEP', label: 'WEP' },
  { id: 'nopass', label: 'Yok' },
] as const;

type Encryption = (typeof ENCRYPTIONS)[number]['id'];

function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, '\\$1');
}

function buildWifi(
  ssid: string,
  password: string,
  encryption: Encryption,
  hidden: boolean,
): string {
  if (!ssid) return '';
  let result = `WIFI:T:${encryption};S:${escapeWifi(ssid)};`;
  if (encryption !== 'nopass') {
    result += `P:${escapeWifi(password)};`;
  }
  result += `H:${hidden ? 'true' : 'false'};`;
  return `${result};`;
}

function buildEmail(to: string, subject: string, message: string): string {
  const address = to.trim();
  if (!address) return '';
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (message) params.push(`body=${encodeURIComponent(message)}`);
  return `mailto:${address}${params.length ? `?${params.join('&')}` : ''}`;
}

function buildPhone(phone: string): string {
  const normalized = phone.trim().replace(/[^\d+]/g, '');
  return /\d/.test(normalized) ? `tel:${normalized}` : '';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Görsel yüklenemedi.'));
    image.src = src;
  });
}

async function composePng(
  qrDataUrl: string,
  logoDataUrl: string | null,
  size: number,
  background: string,
): Promise<string> {
  if (!logoDataUrl) return qrDataUrl;

  const qrImage = await loadImage(qrDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrDataUrl;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrImage, 0, 0, size, size);

  try {
    const logoImage = await loadImage(logoDataUrl);
    const maxBox = Math.round(size * 0.2);
    const padding = Math.round(maxBox * 0.08);
    const inner = Math.max(1, maxBox - padding * 2);
    const scale = Math.min(inner / logoImage.width, inner / logoImage.height);
    const logoWidth = Math.max(1, Math.round(logoImage.width * scale));
    const logoHeight = Math.max(1, Math.round(logoImage.height * scale));
    const boxX = Math.round((size - maxBox) / 2);
    const boxY = Math.round((size - maxBox) / 2);

    ctx.fillStyle = background;
    ctx.fillRect(boxX, boxY, maxBox, maxBox);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      logoImage,
      Math.round((size - logoWidth) / 2),
      Math.round((size - logoHeight) / 2),
      logoWidth,
      logoHeight,
    );
  } catch {
    return qrDataUrl;
  }

  return canvas.toDataURL('image/png');
}

function embedLogoInSvg(
  svg: string,
  logoDataUrl: string | null,
  background: string,
): string {
  if (!logoDataUrl) return svg;

  const viewBoxMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBoxMatch) return svg;

  const viewBox = parseFloat(viewBoxMatch[1]);
  const maxBox = viewBox * 0.2;
  const padding = maxBox * 0.08;
  const inner = maxBox - padding * 2;
  const boxX = (viewBox - maxBox) / 2;
  const boxY = (viewBox - maxBox) / 2;

  const overlay =
    `<rect x="${boxX}" y="${boxY}" width="${maxBox}" height="${maxBox}" fill="${background}" />` +
    `<image href="${logoDataUrl}" x="${boxX + padding}" y="${boxY + padding}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet" />`;

  return svg.replace('</svg>', `${overlay}</svg>`);
}

export default function QrGenerator() {
  const [tab, setTab] = useState<TabId>('text');

  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<Encryption>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [phone, setPhone] = useState('');

  const [size, setSize] = useState(512);
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState('');
  const [logoError, setLogoError] = useState('');

  const [previewUrl, setPreviewUrl] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [qrError, setQrError] = useState('');
  const [generatedFor, setGeneratedFor] = useState('');
  const [showToast, setShowToast] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const effectiveErrorLevel: ErrorLevel = logoDataUrl ? 'H' : errorLevel;

  const qrData = useMemo(() => {
    switch (tab) {
      case 'wifi':
        return buildWifi(wifiSsid, wifiPassword, wifiEncryption, wifiHidden);
      case 'email':
        return buildEmail(emailTo, emailSubject, emailMessage);
      case 'phone':
        return buildPhone(phone);
      case 'text':
      default:
        return text.trim() ? text : '';
    }
  }, [tab, text, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, emailTo, emailSubject, emailMessage, phone]);

  const isCurrentResult = Boolean(qrData) && generatedFor === qrData;
  const displayPreview = isCurrentResult ? previewUrl : '';
  const displaySvg = isCurrentResult ? svgContent : '';
  const displayError = isCurrentResult ? qrError : '';

  useEffect(() => {
    const currentRequest = ++requestId.current;

    if (!qrData) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const options = {
          errorCorrectionLevel: effectiveErrorLevel,
          margin: 4,
          width: size,
          color: { dark: foreground, light: background },
        };

        const [dataUrl, svg] = await Promise.all([
          QRCode.toDataURL(qrData, options),
          QRCode.toString(qrData, { ...options, type: 'svg' }),
        ]);

        const composed = await composePng(dataUrl, logoDataUrl, size, background);
        if (currentRequest !== requestId.current) return;

        setPreviewUrl(composed);
        setSvgContent(embedLogoInSvg(svg, logoDataUrl, background));
        setQrError('');
        setGeneratedFor(qrData);
      } catch {
        if (currentRequest !== requestId.current) return;
        setPreviewUrl('');
        setSvgContent('');
        setQrError('Bu içerik için QR kod oluşturulamadı. Metni kısaltmayı deneyin.');
        setGeneratedFor(qrData);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [qrData, size, foreground, background, effectiveErrorLevel, logoDataUrl]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const clear = () => {
    requestId.current++;
    setText('');
    setWifiSsid('');
    setWifiPassword('');
    setWifiEncryption('WPA');
    setWifiHidden(false);
    setEmailTo('');
    setEmailSubject('');
    setEmailMessage('');
    setPhone('');
    setLogoDataUrl(null);
    setLogoName('');
    setLogoError('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const clampSize = (value: number) => Math.min(1024, Math.max(128, Math.round(value)));

  const onSizeChange = (value: string) => {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) setSize(clampSize(parsed));
  };

  const onLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError('');

    if (!file.type.startsWith('image/')) {
      setLogoError('Lütfen bir görsel dosyası seçin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result));
      setLogoName(file.name);
      setErrorLevel('H');
    };
    reader.onerror = () => setLogoError('Görsel okunamadı.');
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    setLogoName('');
    setLogoError('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const downloadPng = () => {
    if (!displayPreview) return;
    const link = document.createElement('a');
    link.href = displayPreview;
    link.download = 'qr-kod.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    triggerToast();
  };

  const downloadSvg = () => {
    if (!displaySvg) return;
    const blob = new Blob([displaySvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-kod.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    triggerToast();
  };

  return (
    <PageTransition>
      <div className="qr-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{
          __html: `
          .qr-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99,102,241,0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .qr-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .qr-header h1 span { background: linear-gradient(135deg, #6366f1, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .qr-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .qr-card { background: #09090b; border-color: #27272a; }
          .qr-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #0ea5e9); }
          .qr-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .qr-toolbar { background: #18181b; border-color: #27272a; }
          .qr-dots { display: flex; gap: 6px; }
          .qr-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .qr-dots span:nth-child(1) { background: #ef4444; }
          .qr-dots span:nth-child(2) { background: #f59e0b; }
          .qr-dots span:nth-child(3) { background: #22c55e; }
          .qr-clear-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.3rem 0.75rem; font-size: 0.72rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
          .dark .qr-clear-btn { border-color: #27272a; color: #a1a1aa; }
          .qr-clear-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.04); }
          .qr-tabs { display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; overflow-x: auto; }
          .dark .qr-tabs { background: #09090b; border-color: #27272a; }
          .qr-tab { flex: 1; min-width: 120px; padding: 1rem 0.75rem; background: transparent; border: none; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.45rem; white-space: nowrap; }
          .dark .qr-tab { color: #a1a1aa; }
          .qr-tab:hover { background: #f1f5f9; color: #6366f1; }
          .dark .qr-tab:hover { background: #18181b; }
          .qr-tab.active { color: #6366f1; border-bottom-color: #6366f1; background: rgba(99,102,241,0.08); }
          .qr-label { display: block; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 0.5rem; }
          .qr-section-title { font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #6366f1; }
          .qr-input, .qr-textarea { width: 100%; padding: 1rem 1.1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; color: #0f172a; background: #f1f5f9; border: 2px solid transparent; border-radius: 14px; outline: none; transition: all 0.25s ease; }
          .dark .qr-input, .dark .qr-textarea { background: #18181b; color: #f8fafc; }
          .qr-input:focus, .qr-textarea:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
          .dark .qr-input:focus, .dark .qr-textarea:focus { background: #000; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
          .qr-textarea { min-height: 140px; resize: vertical; }
          .qr-settings { margin-top: 2rem; padding-top: 1.75rem; border-top: 1px solid #e2e8f0; }
          .dark .qr-settings { border-color: #27272a; }
          .qr-range { width: 100%; accent-color: #6366f1; cursor: pointer; }
          .qr-seg { display: flex; flex-wrap: wrap; gap: 0.4rem; }
          .qr-seg-btn { border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; padding: 0.45rem 0.8rem; font-size: 0.78rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
          .dark .qr-seg-btn { border-color: #27272a; background: #09090b; color: #a1a1aa; }
          .qr-seg-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
          .qr-seg-btn.active { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.08); }
          .qr-seg-btn:disabled { opacity: 0.55; cursor: not-allowed; }
          .qr-color-box { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 14px; padding: 0.65rem 0.85rem; }
          .dark .qr-color-box { background: #18181b; border-color: #27272a; }
          .qr-color-input { width: 38px; height: 34px; border: none; background: none; padding: 0; border-radius: 8px; cursor: pointer; }
          .qr-preview { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.25rem; display: flex; align-items: center; justify-content: center; min-height: 280px; }
          .dark .qr-preview { background: #18181b; border-color: #27272a; }
          .qr-preview-img { width: 100%; max-width: 280px; height: auto; border-radius: 12px; box-shadow: 0 10px 30px -12px rgba(0,0,0,0.18); transition: opacity 0.2s; }
          .qr-preview-img.generating { opacity: 0.45; }
          .qr-payload { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; line-height: 1.6; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.65rem 0.85rem; word-break: break-all; max-height: 96px; overflow: auto; }
          .dark .qr-payload { background: #18181b; border-color: #27272a; color: #a1a1aa; }
          .qr-download-btn { display: flex; align-items: center; justify-content: center; gap: 0.45rem; border-radius: 12px; padding: 0.75rem 0.9rem; font-size: 0.82rem; font-weight: 800; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
          .qr-download-btn.primary { background: #6366f1; color: #fff; box-shadow: 0 10px 20px -10px rgba(99,102,241,0.7); }
          .qr-download-btn.primary:hover { background: #4f46e5; }
          .qr-download-btn.secondary { background: #fff; color: #475569; border-color: #e2e8f0; }
          .dark .qr-download-btn.secondary { background: #09090b; color: #d4d4d8; border-color: #27272a; }
          .qr-download-btn.secondary:hover { border-color: #6366f1; color: #6366f1; }
          .qr-download-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
          .qr-logo-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; width: 100%; border: 1px dashed #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 0.7rem 0.85rem; font-size: 0.8rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
          .dark .qr-logo-btn { border-color: #3f3f46; background: #18181b; color: #a1a1aa; }
          .qr-logo-btn:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.05); }
          .qr-logo-remove { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
          .dark .qr-logo-remove { border-color: #27272a; background: #09090b; color: #a1a1aa; }
          .qr-logo-remove:hover { border-color: #ef4444; color: #ef4444; }
          .qr-hint { font-size: 0.72rem; line-height: 1.55; color: #94a3b8; }
          .qr-error { font-size: 0.78rem; color: #ef4444; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 0.7rem 0.9rem; }
          .qr-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; text-align: center; color: #94a3b8; padding: 2rem 1rem; }
        `}} />

        <div className="max-w-[1080px] mx-auto w-full">

          <header className="text-center mb-12 mt-4 qr-header">
            <div className="qr-badge">
              <ScanLine className="w-3.5 h-3.5" />
              Canlı Önizleme
            </div>
            <h1 className="text-slate-900 dark:text-white">QR Kod <span>Oluşturucu</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[560px] mx-auto">
              Metin, URL, Wi-Fi, e-posta ve telefon için QR kod oluşturun. Renkleri ve boyutu ayarlayın, PNG veya SVG olarak indirin.
            </p>
          </header>

          <div className="qr-card">

            <div className="qr-toolbar">
              <div className="qr-dots">
                <span></span><span></span><span></span>
              </div>
              <div>
                <button className="qr-clear-btn" onClick={clear}>
                  <Trash className="w-3 h-3" /> Temizle
                </button>
              </div>
            </div>

            <div className="qr-tabs">
              {TABS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`qr-tab ${tab === item.id ? 'active' : ''}`}
                    onClick={() => setTab(item.id)}
                  >
                    <Icon className="w-4 h-4" /> {item.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 sm:p-8 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">

              <div>
                {tab === 'text' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="qr-label">Metin veya URL</label>
                    <textarea
                      className="qr-textarea"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="https://ornek.com veya herhangi bir metin yazın..."
                    />
                    <p className="qr-hint mt-2">Yazdıkça QR kod otomatik olarak güncellenir.</p>
                  </div>
                )}

                {tab === 'wifi' && (
                  <div className="animate-in fade-in duration-200 space-y-4">
                    <div>
                      <label className="qr-label">Ağ Adı (SSID)</label>
                      <input
                        className="qr-input"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="EvWifi"
                      />
                    </div>
                    <div>
                      <label className="qr-label">Şifre</label>
                      <input
                        className="qr-input"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Wi-Fi şifresi"
                        disabled={wifiEncryption === 'nopass'}
                      />
                    </div>
                    <div>
                      <label className="qr-label">Şifreleme Türü</label>
                      <div className="qr-seg">
                        {ENCRYPTIONS.map((item) => (
                          <button
                            key={item.id}
                            className={`qr-seg-btn ${wifiEncryption === item.id ? 'active' : ''}`}
                            onClick={() => setWifiEncryption(item.id)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="w-4 h-4 accent-indigo-500"
                      />
                      Gizli ağ
                    </label>
                    <p className="qr-hint">
                      Özel karakterler (; , : \ &quot;) otomatik olarak kaçırılır.
                    </p>
                  </div>
                )}

                {tab === 'email' && (
                  <div className="animate-in fade-in duration-200 space-y-4">
                    <div>
                      <label className="qr-label">Alıcı</label>
                      <input
                        type="email"
                        className="qr-input"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="ornek@eposta.com"
                      />
                    </div>
                    <div>
                      <label className="qr-label">Konu</label>
                      <input
                        className="qr-input"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="E-posta konusu"
                      />
                    </div>
                    <div>
                      <label className="qr-label">Mesaj</label>
                      <textarea
                        className="qr-textarea"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="E-posta mesajı..."
                      />
                    </div>
                  </div>
                )}

                {tab === 'phone' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="qr-label">Telefon Numarası</label>
                    <input
                      type="tel"
                      className="qr-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 555 555 55 55"
                    />
                    <p className="qr-hint mt-2">Boşluk, parantez ve tireler temizlenerek tel: formatına dönüştürülür.</p>
                  </div>
                )}

                <div className="qr-settings">
                  <div className="qr-section-title mb-5">QR Ayarları</div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="qr-label mb-0">Boyut</label>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{size} × {size} px</span>
                      </div>
                      <input
                        type="range"
                        min={128}
                        max={1024}
                        step={8}
                        value={size}
                        onChange={(e) => onSizeChange(e.target.value)}
                        className="qr-range"
                      />
                      <div className="flex items-center justify-between mt-2 text-[0.68rem] font-semibold text-slate-400">
                        <span>128 px</span>
                        <span>1024 px</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="qr-label">Ön Plan</label>
                        <div className="qr-color-box">
                          <input
                            type="color"
                            value={foreground}
                            onChange={(e) => setForeground(e.target.value)}
                            className="qr-color-input"
                            aria-label="Ön plan rengi"
                          />
                          <span className="font-mono text-[0.7rem] font-bold text-slate-500 dark:text-slate-400">{foreground.toUpperCase()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="qr-label">Arka Plan</label>
                        <div className="qr-color-box">
                          <input
                            type="color"
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className="qr-color-input"
                            aria-label="Arka plan rengi"
                          />
                          <span className="font-mono text-[0.7rem] font-bold text-slate-500 dark:text-slate-400">{background.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="qr-label">Hata Düzeltme Seviyesi</label>
                      <div className="qr-seg">
                        {ERROR_LEVELS.map((level) => (
                          <button
                            key={level.id}
                            className={`qr-seg-btn ${effectiveErrorLevel === level.id ? 'active' : ''}`}
                            onClick={() => setErrorLevel(level.id)}
                            disabled={Boolean(logoDataUrl)}
                            title={level.hint}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      {logoDataUrl ? (
                        <p className="qr-hint mt-2">Logo ekliyken hata düzeltme seviyesi otomatik olarak H kullanılır.</p>
                      ) : (
                        <p className="qr-hint mt-2">Seviye yükseldikçe QR kod daha dayanıklı olur ancak daha yoğun görünür.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="lg:sticky lg:top-24 space-y-3">
                  <div className="qr-preview">
                    {displayError ? (
                      <div className="qr-error">{displayError}</div>
                    ) : displayPreview ? (
                      <NextImage
                        src={displayPreview}
                        alt="QR kod önizleme"
                        width={size}
                        height={size}
                        unoptimized
                        className="qr-preview-img"
                      />
                    ) : (
                      <div className="qr-empty">
                        <QrCode className="w-12 h-12 opacity-40" />
                        <p className="text-sm font-semibold">QR kod oluşturmak için bilgi girin</p>
                      </div>
                    )}
                  </div>

                  {qrData && !qrError && (
                    <div className="qr-payload" title={qrData}>{qrData}</div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button className="qr-download-btn primary" onClick={downloadPng} disabled={!displayPreview}>
                      <Download className="w-4 h-4" /> PNG indir
                    </button>
                    <button className="qr-download-btn secondary" onClick={downloadSvg} disabled={!displaySvg}>
                      <Download className="w-4 h-4" /> SVG indir
                    </button>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="qr-label mb-0">Logo (isteğe bağlı)</span>
                      {logoDataUrl && <span className="text-[0.68rem] font-semibold text-emerald-500">Ekli</span>}
                    </div>

                    {logoDataUrl ? (
                      <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2">
                        <NextImage
                          src={logoDataUrl}
                          alt="Logo önizleme"
                          width={36}
                          height={36}
                          unoptimized
                          className="w-9 h-9 object-contain rounded-md bg-white"
                        />
                        <span className="flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{logoName}</span>
                        <button className="qr-logo-remove" onClick={removeLogo} aria-label="Logoyu kaldır">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="qr-logo-btn">
                        <ImagePlus className="w-4 h-4" /> Logo Yükle
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onLogoChange}
                        />
                      </label>
                    )}
                    <p className="qr-hint mt-2">
                      Logo QR kodun en fazla %20&apos;sini kaplar. PNG indirmeye logo dahil edilir.
                    </p>
                    {logoError && <p className="qr-error mt-2">{logoError}</p>}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Dört Hazır Şablon</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Metin, Wi-Fi, e-posta ve telefon için doğru formatlar.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-sky-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">Canlı Güncelleme</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Yazdıkça QR kod anında yeniden oluşturulur.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-slate-900 dark:text-white mb-1">PNG & SVG</h4>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Yüksek çözünürlüklü indirme, isteğe bağlı logo desteği.</p>
              </div>
            </div>
          </div>

          <FAQ
            title="QR Kod Oluşturucu SSS"
            subtitle="QR kod türleri, indirme ve logo kullanımı hakkında sorular"
            items={[
              { question: "QR kod nedir?", answer: "QR kod, bir metni veya URL'yi kare bir matrise dönüştüren iki boyutlu barkoddur. Akıllı telefon kameraları bu kodu okuyarak içindeki bilgiye ulaşır." },
              { question: "Wi-Fi QR kodu nasıl çalışır?", answer: "Wi-Fi QR kodu, ağ adı ve şifreyi WIFI:T:...;S:...;P:...;; formatında saklar. Telefonun kamerası bu kodu okuduğunda ağa otomatik bağlanmayı önerir." },
              { question: "Hata düzeltme seviyesi ne işe yarar?", answer: "Seviye yükseldikçe QR kodun bir kısmı zarar görse bile okunabilir. L %7, M %15, Q %25 ve H %30'a kadar hata kurtarma sağlar. Logo kullanıldığında H otomatik seçilir." },
              { question: "Logo QR kodun ne kadarını kaplayabilir?", answer: "Logo, QR kodun en fazla %20'sini kaplayacak şekilde ortalanır. Hata düzeltme seviyesi H olduğu için kod okunabilirliğini korur." },
              { question: "Verilerim sunucuya gönderiliyor mu?", answer: "Hayır. QR kod tamamen tarayıcınızda oluşturulur; metin, Wi-Fi şifresi veya logo cihazınızdan çıkmaz." },
            ]}
          />

          <OtherTools />

        </div>

        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-[0.88rem] z-[100] animate-in slide-in-from-bottom-5">
            <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
            İndirme Başladı
          </div>
        )}
      </div>
    </PageTransition>
  );
}
