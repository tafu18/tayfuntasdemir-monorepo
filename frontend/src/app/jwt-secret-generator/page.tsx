'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Code2, 
  FileText, 
  Sliders, 
  Zap, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Clock
} from 'lucide-react';
import Link from 'next/link';

type OutputFormat = 'hex' | 'base64' | 'base64url' | 'alphanumeric' | 'symbols';

export default function JwtSecretGenerator() {
  // Generator options
  const [bitLength, setBitLength] = useState<number>(256);
  const [customBytes, setCustomBytes] = useState<number>(32);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [format, setFormat] = useState<OutputFormat>('base64url');
  const [showSecret, setShowSecret] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedEnv, setCopiedEnv] = useState<string | null>(null);

  // Generated secret
  const [generatedSecret, setGeneratedSecret] = useState<string>('');
  
  // Batch generated secrets
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchSecrets, setBatchSecrets] = useState<string[]>([]);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);

  // JWT Token Signer State
  const [signerAlg, setSignerAlg] = useState<'HS256' | 'HS384' | 'HS512'>('HS256');
  const [headerJson, setHeaderJson] = useState<string>('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [payloadJson, setPayloadJson] = useState<string>(
    '{\n  "sub": "user_12345",\n  "name": "Tayfun Taşdemir",\n  "role": "admin",\n  "iat": ' +
      Math.floor(Date.now() / 1000) +
      ',\n  "exp": ' +
      (Math.floor(Date.now() / 1000) + 86400 * 7) +
      '\n}'
  );
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [signerError, setSignerError] = useState<string>('');

  // Core Crypto Generator
  const generateRandomBytes = useCallback((bytesLength: number): Uint8Array => {
    const array = new Uint8Array(bytesLength);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback
      for (let i = 0; i < bytesLength; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }, []);

  const formatBytes = useCallback((bytes: Uint8Array, fmt: OutputFormat): string => {
    if (fmt === 'hex') {
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    if (fmt === 'base64') {
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    if (fmt === 'base64url') {
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary)
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    }

    if (fmt === 'alphanumeric') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < bytes.length; i++) {
        result += chars.charAt(bytes[i] % chars.length);
      }
      return result;
    }

    if (fmt === 'symbols') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let result = '';
      for (let i = 0; i < bytes.length; i++) {
        result += chars.charAt(bytes[i] % chars.length);
      }
      return result;
    }

    return '';
  }, []);

  const generateNewSecret = useCallback(() => {
    const bytesCount = isCustom ? customBytes : bitLength / 8;
    const bytes = generateRandomBytes(bytesCount);
    const secret = formatBytes(bytes, format);
    setGeneratedSecret(secret);

    // Batch generate
    const batchList: string[] = [];
    for (let i = 0; i < batchCount; i++) {
      const b = generateRandomBytes(bytesCount);
      batchList.push(formatBytes(b, format));
    }
    setBatchSecrets(batchList);
  }, [bitLength, customBytes, isCustom, format, batchCount, generateRandomBytes, formatBytes]);

  useEffect(() => {
    generateNewSecret();
  }, [generateNewSecret]);

  // Client-Side Base64URL Encoding helper for JWT
  const base64UrlEncode = (strOrUint8Array: string | Uint8Array) => {
    let base64 = '';
    if (typeof strOrUint8Array === 'string') {
      base64 = btoa(unescape(encodeURIComponent(strOrUint8Array)));
    } else {
      let binary = '';
      const bytes = new Uint8Array(strOrUint8Array);
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  // Sign JWT Client-Side with SubtleCrypto
  const signJwtToken = useCallback(async () => {
    setSignerError('');
    if (!generatedSecret) {
      setGeneratedToken('');
      return;
    }

    try {
      const parsedHeader = JSON.parse(headerJson);
      parsedHeader.alg = signerAlg;
      const parsedPayload = JSON.parse(payloadJson);

      const headerB64 = base64UrlEncode(JSON.stringify(parsedHeader));
      const payloadB64 = base64UrlEncode(JSON.stringify(parsedPayload));
      const dataToSign = `${headerB64}.${payloadB64}`;

      const encoder = new TextEncoder();
      const keyData = encoder.encode(generatedSecret);
      const data = encoder.encode(dataToSign);

      let hashName = 'SHA-256';
      if (signerAlg === 'HS384') hashName = 'SHA-384';
      if (signerAlg === 'HS512') hashName = 'SHA-512';

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: hashName } },
        false,
        ['sign']
      );

      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, data);
      const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));

      const fullToken = `${dataToSign}.${signatureB64}`;
      setGeneratedToken(fullToken);
    } catch (err: any) {
      setSignerError('JSON biçimlendirme veya imzalama hatası: ' + (err.message || 'Geçersiz JSON'));
      setGeneratedToken('');
    }
  }, [generatedSecret, headerJson, payloadJson, signerAlg]);

  useEffect(() => {
    signJwtToken();
  }, [signJwtToken]);

  // Adjust Expiration Time Helper
  const setExpirationPreset = (secondsFromNow: number) => {
    try {
      const parsed = JSON.parse(payloadJson);
      const nowSec = Math.floor(Date.now() / 1000);
      parsed.iat = nowSec;
      parsed.exp = nowSec + secondsFromNow;
      setPayloadJson(JSON.stringify(parsed, null, 2));
    } catch {
      // Ignored if invalid JSON
    }
  };

  const handleCopy = (text: string, type: 'secret' | 'env' | 'batch' | 'token', envName?: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (type === 'env') {
      setCopiedEnv(envName || '');
      setTimeout(() => setCopiedEnv(null), 2000);
    } else if (type === 'batch') {
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2000);
    } else if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const activeBytes = isCustom ? customBytes : bitLength / 8;
  const activeBits = activeBytes * 8;

  const faqItems = [
    {
      question: 'JWT Secret Key nedir ve neden güçlü olması gerekir?',
      answer: 'JWT Secret Key, HMAC algoritmaları (HS256, HS384, HS512) ile oluşturulan JSON Web Token’ların imzasını doğrulamak için kullanılan gizli anahtardır. Zayıf veya tahmin edilebilir bir anahtar kullanılırsa, saldırganlar token imzasını kırıp istedikleri yetkide sahte token üretebilirler. Bu araç, kriptografik olarak kırılamaz (CSPRNG) rastgele anahtarlar üretir.'
    },
    {
      question: 'Bu araçta ürettiğim anahtarlar ve token’lar sunucuya gönderiliyor mu?',
      answer: 'HAYIR. Bu araç %100 İstemci Taraflı (Client-Side) çalışır. Tüm rastgele anahtar üretimi ve token imzalama işlemleri tarayıcınızın yerel Web Cryptography API (crypto.getRandomValues ve crypto.subtle) motoru üzerinde gerçekleşir. Sunucumuza tek bir bayt dahi veri gönderilmez, kaydedilmez veya loglanmaz. Dilerseniz internet bağlantınızı keserek de bu aracı tamamen çevrimdışı (offline) kullanabilirsiniz.'
    },
    {
      question: 'HS256, HS384 ve HS512 arasındaki fark nedir?',
      answer: 'HS256 (HMAC-SHA256) en az 256-bit (32 bayt), HS384 en az 384-bit (48 bayt), HS512 ise en az 512-bit (64 bayt) anahtar uzunluğu gerektirir. Günümüz web standartlarında HS256 çoğu proje için yeterli ve çok hızlıdır; ancak askeri düzeyde ve geleceğe dönük yüksek güvenlik gerektiren sistemlerde HS512 tercih edilir.'
    },
    {
      question: 'Ürettiğim secret anahtarını projeme nasıl eklerim?',
      answer: 'Ürettiğiniz anahtarı projenizin .env dosyasında JWT_SECRET="anahtarınız" olarak saklayın. Asla Git gibi kaynak kod depolarına (GitHub, GitLab) doğrudan şifrenizi açık metin olarak push etmeyin.'
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold text-xs border border-brand-blue/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kriptografik Güvenli Web Crypto API</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            JWT Secret & Token Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            HS256, HS384 ve HS512 algoritmaları için kırılamaz güvenlikte JWT Secret Key üretin ve anında test token’ları oluşturun.
          </p>
        </div>

        {/* 100% Client-Side Privacy Guarantee Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
            <span className="font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              %100 İstemci Taraflı (Client-Side) ve Sıfır Sunucu Kaydı
            </span>
            Bu araçta üretilen hiçbir anahtar, şifre veya JWT token <strong className="font-semibold text-emerald-900 dark:text-emerald-100">asla sunucuya iletilmez, loglanmaz veya kaydedilmez</strong>. Tüm kriptografik işlemler tarayıcınızın yerel motorunda (<code className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 rounded font-mono text-xs">window.crypto</code>) çevrimdışı olarak gerçekleştirilir.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Secret Generator Card */}
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6">
              
              {/* Option Selectors: Bit Length & Formats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                
                {/* Bit / Algorithm Choice */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-brand-blue" />
                    Algoritma & Anahtar Boyutu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setBitLength(256); setIsCustom(false); setSignerAlg('HS256'); }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        !isCustom && bitLength === 256
                          ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                          : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                      }`}
                    >
                      <div>256-bit</div>
                      <div className="text-[10px] font-normal opacity-80">HS256 (32 Bayt)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setBitLength(384); setIsCustom(false); setSignerAlg('HS384'); }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        !isCustom && bitLength === 384
                          ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                          : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                      }`}
                    >
                      <div>384-bit</div>
                      <div className="text-[10px] font-normal opacity-80">HS384 (48 Bayt)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setBitLength(512); setIsCustom(false); setSignerAlg('HS512'); }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        !isCustom && bitLength === 512
                          ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                          : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                      }`}
                    >
                      <div>512-bit</div>
                      <div className="text-[10px] font-normal opacity-80">HS512 (64 Bayt)</div>
                    </button>
                  </div>

                  {/* Custom Length Option */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsCustom(!isCustom)}
                      className="text-xs font-medium text-brand-blue hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {isCustom ? 'Standart Boyutlara Dön' : 'Özel Uzunluk Seç (Slider)'}
                    </button>
                    {isCustom && (
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-300">
                        {customBytes} Bayt ({customBytes * 8} Bit)
                      </span>
                    )}
                  </div>
                  {isCustom && (
                    <input
                      type="range"
                      min={16}
                      max={128}
                      step={4}
                      value={customBytes}
                      onChange={(e) => setCustomBytes(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                  )}
                </div>

                {/* Output Encoding Format */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    Çıktı Formatı & Kodlama
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'base64url', label: 'Base64URL', desc: 'URL Safe / Önerilen' },
                      { id: 'base64', label: 'Base64', desc: 'Standart Base64' },
                      { id: 'hex', label: 'Hex (Onaltılık)', desc: '0-9, a-f' },
                      { id: 'alphanumeric', label: 'Alfanümerik', desc: 'Harf & Rakam' },
                      { id: 'symbols', label: 'Özel Karakterli', desc: 'A-Z, a-z, 0-9, !@#' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setFormat(fmt.id as OutputFormat)}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                          format === fmt.id
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{fmt.label}</div>
                        <div className="text-[10px] opacity-80">{fmt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Generated Secret Output Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-brand-blue" />
                    Üretilen JWT Secret Key
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Entropi: {activeBits} Bit (Çok Güçlü / Kırılamaz)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                      title={showSecret ? 'Gizle' : 'Göster'}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full p-4 pr-32 font-mono text-sm sm:text-base break-all bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 shadow-inner select-all min-h-[64px] flex items-center">
                    {showSecret ? generatedSecret : '•'.repeat(generatedSecret.length || 32)}
                  </div>
                  
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={generateNewSecret}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
                      title="Yeni Anahtar Üret"
                    >
                      <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedSecret, 'secret')}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ready-to-Use Config Snippets */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Tek Tıkla Projenize Ekleyin (.env & Kod Şablonları)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { label: '.env Dosyası', val: `JWT_SECRET="${generatedSecret}"`, key: 'env' },
                    { label: 'NestJS / Express', val: `JWT_SECRET: '${generatedSecret}',`, key: 'node' },
                    { label: 'Django / Python', val: `JWT_SECRET = "${generatedSecret}"`, key: 'python' },
                    { label: 'Laravel / PHP', val: `JWT_SECRET=${generatedSecret}`, key: 'php' },
                    { label: 'Go (Golang)', val: `var jwtSecret = []byte("${generatedSecret}")`, key: 'go' },
                    { label: 'Spring Boot (Java)', val: `jwt.secret=${generatedSecret}`, key: 'java' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">{item.label}</p>
                        <p className="text-xs font-mono text-slate-900 dark:text-zinc-200 truncate mt-0.5">{item.val}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.val, 'env', item.key)}
                        className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-brand-blue transition-colors cursor-pointer shrink-0"
                        title="Kopyala"
                      >
                        {copiedEnv === item.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Secret Generation */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <details className="group">
                  <summary className="text-xs font-bold text-brand-blue cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      Çoklu Anahtar Üret (Batch Generator - 5x, 10x, 20x)
                    </span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>

                  <div className="mt-4 space-y-3 p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-bold">Adet:</span>
                        {[5, 10, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setBatchCount(num)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                              batchCount === num
                                ? 'bg-brand-blue text-white'
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(batchSecrets.join('\n'), 'batch')}
                        className="px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {copiedBatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBatch ? 'Tümü Kopyalandı' : 'Tümünü Kopyala'}</span>
                      </button>
                    </div>

                    <div className="font-mono text-xs text-slate-700 dark:text-zinc-300 space-y-1.5 max-h-40 overflow-y-auto pr-2">
                      {batchSecrets.map((s, idx) => (
                        <div key={idx} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 break-all select-all">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>

            </div>

            {/* Live JWT Token Signer & Playground */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Canlı JWT Token Üretici & İmzala (Client-Side Signer)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Üretilen bu secret ile tarayıcınızda hemen geçerli bir JWT Token oluşturup test edin.
                  </p>
                </div>
                <Link
                  href="/jwt"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline cursor-pointer shrink-0"
                >
                  <span>JWT Decoder’a Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {signerError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl">
                  {signerError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Header JSON */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      HEADER (Başlık)
                    </label>
                    <span className="text-[10px] text-red-500 font-bold uppercase">Algorithm: {signerAlg}</span>
                  </div>
                  <textarea
                    rows={4}
                    value={headerJson}
                    onChange={(e) => setHeaderJson(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                {/* Payload JSON */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      PAYLOAD (Veri / Claims)
                    </label>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">Süre Ekle:</span>
                      <button
                        type="button"
                        onClick={() => setExpirationPreset(3600)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-brand-blue hover:text-white transition-colors cursor-pointer"
                      >
                        +1 Saat
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpirationPreset(86400 * 7)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-brand-blue hover:text-white transition-colors cursor-pointer"
                      >
                        +7 Gün
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpirationPreset(86400 * 30)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-brand-blue hover:text-white transition-colors cursor-pointer"
                      >
                        +30 Gün
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={payloadJson}
                    onChange={(e) => setPayloadJson(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              {/* Generated Signed Token Result */}
              {generatedToken && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Oluşturulan İmzalı JWT Token
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedToken, 'token')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        copiedToken ? 'bg-emerald-600 text-white' : 'bg-brand-blue text-white shadow-sm'
                      }`}
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Kopyalandı' : 'Token’ı Kopyala'}</span>
                    </button>
                  </div>
                  <div className="p-3.5 font-mono text-xs break-all bg-slate-950 text-white rounded-xl border border-slate-800 select-all leading-relaxed">
                    {(() => {
                      const parts = generatedToken.split('.');
                      if (parts.length === 3) {
                        return (
                          <>
                            <span className="text-red-400">{parts[0]}</span>
                            <span className="text-zinc-500">.</span>
                            <span className="text-purple-400">{parts[1]}</span>
                            <span className="text-zinc-500">.</span>
                            <span className="text-cyan-400">{parts[2]}</span>
                          </>
                        );
                      }
                      return generatedToken;
                    })()}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400"></span> Header
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400 ml-2"></span> Payload
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2"></span> Signature (HMAC)
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <FAQ items={faqItems} />
        </div>

        {/* Other Tools Navigation */}
        <OtherTools />

      </div>
    </PageTransition>
  );
}
