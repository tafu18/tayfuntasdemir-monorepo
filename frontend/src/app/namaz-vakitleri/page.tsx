'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { api } from '@/lib/api';
import { Moon, MapPin, Info, BookOpen, Clock, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NamazVakitleri() {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState('İstanbul');
  const [currentCity, setCurrentCity] = useState('İstanbul');
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [ayah, setAyah] = useState({ text: '', source: '' });
  const [hadith, setHadith] = useState({ text: '', source: '' });

  const ayahs = [
    {
      text: "Namazı kılın, zekâtı verin. Rükû edenlerle birlikte siz de rükû edin.",
      source: "Bakara Suresi, 43. Ayet"
    },
    {
      text: "Sabrederek ve namaz kılarak Allah’tan yardım dileyin. Şüphesiz namaz, Allah’a derinden saygı duyanlardan başkasına ağır gelir.",
      source: "Bakara Suresi, 45. Ayet"
    },
    {
      text: "Şüphesiz iman edip salih ameller işleyen, namazı dosdoğru kılan ve zekâtı verenlerin mükâfatları Rableri katındadır.",
      source: "Bakara Suresi, 277. Ayet"
    },
    {
      text: "Namaz, mü’minler üzerine vakitleri belirlenmiş bir farzdır.",
      source: "Nisâ Suresi, 103. Ayet"
    },
    {
      text: "Onlar, namazlarını dosdoğru kılan ve kendilerine rızık olarak verdiklerimizden Allah yolunda harcayan kimselerdir.",
      source: "Enfâl Suresi, 3. Ayet"
    },
    {
      text: "Gündüzün iki tarafında ve gecenin gündüze yakın vakitlerinde namaz kıl. Çünkü iyilikler kötülükleri (günahları) giderir.",
      source: "Hûd Suresi, 114. Ayet"
    },
    {
      text: "Beni anmak için namaz kıl.",
      source: "Tâhâ Suresi, 14. Ayet"
    },
    {
      text: "Ailene namazı emret; kendin de ona sabırla devam et.",
      source: "Tâhâ Suresi, 132. Ayet"
    },
    {
      text: "Gerçekten müminler kurtuluşa ermiştir; Onlar ki, namazlarında huşû içindedirler.",
      source: "Mü'minûn Suresi, 1-2. Ayetler"
    },
    {
      text: "Sana vahyedilen kitabı oku ve namazı kıl. Muhakkak ki namaz, hayâsızlıktan ve kötülükten alıkoyar.",
      source: "Ankebût Suresi, 45. Ayet"
    }
  ];

  const hadiths = [
    {
      text: "Namaz, dinin direğidir.",
      source: "Tirmizî, Îmân, 8"
    },
    {
      text: "Kıyamet gününde kulun ilk hesaba çekileceği şey namazdır.",
      source: "Tirmizî, Salât, 188"
    },
    {
      text: "Benim nasıl namaz kıldığımı görüyorsanız, siz de öyle namaz kılın.",
      source: "Buhârî, Ezan, 18"
    },
    {
      text: "Cennetin anahtarı namazdır.",
      source: "Tirmizî, Tahâret, 1"
    },
    {
      text: "Kişi ile şirk ve küfür arasında namazı terk etmek vardır.",
      source: "Müslim, Îmân, 134"
    },
    {
      text: "Münafıklara en ağır gelen namaz; yatsı ve sabah namazlarıdır.",
      source: "Buhârî, Mevâkît, 20"
    },
    {
      text: "Kim sabah namazını kılarsa, o Allah'ın himayesindedir.",
      source: "Müslim, Mesâcid, 262"
    },
    {
      text: "Yeryüzü bana mescit ve temizleyici kılındı. Öyleyse ümmetimden kim bir namaz vaktine erişirse, hemen namazını kılsın.",
      source: "Buhârî, Salât, 56"
    },
    {
      text: "Allah'ın en sevdiği amel, vaktinde kılınan namazdır.",
      source: "Buhârî, Mevâkîtü's-Salât, 5"
    },
    {
      text: "İkindi namazını kaçıran kimse, sanki ailesini ve malını yitirmiş gibidir.",
      source: "Buhârî, Mevâkît, 15"
    }
  ];

  useEffect(() => {
    const region = localStorage.getItem('selectedRegion') || 'İstanbul';
    const city = localStorage.getItem('selectedCity') || 'İstanbul';
    setCurrentRegion(region);
    setCurrentCity(city);
    setSelectedRegion(region);
    setSelectedCity(city);

    // Pick random quotes
    setAyah(ayahs[Math.floor(Math.random() * ayahs.length)]);
    setHadith(hadiths[Math.floor(Math.random() * hadiths.length)]);
  }, []);

  const openLocationModal = async () => {
    setLocationModalOpen(true);
    try {
      const res = await api.get('/prayer/regions');
      setRegions(res.data);
      if (currentRegion) {
        const found = res.data.find((r: any) => r.name === currentRegion || r === currentRegion);
        if (found) {
          fetchCities(found.id || found);
        }
      }
    } catch (e) {
      console.error('Bölgeler çekilemedi:', e);
    }
  };

  const fetchCities = async (regionId: string) => {
    try {
      const res = await api.get(`/prayer/cities?region_id=${encodeURIComponent(regionId)}`);
      setCities(res.data);
    } catch (e) {
      console.error('İlçeler çekilemedi:', e);
    }
  };

  const saveLocationSelection = () => {
    if (selectedRegion && selectedCity) {
      localStorage.setItem('selectedRegion', selectedRegion);
      localStorage.setItem('selectedCity', selectedCity);
      setCurrentRegion(selectedRegion);
      setCurrentCity(selectedCity);
      setLocationModalOpen(false);
      window.location.href = "https://vaktihuzur.com.tr/ezan-vakti";
    }
  };

  return (
    <PageTransition>
      <div 
        className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 bg-cover bg-center relative" 
        style={{ backgroundImage: "url('/bg-prayer.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="relative z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md text-zinc-800 dark:text-zinc-100 rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-4xl border border-zinc-200/50 dark:border-zinc-800 flex flex-col space-y-8">
          
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              🕌 Namaz Vakitleri
            </h1>
            <div className="flex items-center space-x-2">
              <button 
                onClick={openLocationModal} 
                className="bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-850 dark:text-zinc-200 font-bold py-2.5 px-4 rounded-xl shadow-sm transition duration-300 flex items-center gap-2 text-xs"
              >
                <MapPin className="h-4 w-4 text-zinc-500" />
                Şehir Seç
              </button>
              <button 
                onClick={() => setInfoModalOpen(true)} 
                className="bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-850 dark:text-zinc-200 font-bold p-2.5 rounded-xl shadow-sm transition duration-300 flex items-center justify-center"
              >
                <Info className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </div>

          <p className="text-zinc-650 dark:text-zinc-350 text-sm font-semibold tracking-wide">
            📍 {currentRegion} - {currentCity} için hazırlanan özel içerikler.
          </p>

          {/* Ayah & Hadith Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 shadow-inner border border-zinc-200/50 dark:border-zinc-800 space-y-4">
              <span className="text-xs uppercase font-extrabold text-brand-blue tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Günün Ayeti
              </span>
              <p className="text-base italic leading-relaxed text-zinc-800 dark:text-zinc-200 font-serif">
                "{ayah.text}"
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {ayah.source}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 shadow-inner border border-zinc-200/50 dark:border-zinc-800 space-y-4">
              <span className="text-xs uppercase font-extrabold text-amber-500 tracking-wider flex items-center gap-1.5">
                <Heart className="h-4 w-4" /> Günün Hadisi
              </span>
              <p className="text-base italic leading-relaxed text-zinc-800 dark:text-zinc-200 font-serif">
                "{hadith.text}"
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {hadith.source}
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">Ezan Vakitlerini Gör</h2>
            <p className="text-zinc-550 dark:text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
              Seçtiğiniz konuma ait güncel ezan vakitlerini ve geri sayımı görmek için lütfen vakit sayfasına ilerleyin.
            </p>
            
            <a 
              href="https://vaktihuzur.com.tr/ezan-vakti" 
              className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-extrabold py-4 px-8 rounded-full transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg text-sm"
            >
              <Clock className="h-4 w-4" /> Vakitleri Görüntüle
            </a>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 text-center">
            <a 
              href="https://vaktihuzur.com.tr/indir" 
              className="bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold py-3 px-6 rounded-2xl transition-colors inline-flex items-center gap-2 text-xs"
            >
              🚀 Mobil Uygulamayı İndir
            </a>
          </div>
        </div>

        {/* Location Select Modal */}
        <AnimatePresence>
          {locationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="flex items-center justify-between p-5 border-b border-zinc-150 dark:border-zinc-850">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white">Konum Ayarla</h2>
                  <button 
                    onClick={() => setLocationModalOpen(false)} 
                    className="text-zinc-400 hover:text-zinc-650 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase">İl Seçin</label>
                    <select 
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        const found = regions.find((r: any) => r.name === e.target.value || r === e.target.value);
                        if (found) {
                          fetchCities(found.id || found);
                        }
                      }}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 bg-zinc-55/30 dark:bg-zinc-950 dark:text-white focus:outline-none text-sm"
                    >
                      <option value="">İl Seçin</option>
                      {regions.map((reg) => (
                        <option key={reg.id || reg.name || reg} value={reg.name || reg}>{reg.name || reg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase">İlçe Seçin</label>
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 bg-zinc-55/30 dark:bg-zinc-950 dark:text-white focus:outline-none text-sm"
                    >
                      <option value="">İlçe Seçin</option>
                      {cities.map((ct) => (
                        <option key={ct.id || ct.name || ct} value={ct.name || ct}>{ct.name || ct}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={saveLocationSelection} 
                    className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-extrabold py-3.5 px-4 rounded-xl w-full text-sm transition-all"
                  >
                    Konumu Kaydet ve Git
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Info Modal */}
        <AnimatePresence>
          {infoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="flex items-center justify-between p-5 border-b border-zinc-150 dark:border-zinc-855">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white">Bilgi</h2>
                  <button 
                    onClick={() => setInfoModalOpen(false)} 
                    className="text-zinc-400 hover:text-zinc-650 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>Namaz vakitlerini anlık takip etmek için "Vakitleri Görüntüle" butonunu kullanabilirsiniz.</p>
                  <p>Konum seçiminiz tarayıcıya kaydedilir ve sonraki ziyaretlerinizde hatırlanır.</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
