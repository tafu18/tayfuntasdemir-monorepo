'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import { Lock, Unlock, Copy, Link as LinkIcon } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function UrlCodec() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCodec = (action: 'encode' | 'decode') => {
    setError('');
    setOutputText('');
    if (!inputText) return;

    try {
      if (action === 'encode') {
        setOutputText(encodeURIComponent(inputText));
      } else {
        setOutputText(decodeURIComponent(inputText));
      }
    } catch (e: any) {
      setError('Çözümleme Hatası: Geçersiz URL formatı veya düzgün kodlanmamış veri. (' + e.message + ')');
    }
  };

  const clearText = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  const copyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .url-card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 28px;
              overflow: hidden;
              box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06);
              position: relative;
          }
          .dark .url-card {
              background: #09090b;
              border-color: #27272a;
          }
          .url-card::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0;
              height: 3px;
              background: linear-gradient(90deg, #0ea5e9, #6366f1);
          }
          .url-toolbar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem 2rem;
              background: #f1f5f9;
              border-bottom: 1px solid #e2e8f0;
          }
          .dark .url-toolbar {
              background: #18181b;
              border-color: #27272a;
          }
          .url-dots {
              display: flex;
              gap: 6px;
          }
          .url-dots span {
              width: 10px; height: 10px;
              border-radius: 50%;
          }
          .url-dots span:nth-child(1) { background: #ef4444; }
          .url-dots span:nth-child(2) { background: #f59e0b; }
          .url-dots span:nth-child(3) { background: #22c55e; }
        `}} />

        <div className="max-w-[820px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold text-xs uppercase tracking-widest px-5 py-2 rounded-full mb-5">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Geliştirici Araçları</span>
            </div>
            <h1 className="font-['Outfit',sans-serif] text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              <span className="bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] text-transparent bg-clip-text">URL Encoder</span> & Decoder
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[520px] mx-auto">
              Linklerinizi ve özel karakterlerinizi standart URL yapısına dönüştürün veya çözün.
            </p>
          </div>

          {/* Main Card */}
          <div className="url-card">
            <div className="url-toolbar">
              <div className="url-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="text-xs font-semibold text-slate-500 select-none">URL Codec Utility</div>
            </div>

            <div className="p-8 space-y-6">
              {/* Giriş Metni */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Giriş Metni (Input String)</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={5} 
                  className="py-3 px-4 w-full border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white rounded-xl font-['JetBrains_Mono',monospace] text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none" 
                  placeholder="Kodlamak veya kodunu çözmek istediğiniz URL/Metni girin..."
                />
              </div>

              {/* Butonlar */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => handleCodec('encode')} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <Lock className="w-4 h-4" /> URL Encode (Kodla)
                </button>
                <button 
                  onClick={() => handleCodec('decode')} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <Unlock className="w-4 h-4" /> URL Decode (Çöz)
                </button>
                <button 
                  onClick={clearText} 
                  className="px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Temizle
                </button>
              </div>

              {/* Hata Alanı */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 rounded-xl text-xs font-['JetBrains_Mono',monospace]">
                  {error}
                </div>
              )}

              {/* Çıktı Metni */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Sonuç (Output Result)</label>
                  <button onClick={copyOutput} className="text-xs text-[#0ea5e9] hover:text-[#0284c7] font-semibold flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" /> {copied ? 'Kopyalandı!' : 'Sonucu Kopyala'}
                  </button>
                </div>
                <textarea 
                  value={outputText}
                  readOnly 
                  rows={5} 
                  className="py-3 px-4 w-full border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white rounded-xl font-['JetBrains_Mono',monospace] text-sm focus:outline-none" 
                  placeholder="Sonuç burada görüntülenecektir..."
                />
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <FAQ
              title="URL Encoder / Decoder SSS"
              subtitle="URL kodlama ve karakter dönüşümleri hakkında merak edilenler"
              items={[
                { question: "URL Encoder nedir ve neden kullanılır?", answer: "URL Encoder, internet adreslerinde kullanılması sakıncalı veya özel karakterleri (boşluk, Türkçe harfler, & işareti vb.) %XX biçimindeki geçerli karakterlere dönüştürür." },
                { question: "URL Decode işlemi ne yapar?", answer: "%20, %C3%A7 gibi kodlanmış URL karakterlerini normal okunabilir metne geri dönüştürür." }
              ]}
            />
          </div>

          <div className="mt-12">
            <OtherTools />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
