'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';

type MarketData = {
  Alış: string;
  Satış: string;
  Tür: string;
  Değişim: string;
};

type TruncgilResponse = {
  Update_Date: string;
  [key: string]: MarketData | string;
};

export default function Doviz() {
  const [data, setData] = useState<TruncgilResponse | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('https://finans.truncgil.com/today.json');
      const result = await response.json();
      setData(result);
      
      const now = new Date();
      setLastUpdate(now.toLocaleTimeString('tr-TR'));
      setError(false);
    } catch (err) {
      console.error("Veri akışı hatası:", err);
      setError(true);
      setLastUpdate("HATA!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // 60 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const currencies = [
    { key: 'USD', label: 'ABD Doları', unit: '$', icon: 'fa-dollar-sign', color: 'blue' },
    { key: 'EUR', label: 'Euro', unit: '€', icon: 'fa-euro-sign', color: 'emerald' },
    { key: 'GBP', label: 'İngiliz Sterlini', unit: '£', icon: 'fa-pound-sign', color: 'indigo' }
  ];

  const golds = [
    { key: 'gram-altin', label: 'Gram Altın', unit: 'GA', icon: 'fa-coins', color: 'amber', symbol: '₺' },
    { key: 'ceyrek-altin', label: 'Çeyrek Altın', unit: 'ÇA', icon: 'fa-ring', color: 'orange', symbol: '₺' },
    { key: 'tam-altin', label: 'Tam Altın', unit: 'TA', icon: 'fa-gem', color: 'yellow', symbol: '₺' },
    { key: 'ons', label: 'ONS Altın', unit: 'OZ', icon: 'fa-globe', color: 'blue', symbol: '$' }
  ];

  const getColorClasses = (colorName: string) => {
    const map: Record<string, { bg: string, text: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    };
    return map[colorName] || map.blue;
  };

  const renderMarketCard = (item: any, row: MarketData | undefined) => {
    if (!row || typeof row !== 'object') return null;

    const isUp = !row['Değişim'].includes('-');
    const colors = getColorClasses(item.color);

    return (
      <div key={item.key} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
        <div className="flex justify-between items-start mb-8">
          <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center ${colors.text} shadow-inner group-hover:scale-110 transition-transform`}>
            <i className={`fas ${item.icon} text-2xl`}></i>
          </div>
          <span className={`px-2.5 py-1 ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} text-[10px] font-black rounded-lg uppercase tracking-tighter`}>
            {isUp ? '▲' : '▼'} {row['Değişim']}
          </span>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1 leading-none">{item.label}</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-8 tracking-widest">{item.unit} / {item.symbol || 'TRY'}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-5 rounded-2xl border border-transparent group-hover:border-gray-100 transition-all">
            <span className="block text-[9px] font-black text-gray-400 mb-2 uppercase tracking-widest leading-none">Alış</span>
            <span className="text-lg font-black text-gray-800 leading-none">{row['Alış']} <small className="text-[10px] italic font-bold text-gray-400">{item.symbol || '₺'}</small></span>
          </div>
          <div className="bg-[#154667] p-5 rounded-2xl shadow-lg shadow-blue-900/10 transform group-hover:scale-[1.03] transition-all">
            <span className="block text-[9px] font-black text-white/50 mb-2 uppercase tracking-widest leading-none" style={{ color: 'white' }}>Satış</span>
            <span className="text-lg font-black text-white leading-none">{row['Satış']} <small className="text-white/60 text-[10px] italic font-bold">{item.symbol || '₺'}</small></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-12 md:py-20">
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-black text-[#154667] mb-2 tracking-tight">Piyasa Paneli</h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Hayırlı Günler, Bol Kazançlar</p>
            </div>
            
            <div className="flex items-center bg-white border border-gray-100 px-6 py-4 rounded-[2rem] shadow-sm self-start md:self-auto">
              <div className="flex items-center mr-6 border-r border-gray-100 pr-6">
                <span className="relative flex w-3 h-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest leading-none">Canlı</span>
              </div>
              <div className="text-left ml-2">
                <span className="block text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Son Güncelleme</span>
                <span className={`text-sm font-black leading-none ${error ? 'text-red-500' : 'text-[#154667]'}`}>{lastUpdate}</span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mb-16">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="w-2 h-8 bg-[#154667] rounded-full mr-3 shadow-sm"></span> Döviz Kurları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full py-12 text-center animate-pulse text-gray-400 font-medium">Veriler hazırlanıyor...</div>
              ) : (
                currencies.map(c => data && renderMarketCard(c, data[c.key] as MarketData))
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="w-2 h-8 bg-amber-500 rounded-full mr-3 shadow-sm shadow-amber-100"></span> Altın Grubu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center md:text-left">
              {loading ? (
                <div className="col-span-full py-12 text-center animate-pulse text-gray-400 font-medium">Fiyatlar güncelleniyor...</div>
              ) : (
                golds.map(g => data && renderMarketCard(g, data[g.key] as MarketData))
              )}
            </div>
          </div>

          <div className="mt-24 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
              <i className="fas fa-info-circle text-blue-400 mr-3"></i>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Veriler bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.</span>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
