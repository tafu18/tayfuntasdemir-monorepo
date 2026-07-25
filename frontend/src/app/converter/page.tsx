'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import { 
  Download, UploadCloud, Check, AlertCircle, 
  Sparkles, Loader2, Image as ImageIcon, Trash, RefreshCw, FileCheck
} from 'lucide-react';

export default function Converter() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ----------------------------------------------------
  // GÖRSEL FORMAT DÖNÜŞTÜRÜCÜ STATE & LOGIC
  // ----------------------------------------------------
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const clear = () => {
    setImageFile(null);
    setImagePreview('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const processImage = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      setLoadingText('Görsel dönüştürülüyor...');

      // HTML5 Canvas ile Format Çevirici
      const img = new Image();
      img.src = imagePreview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas yüklenemedi.');

      // JPEG formatına çevrilirken varsayılan olarak şeffaflık yerine beyaz arka plan kullanır
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Görseli canvas üzerine çiz
      ctx.drawImage(img, 0, 0);

      // Çıktıyı al
      let mimeType = 'image/png';
      if (targetFormat === 'jpeg') mimeType = 'image/jpeg';
      if (targetFormat === 'webp') mimeType = 'image/webp';

      const outputDataUrl = canvas.toDataURL(mimeType, 0.92);

      // İndirme işlemini tetikle
      const link = document.createElement('a');
      const originalName = imageFile?.name.substring(0, imageFile.name.lastIndexOf('.')) || 'gorsel';
      link.download = `${originalName}_donusturulmus.${targetFormat}`;
      link.href = outputDataUrl;
      link.click();

      setSuccessMessage(`Görsel başarıyla .${targetFormat.toUpperCase()} formatına dönüştürüldü ve indirildi!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Görsel işleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const faqItems = [
    {
      question: "Görsellerim güvende mi? Sunucuya yükleniyor mu?",
      answer: "Kesinlikle güvende. Tüm dönüştürme işlemleri %100 doğrudan tarayıcınız (client-side) üzerinde gerçekleşir. Dosyalarınız hiçbir sunucuya yüklenmez."
    },
    {
      question: "Hangi formatları birbirine dönüştürebilirim?",
      answer: "PNG, JPEG, WebP, GIF, SVG, BMP ve HEIC gibi görsel dosyalarını yükleyip anında PNG, JPEG veya WEBP formatına dönüştürebilirsiniz."
    }
  ];

  return (
    <PageTransition>
      <div className="conv-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{
          __html: `
          .conv-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99,102,241,0.08); color: #6366f1; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .conv-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .conv-header h1 span { background: linear-gradient(135deg, #6366f1, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .conv-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .conv-card { background: #09090b; border-color: #27272a; }
          .conv-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #0ea5e9); }
          .conv-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .conv-toolbar { background: #18181b; border-color: #27272a; }
          .conv-dots { display: flex; gap: 6px; }
          .conv-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .conv-dots span:nth-child(1) { background: #ef4444; }
          .conv-dots span:nth-child(2) { background: #f59e0b; }
          .conv-dots span:nth-child(3) { background: #22c55e; }
          .conv-clear-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.3rem 0.75rem; font-size: 0.72rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display:flex; align-items:center; gap:0.4rem; }
          .dark .conv-clear-btn { border-color: #27272a; color: #a1a1aa; }
          .conv-clear-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.04); }
          .conv-fmt-btn { border: 1px solid #e2e8f0; background: #ffffff; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; padding: 0.85rem 1rem; border-radius: 14px; color: #64748b; cursor: pointer; transition: all 0.2s ease; }
          .dark .conv-fmt-btn { border-color: #27272a; background: #18181b; color: #a1a1aa; }
          .conv-fmt-btn.active { border-color: #6366f1; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
          .conv-dropzone { border: 2px dashed #e2e8f0; border-radius: 20px; padding: 2.5rem 1.5rem; text-align: center; background: #f1f5f9; cursor: pointer; transition: all 0.2s ease; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; min-height: 240px; }
          .dark .conv-dropzone { border-color: #27272a; background: #18181b; }
          .conv-dropzone:hover { border-color: #6366f1; background: rgba(99,102,241,0.04); }
          .conv-dropzone input[type="file"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0; cursor: pointer; width: 100%; }
          .conv-btn { display: flex; align-items: center; justify-content: center; gap: 0.6rem; width: 100%; padding: 1.1rem; border-radius: 16px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem; border: none; cursor: pointer; transition: all 0.2s ease; color: #fff; background: linear-gradient(135deg, #6366f1, #0ea5e9); box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
          .conv-btn:hover:not(:disabled) { box-shadow: 0 8px 30px rgba(99,102,241,0.45); transform: translateY(-2px); }
          .conv-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        `}} />

        <div className="max-w-[860px] mx-auto w-full">

          {/* Header */}
          <header className="text-center mb-10 mt-4 conv-header">
            <div className="conv-badge">
              <Sparkles className="w-3.5 h-3.5" />
              %100 İstemci Taraflı Hızlı Dönüştürücü
            </div>
            <h1 className="text-slate-900 dark:text-white">Görsel <span>Dönüştürücü</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[540px] mx-auto">
              Görsellerinizi PNG, JPEG veya WEBP formatlarına saniyeler içinde dönüştürün.
            </p>
          </header>

          {/* Card Container */}
          <div className="conv-card">

            {/* Toolbar */}
            <div className="conv-toolbar">
              <div className="conv-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="flex items-center gap-2">
                {imagePreview && (
                  <button onClick={clear} className="conv-clear-btn">
                    <Trash className="w-3.5 h-3.5" /> Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* Success / Error Toast Banners */}
              {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Left Column: Upload Box */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Görsel Seçin</label>
                  <div className="conv-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={imagePreview} 
                          alt="Önizleme" 
                          className="max-h-[160px] rounded-xl object-contain shadow-md mb-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" 
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{imageFile?.name}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">Değiştirmek için tıklayın</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Resim Sürükleyin veya Seçin</span>
                        <span className="text-xs text-slate-400">PNG, JPEG, WebP, GIF, SVG</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Format Selector & Action */}
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Dönüştürülecek Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setTargetFormat(fmt)}
                          className={`conv-fmt-btn ${targetFormat === fmt ? 'active' : ''}`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                      Seçilen format: <strong className="text-indigo-600 dark:text-indigo-400 uppercase font-mono">.{targetFormat}</strong>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={processImage}
                    disabled={!imagePreview || loading}
                    className="conv-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{loadingText || 'Dönüştürülüyor...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Görseli Dönüştür ve İndir</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* SSS Section */}
          <div className="mt-16 border-t border-slate-200 dark:border-zinc-800 pt-12">
            <FAQ
              title="Sıkça Sorulan Sorular"
              subtitle="Görsel Dönüştürücü hakkında merak edilenler"
              items={faqItems}
            />
          </div>

          {/* Diğer Araçlar */}
          <div className="mt-16">
            <OtherTools />
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
