'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import { Key, Copy, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRheWZ1biBUYcWfZGVtaXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc4NjkxMTAyMn0.SignatureHere";
const defaultSecret = "your-256-bit-secret";

export default function JwtDecoder() {
  const [token, setToken] = useState(defaultToken);
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [secret, setSecret] = useState(defaultSecret);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [statusHtml, setStatusHtml] = useState<React.ReactNode>(null);
  const [timestamps, setTimestamps] = useState<{key: string, val: number, dateStr: string}[]>([]);
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper functions
  const base64UrlEncode = (strOrUint8Array: string | Uint8Array) => {
    let base64 = "";
    if (typeof strOrUint8Array === 'string') {
      base64 = btoa(unescape(encodeURIComponent(strOrUint8Array)));
    } else {
      let binary = "";
      const bytes = new Uint8Array(strOrUint8Array);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const base64UrlDecode = (str: string) => {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) {
      s += '=';
    }
    return decodeURIComponent(atob(s).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  };

  const generateSignature = async (headerB64: string, payloadB64: string, sec: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(headerB64 + "." + payloadB64);
    const keyData = encoder.encode(sec);
    
    const key = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    
    const signature = await window.crypto.subtle.sign(
      "HMAC",
      key,
      data
    );
    
    return base64UrlEncode(new Uint8Array(signature));
  };

  const updateTimestampDetails = (payloadObj: any) => {
    if (!payloadObj) {
      setTimestamps([]);
      return;
    }

    const timestampClaims: Record<string, string> = {
      exp: 'Bitiş Süresi (Expiration Time / exp)',
      iat: 'Yayınlanma Süresi (Issued At / iat)',
      nbf: 'Başlangıç Süresi (Not Before / nbf)',
      auth_time: 'Kimlik Doğrulama Süresi (Auth Time / auth_time)'
    };

    const tsList: {key: string, val: number, dateStr: string}[] = [];
    for (const [key] of Object.entries(timestampClaims)) {
      if (payloadObj[key] !== undefined) {
        const val = Number(payloadObj[key]);
        if (!isNaN(val)) {
          const dateStr = new Date(val * 1000).toLocaleString('tr-TR');
          tsList.push({ key, val, dateStr });
        }
      }
    }
    setTimestamps(tsList);
  };

  const verifySignature = useCallback(async (headerB64: string, payloadB64: string, signatureB64: string, sec: string, payloadObj: any) => {
    try {
      const expectedSignature = await generateSignature(headerB64, payloadB64, sec);
      
      let isExpired = false;
      if (payloadObj && payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        if (expDate < new Date()) {
          isExpired = true;
        }
      }

      if (signatureB64 === expectedSignature) {
        if (isExpired) {
          setStatusHtml(<span className="text-amber-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> İmza OK, Süresi Geçmiş</span>);
        } else {
          setStatusHtml(<span className="text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> İmza Geçerli</span>);
        }
      } else {
        setStatusHtml(<span className="text-red-500 font-semibold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Geçersiz İmza</span>);
      }
    } catch (e) {
      setStatusHtml(<span className="text-red-500 font-semibold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Doğrulama Hatası</span>);
    }
  }, []);

  const decodeJwt = useCallback(async (tokenStr: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setErrorMsg('');

    const t = tokenStr.trim();
    if (!t) {
      setHeader('');
      setPayload('');
      setStatusHtml(null);
      setIsUpdating(false);
      return;
    }

    const parts = t.split('.');
    if (parts.length !== 3) {
      setErrorMsg('Geçersiz Token formatı. Bir JWT token 3 parçadan oluşmalıdır (Header.Payload.Signature).');
      setIsUpdating(false);
      return;
    }

    try {
      const headerDecoded = base64UrlDecode(parts[0]);
      const payloadDecoded = base64UrlDecode(parts[1]);

      const headerObj = JSON.parse(headerDecoded);
      const payloadObj = JSON.parse(payloadDecoded);

      setHeader(JSON.stringify(headerObj, null, 2));
      setPayload(JSON.stringify(payloadObj, null, 2));

      updateTimestampDetails(payloadObj);
      await verifySignature(parts[0], parts[1], parts[2], secret, payloadObj);

    } catch (e: any) {
      setErrorMsg('Çözümleme Hatası: ' + e.message);
      updateTimestampDetails(null);
    }
    setIsUpdating(false);
  }, [isUpdating, secret, verifySignature]);

  const encodeJwt = useCallback(async (h: string, p: string, s: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setErrorMsg('');

    if (!h.trim() || !p.trim()) {
      updateTimestampDetails(null);
      setIsUpdating(false);
      return;
    }

    try {
      const headerObj = JSON.parse(h);
      const payloadObj = JSON.parse(p);

      const headerB64 = base64UrlEncode(JSON.stringify(headerObj));
      const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));
      const signatureB64 = await generateSignature(headerB64, payloadB64, s);

      setToken(`${headerB64}.${payloadB64}.${signatureB64}`);
      
      updateTimestampDetails(payloadObj);

      let isExpired = false;
      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        if (expDate < new Date()) isExpired = true;
      }

      if (isExpired) {
        setStatusHtml(<span className="text-amber-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> İmza OK, Süresi Geçmiş</span>);
      } else {
        setStatusHtml(<span className="text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> İmza Geçerli</span>);
      }

    } catch (e: any) {
      setErrorMsg('Kodlama Hatası (Geçersiz JSON formatı): ' + e.message);
      updateTimestampDetails(null);
    }
    setIsUpdating(false);
  }, [isUpdating]);

  // Handle Token Input
  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setToken(val);
    if (!isUpdating) {
      decodeJwt(val);
    }
  };

  // Handle JSON Edit
  const handleHeaderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHeader(val);
    if (!isUpdating) encodeJwt(val, payload, secret);
  };

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPayload(val);
    if (!isUpdating) encodeJwt(header, val, secret);
  };

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSecret(val);
    if (!isUpdating) encodeJwt(header, payload, val);
  };

  useEffect(() => {
    // Initial decode
    decodeJwt(defaultToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    alert('Token kopyalandı!');
  };

  return (
    <PageTransition>
      <div className="jwt-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        
        <style dangerouslySetInnerHTML={{__html: `
          .jwt-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(139, 92, 246, 0.08); color: #8b5cf6; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .jwt-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .jwt-card { background: #09090b; border-color: #27272a; }
          .jwt-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #8b5cf6, #ec4899); }
          .jwt-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .jwt-toolbar { background: #18181b; border-color: #27272a; }
          
          .jwt-dots { display: flex; gap: 6px; }
          .jwt-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .jwt-dots span:nth-child(1) { background: #ef4444; }
          .jwt-dots span:nth-child(2) { background: #f59e0b; }
          .jwt-dots span:nth-child(3) { background: #22c55e; }
          
          .part-header { color: #ef4444; }
          .part-payload { color: #a855f7; }
          .part-signature { color: #0ea5e9; }
          
          .json-textarea { background-color: #fafafa; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; width: 100%; resize: vertical; }
          .dark .json-textarea { background: #18181b; border-color: #27272a; }
          .json-textarea:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }
          .dark .json-textarea:focus { box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2); }
        `}} />

        <div className="max-w-[950px] mx-auto w-full">
          
          <header className="text-center mb-12 mt-4">
            <div className="jwt-badge">
              <Key className="w-3.5 h-3.5" /> Geliştirici Araçları
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,5vw,3.2rem)] text-slate-900 dark:text-white mb-3 tracking-tight">
              <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">JWT Debugger</span> & Encoder
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[1.05rem] max-w-[520px] mx-auto">
              JSON Web Token (JWT) kodlarını çözün, düzenleyin ve secret key ile anında imzalı token üretin.
            </p>
          </header>

          <div className="jwt-card mb-12">
            <div className="jwt-toolbar">
              <div className="jwt-dots"><span></span><span></span><span></span></div>
              <div className="text-xs font-semibold text-slate-500 select-none">HMAC-SHA256 (HS256) Debugger</div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Encoded Token (JWT)</label>
                      <button onClick={copyToken} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 font-semibold flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Kopyala
                      </button>
                    </div>
                    <textarea 
                      rows={14} 
                      className="py-3 px-4 w-full flex-grow border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 rounded-xl font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none break-all" 
                      placeholder="JWT tokeninizi buraya yapıştırın veya sağ tarafı düzenleyerek üretin..."
                      value={token}
                      onChange={handleTokenChange}
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-mono">
                      {errorMsg}
                    </div>
                  )}

                  {!errorMsg && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span><strong>Algoritma:</strong> HS256</span>
                        <div className="font-bold">{statusHtml}</div>
                      </div>
                    </div>
                  )}

                  {timestamps.length > 0 && !errorMsg && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-xs space-y-1">
                      <div className="font-bold mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Zaman Damgası Detayları:</div>
                      <div className="space-y-1 font-mono">
                        {timestamps.map((ts, i) => (
                          <div key={i} className="flex flex-wrap justify-between items-center py-1 border-b border-purple-100/30 dark:border-purple-900/30 last:border-0">
                            <span className="font-bold text-purple-900 dark:text-purple-200">{ts.key}: {ts.val}</span>
                            <span className="text-purple-800 dark:text-purple-400 font-semibold">&rarr; {ts.dateStr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* HEADER */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold part-header flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span> Header: Algoritma & Tip
                      </span>
                    </div>
                    <textarea 
                      rows={4} 
                      className="json-textarea text-red-600 dark:text-red-400"
                      value={header}
                      onChange={handleHeaderChange}
                    />
                  </div>

                  {/* PAYLOAD */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold part-payload flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2"></span> Payload: Veri Kümesi (Claims)
                      </span>
                    </div>
                    <textarea 
                      rows={12} 
                      className="json-textarea text-purple-700 dark:text-purple-400"
                      value={payload}
                      onChange={handlePayloadChange}
                    />
                  </div>

                  {/* SIGNATURE */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold part-signature flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-2"></span> Signature: Gizli Anahtar (Secret Key)
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 w-24">HMAC256(</label>
                        <input 
                          type="text" 
                          className="flex-grow py-2 px-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                          value={secret}
                          onChange={handleSecretChange}
                        />
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">)</label>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

          <FAQ
            title="JWT Decoder SSS"
            subtitle="JSON Web Token yapısı, imza doğrulaması ve güvenlik soruları"
            items={[
              { question: "JWT (JSON Web Token) nedir?", answer: "JWT, taraflar arasında verileri güvenli bir biçimde JSON nesnesi olarak aktarmak için kullanılan açık bir standarttır (RFC 7519)." },
              { question: "JWT üç parçası nedir?", answer: "JWT nokta (.) ile ayrılmış üç bölümden oluşur: Header (Başlık), Payload (Taşınan Veri) ve Signature (İmza)." },
              { question: "Girdiğim JWT token'lar sunucunuza kaydediliyor mu?", answer: "Hayır, JWT ayrıştırma ve imza doğrulama işlemleri tamamen tarayıcınızda istemci tarafında gerçekleşir." }
            ]}
          />

          <OtherTools />

        </div>
      </div>
    </PageTransition>
  );
}
