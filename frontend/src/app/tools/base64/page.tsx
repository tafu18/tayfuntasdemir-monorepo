'use client';

import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Shield, Check, Copy, Trash, FileText, Download, AlertCircle, FileUp } from 'lucide-react';
import { motion } from 'framer-motion';
import OtherTools from '@/components/OtherTools';

export default function Base64Converter() {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [fileInputText, setFileInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fireToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const showError = (msg: string) => {
    setOutputText(msg);
    setIsError(true);
  };

  const encodeText = () => {
    if (!inputText) return;
    try {
      setOutputText(btoa(unescape(encodeURIComponent(inputText))));
      setIsError(false);
    } catch {
      showError('Hata: Metin kodlanamadı.');
    }
  };

  const decodeText = () => {
    if (!inputText) return;
    try {
      setOutputText(decodeURIComponent(escape(atob(inputText.trim()))));
      setIsError(false);
    } catch {
      showError('Hata: Geçersiz Base64 formatı.');
    }
  };

  const encodeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOutputText(e.target.result as string);
        setIsError(false);
        fireToast('Dosya Base64\'e dönüştürüldü!');
      }
    };
    reader.onerror = () => {
      showError('Hata: Dosya okunamadı.');
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input selection
  };

  const decodeFile = () => {
    if (!fileInputText.trim()) {
      showError('Hata: Lütfen indirilecek bir Base64 kodu girin!');
      return;
    }

    let b64Data = fileInputText.trim();
    let contentType = 'application/octet-stream';
    let extension = 'bin';
    let hasPrefix = false;

    if (b64Data.startsWith('data:')) {
      hasPrefix = true;
      const parts = b64Data.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        contentType = match[1];
        extension = contentType.split('/')[1] || 'bin';
        if (extension.includes('+')) extension = extension.split('+')[0];
        if (extension.includes(';')) extension = extension.split(';')[0];
      }
      b64Data = parts[1];
    }

    try {
      const byteCharacters = atob(b64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      if (!hasPrefix && !fileName.trim()) {
        let hex = '';
        for (let i = 0; i < Math.min(4, byteArray.length); i++) {
          hex += byteArray[i].toString(16).padStart(2, '0').toUpperCase();
        }

        if (hex.startsWith('89504E47')) { extension = 'png'; contentType = 'image/png'; }
        else if (hex.startsWith('FFD8FF')) { extension = 'jpg'; contentType = 'image/jpeg'; }
        else if (hex.startsWith('25504446')) { extension = 'pdf'; contentType = 'application/pdf'; }
        else if (hex.startsWith('504B0304')) { extension = 'zip'; contentType = 'application/zip'; }
        else if (hex.startsWith('47494638')) { extension = 'gif'; contentType = 'image/gif'; }
        else if (hex.startsWith('52617221')) { extension = 'rar'; contentType = 'application/vnd.rar'; }
        else if (hex.startsWith('1F8B08')) { extension = 'gz'; contentType = 'application/gzip'; }
      }

      const blob = new Blob([byteArray], { type: contentType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      let finalFileName = fileName.trim() !== ''
        ? fileName.trim()
        : `tayfuntasdemircomtr_decoded_${new Date().getTime()}.${extension}`;

      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      fireToast('Dosya başarıyla indirildi!');
      setOutputText('');
    } catch {
      showError('Hata: Geçersiz veya bozuk Base64 verisi girdiniz.');
    }
  };

  const copyOutput = () => {
    if (!outputText || isError) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    fireToast('Panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutputAsTxt = () => {
    if (!outputText || isError) return;
    try {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      let name = fileName.trim() ? fileName.trim().split('.')[0] : 'tayfuntasdemircomtr_base64_output_' + new Date().getTime();
      link.download = `${name}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      fireToast('Base64 kodu dosya olarak indirildi!');
    } catch {
      showError('Hata: Dosya oluşturulamadı.');
    }
  };

  const clear = () => {
    setInputText('');
    setFileInputText('');
    setFileName('');
    setOutputText('');
    setIsError(false);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400">
            Base64 Atölyesi
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            Base64 <span className="bg-gradient-to-r from-indigo-600 to-sky-655 bg-clip-text text-transparent">Atölyesi</span>
          </h1>
          <p className="mt-4 text-zinc-550 dark:text-zinc-400">
            Metinlerinizi ve dosyalarınızı Base64 formatına dönüştürün veya Base64 kodlarını çözün.
          </p>
        </header>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => { setTab('text'); clear(); }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              tab === 'text'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Metin Dönüştürücü
          </button>
          <button
            onClick={() => { setTab('file'); clear(); }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              tab === 'file'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Dosya / Base64 Çevirici
          </button>
        </div>

        {tab === 'text' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Giriş Metni</label>
                <button onClick={clear} className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1">
                  <Trash className="h-3.5 w-3.5" /> Temizle
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Dönüştürmek istediğiniz metni veya Base64 kodunu buraya yazın..."
                className="w-full h-80 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
              <div className="flex gap-4">
                <button
                  onClick={encodeText}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  Base64 Encode
                </button>
                <button
                  onClick={decodeText}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  Base64 Decode
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Sonuç</label>
                {outputText && !isError && (
                  <div className="flex gap-2">
                    <button onClick={copyOutput} className="text-xs text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 flex items-center gap-1">
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      Kopyala
                    </button>
                    <button onClick={downloadOutputAsTxt} className="text-xs text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" /> İndir (.txt)
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <textarea
                  readOnly
                  value={outputText}
                  placeholder="Sonuç burada görüntülenecektir..."
                  className={`w-full h-80 rounded-2xl border p-4 font-mono text-sm focus:outline-none dark:bg-zinc-900 ${
                    isError
                      ? 'border-red-200 bg-red-50/20 text-red-650 dark:border-red-900/50 dark:text-red-400'
                      : 'border-zinc-200 bg-zinc-50/30 text-zinc-900 dark:border-zinc-800 dark:text-white'
                  }`}
                />
                {isError && (
                  <div className="absolute top-4 right-4 text-red-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-indigo-500" /> Dosya → Base64
                </h3>
                <p className="text-xs text-zinc-500">Seçeceğiniz herhangi bir dosya (resim, PDF, zip vb.) tarayıcınızda Base64 koduna çevrilecektir.</p>
                <input
                  type="file"
                  onChange={encodeFile}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 dark:file:bg-indigo-950/30 dark:file:text-indigo-400"
                />
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" /> Base64 → Dosya
                </h3>
                <textarea
                  value={fileInputText}
                  onChange={(e) => setFileInputText(e.target.value)}
                  placeholder="Çözmek ve indirmek istediğiniz Base64 kodunu girin (data: Mime ön eki dahil veya hariç)..."
                  className="w-full h-32 rounded-xl border border-zinc-200 bg-white p-3 font-mono text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="İndirilecek dosyanın adı (ör: resim.png - boş kalırsa otomatik tahmin edilir)"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
                <button
                  onClick={decodeFile}
                  className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  Dosya Olarak Çöz & İndir
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Base64 Çıktısı / Hatalar</label>
                {outputText && !isError && (
                  <button onClick={copyOutput} className="text-xs text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 flex items-center gap-1">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Kopyala
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={outputText}
                placeholder="Dosyadan üretilen Base64 verisi burada görüntülenecektir..."
                className={`w-full h-96 rounded-2xl border p-4 font-mono text-xs focus:outline-none dark:bg-zinc-900 ${
                  isError
                    ? 'border-red-200 bg-red-50/20 text-red-650 dark:border-red-900/50 dark:text-red-400'
                    : 'border-zinc-200 bg-zinc-50/30 text-zinc-900 dark:border-zinc-800 dark:text-white'
                }`}
              />
            </div>
          </div>
        )}

        <OtherTools />

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
            <Check className="h-4 w-4" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
