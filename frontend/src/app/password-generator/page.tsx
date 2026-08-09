'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import { Info, ShieldAlert, Lock, X } from 'lucide-react';

export default function PasswordGenerator() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [history, setHistory] = useState<{ password: string, timestamp: number }[]>([]);

  const storageKey = 'passwordHistory';
  const expiryDuration = 10 * 60 * 1000; // 10 minutes

  // Load history on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        const freshHistory = JSON.parse(storedHistory).filter((item: any) => {
          return (Date.now() - item.timestamp) < expiryDuration;
        });
        setHistory(freshHistory);
        localStorage.setItem(storageKey, JSON.stringify(freshHistory));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToHistory = (password: string) => {
    if (history.some(item => item.password === password)) return;
    const newItem = {
      password: password,
      timestamp: Date.now()
    };
    
    const newHistory = [newItem, ...history];
    if (newHistory.length > 5) newHistory.pop();
    
    setHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  const copyPassword = (password: string, btnElement: HTMLButtonElement) => {
    navigator.clipboard.writeText(password).then(() => {
      const originalText = btnElement.textContent;
      btnElement.textContent = "Kopyalandı!";
      btnElement.disabled = true;
      saveToHistory(password);
      setTimeout(() => {
        btnElement.textContent = originalText;
        btnElement.disabled = false;
      }, 2000);
    }).catch(err => console.error('Kopyalama başarısız oldu: ', err));
  };

  const generatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      alert("En az bir karakter türü seçmelisiniz.");
      return;
    }

    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let allChars = "";
    if (includeUppercase) allChars += upperChars;
    if (includeLowercase) allChars += lowerChars;
    if (includeNumbers) allChars += numberChars;
    if (includeSymbols) allChars += symbolChars;

    let newPasswords = [];
    const count = 3; // Generate 3 passwords

    for (let p = 0; p < count; p++) {
      let newPassword = "";
      const randomArray = new Uint32Array(length);
      window.crypto.getRandomValues(randomArray);

      for (let i = 0; i < length; i++) {
        newPassword += allChars[randomArray[i] % allChars.length];
      }
      newPasswords.push(newPassword);
    }

    setGeneratedPasswords(newPasswords);
  };

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="container mx-auto px-4 py-12 md:py-20">
          
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-10">
              <div className="text-center">
                <div className="flex justify-center items-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#002c49]">Güvenli Şifre Oluşturucu</h2>
                  <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-[#154667] transition-colors" title="Daha fazla bilgi al">
                    <Info className="w-6 h-6" />
                  </button>
                </div>
                <p className="mt-2 text-gray-500">Modern ve güvenli şifreler anında hazır.</p>
              </div>

              <form onSubmit={generatePassword} className="mt-8">
                {/* Şifre Uzunluğu */}
                <div className="mb-6">
                  <label htmlFor="length" className="flex justify-between items-center text-gray-700 font-medium">
                    <span>Şifre Uzunluğu</span>
                    <span id="length-value" className="text-lg font-semibold text-[#154667]">{length}</span>
                  </label>
                  <input
                    type="range"
                    id="length"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3 form-range accent-[#154667]"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    min="8"
                    max="128"
                    required
                  />
                </div>

                {/* İçerik Seçenekleri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} className="form-checkbox h-5 w-5 rounded border-gray-300 text-[#154667] focus:ring-[#154667]/50" />
                    <span className="text-gray-600">Büyük Harf (A-Z)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} className="form-checkbox h-5 w-5 rounded border-gray-300 text-[#154667] focus:ring-[#154667]/50" />
                    <span className="text-gray-600">Küçük Harf (a-z)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="form-checkbox h-5 w-5 rounded border-gray-300 text-[#154667] focus:ring-[#154667]/50" />
                    <span className="text-gray-600">Rakam (0-9)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="form-checkbox h-5 w-5 rounded border-gray-300 text-[#154667] focus:ring-[#154667]/50" />
                    <span className="text-gray-600">Sembol (!@#$%)</span>
                  </label>
                </div>

                {/* Buton */}
                <button type="submit" className="w-full bg-[#154667] hover:bg-[#002c49] text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#154667]/50 text-lg flex justify-center items-center">
                  <ShieldAlert className="w-5 h-5 mr-2" /> Şifre Oluştur
                </button>
              </form>
            </div>
          </div>

          {/* Oluşturulan Şifre */}
          {generatedPasswords.length > 0 && (
            <div className="max-w-2xl mx-auto mt-10">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Oluşturulan Şifre</h3>
              <div className="space-y-3">
                {generatedPasswords.map((password, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center ring-1 ring-gray-200">
                    <span className="font-mono text-lg text-gray-800 break-all mr-4">{password}</span>
                    <button onClick={(e) => copyPassword(password, e.currentTarget as HTMLButtonElement)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-md transition-colors w-28 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">Kopyala</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Son Kopyalananlar */}
          {history.length > 0 && (
            <div className="max-w-2xl mx-auto mt-10 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Son Kopyalananlar</h3>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 flex justify-between items-center ring-1 ring-gray-200 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="font-mono text-lg text-gray-600 break-all mr-4">{item.password}</span>
                    <button onClick={(e) => copyPassword(item.password, e.currentTarget as HTMLButtonElement)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-md transition-colors w-28 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">Kopyala</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="mt-12 max-w-4xl mx-auto">
          <FAQ
            title="Güçlü Şifre Oluşturucu SSS"
            subtitle="Güvenli parolar ve şifre oluşturma hakkında merak edilenler"
            items={[
              { question: "Güçlü bir şifre nasıl olmalıdır?", answer: "En az 12-16 karakter uzunluğunda olmalı; büyük harf, küçük harf, rakam ve özel semboller (!@#$%) içermelidir." },
              { question: "Oluşturduğum şifreler sunucuya kaydediliyor mu?", answer: "Hayır, tüm şifre üretimi tamamen sizin bilgisayarınızın tarayıcısında (kriptografik crypto.getRandomValues) gerçekleşir. Sunucularımıza hiçbir şifre gitmez." },
              { question: "Şifrelerimi nerede saklamalıyım?", answer: "Şifrelerinizi bir kağıda yazmak yerine 1Password, Bitwarden veya Keepass gibi güvenilir şifre yöneticilerinde saklamanız önerilir." }
            ]}
          />

          <OtherTools />
        </div>

        {/* Bilgi Modalı */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-full mx-auto flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#002c49] flex items-center"><ShieldAlert className="w-5 h-5 mr-2" /> Araç Hakkında</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 text-gray-600 space-y-4 overflow-y-auto">
                <p>Bu araç, çevrimiçi hesaplarınızı güvende tutmak için tahmin edilmesi zor, rastgele ve güçlü şifreler oluşturur.</p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Özellikler</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Ayarlanabilir Uzunluk:</strong> 8 ila 128 karakter arasında istediğiniz uzunlukta şifreler oluşturun.</li>
                    <li><strong>Karakter Seçenekleri:</strong> Güvenliği artırmak için büyük/küçük harf, rakam ve sembolleri şifrenize dahil edip etmeyeceğinizi seçin.</li>
                    <li><strong>Geçici Hafıza:</strong> Kopyaladığınız son 5 şifre, kolay erişim için 10 dakika boyunca tarayıcınızda saklanır. Sayfayı yenileseniz bile kaybolmaz.</li>
                  </ul>
                </div>
                <div className="mt-4 bg-sky-50 text-sky-800 p-4 rounded-lg border border-sky-200 flex items-start gap-2">
                  <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p><strong>Gizlilik Garantisi:</strong> Oluşturduğunuz veya kopyaladığınız hiçbir şifre sunucularımıza gönderilmez veya kaydedilmez. Tüm işlemler tamamen sizin bilgisayarınızda gerçekleşir.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-b-xl text-right border-t border-gray-200">
                <button onClick={() => setIsModalOpen(false)} className="bg-[#154667] hover:bg-[#002c49] text-white font-semibold py-2 px-5 rounded-md transition-colors">
                  Anladım
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </PageTransition>
);
}
