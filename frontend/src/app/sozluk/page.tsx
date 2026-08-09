'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import { api } from '@/lib/api';
import { Info, Book, RefreshCw, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';

type Word = {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
};

type Category = {
  id: number;
  name: string;
};

export default function Sozluk() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/words/categories');
        setCategories(response.data);
      } catch (err) {
        console.error("Kategoriler yüklenirken hata:", err);
      }
    };
    fetchCategories();

    // Check device type
    const checkDevice = () => {
      setIsMobile(/Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent));
    };
    checkDevice();
  }, []);

  // Fetch words when filters change
  const fetchWords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/words', {
        params: {
          page,
          limit: 20,
          category_id: selectedCategory || undefined,
          letter: selectedLetter || undefined,
          sort,
          shuffle: shuffle ? 'true' : 'false'
        }
      });
      setWords(response.data.data);
      setLastPage(response.data.lastPage);
      setTotal(response.data.total);
    } catch (err) {
      console.error("Kelimeler yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [selectedCategory, selectedLetter, sort, shuffle, page]);

  // Harf Filtresi Butonları (A-Z)
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const handleShuffle = () => {
    setShuffle(!shuffle);
    setSelectedCategory('');
    setSelectedLetter('');
    setPage(1);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans',sans-serif]">
        <style dangerouslySetInnerHTML={{ __html: `
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
          .word-card.flipped .word-inner { transform: rotateY(180deg); }
          .word-back::-webkit-scrollbar { width: 4px; }
          .word-back::-webkit-scrollbar-track { background: #D6EAF8; border-radius: 10px; }
          .word-back::-webkit-scrollbar-thumb { background: #4A90E2; border-radius: 10px; }
          .word-back::-webkit-scrollbar-thumb:hover { background: #357ABD; }
        `}} />

        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#154667] mb-4 text-center mt-8">Yazılımcı Sözlüğü</h1>

          {/* Bilgi Modalı Tetikleyici Buton */}
          <div className="text-center mb-8">
            <button
              type="button"
              className="text-gray-600 hover:text-[#002c49] text-lg md:text-xl transition-colors duration-200 inline-flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
              title="Yazılımcı Sözlüğü Hakkında Bilgi">
              Yazılımcı Sözlüğü Hakkında Bilgi
              <Info className="w-5 h-5 text-[#154667]" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Kategori Butonları */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <button
                onClick={() => { setSelectedCategory(''); setShuffle(false); setPage(1); }}
                className={`px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                  selectedCategory === '' && !shuffle
                    ? 'bg-[#154667] text-white border-[#002c49]'
                    : 'border-[#154667] text-[#154667] hover:bg-[#154667] hover:text-white hover:border-[#002c49]'
                }`}
              >
                Tümü
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id.toString()); setShuffle(false); setPage(1); }}
                  className={`px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                    selectedCategory === cat.id.toString() && !shuffle
                      ? 'bg-[#154667] text-white border-[#002c49]'
                      : 'border-[#154667] text-[#154667] hover:bg-[#154667] hover:text-white hover:border-[#002c49]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Harf Filtresi */}
            <div className="flex flex-wrap justify-center gap-1 mt-4">
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => { setSelectedLetter(letter); setShuffle(false); setPage(1); }}
                  className={`px-3 py-1 text-sm border rounded-md transition-colors duration-200 ${
                    selectedLetter === letter && !shuffle
                      ? 'bg-[#154667] text-white border-[#002c49]'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#154667]'
                  }`}
                >
                  {letter}
                </button>
              ))}
              <button
                onClick={() => { setSelectedLetter(''); setPage(1); }}
                className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded-md transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
              >
                Sıfırla
              </button>
            </div>

            {/* Sıralama ve Karıştırma Filtresi */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                onClick={() => { setSort('asc'); setShuffle(false); setPage(1); }}
                className={`px-4 py-2 border rounded-lg font-semibold text-sm transition-colors duration-200 ${
                  sort === 'asc' && !shuffle
                    ? 'bg-[#154667] text-white border-[#002c49]'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#154667]'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => { setSort('desc'); setShuffle(false); setPage(1); }}
                className={`px-4 py-2 border rounded-lg font-semibold text-sm transition-colors duration-200 ${
                  sort === 'desc' && !shuffle
                    ? 'bg-[#154667] text-white border-[#002c49]'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#154667]'
                }`}
              >
                Z-A
              </button>
              <button
                onClick={handleShuffle}
                className={`px-4 py-2 border rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-1 ${
                  shuffle
                    ? 'bg-[#154667] text-white border-[#002c49]'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#154667]'
                }`}
              >
                Karıştır 🎲
              </button>
            </div>

            {/* Bilgi Kutusu */}
            {!isMobile && (
              <div className="text-center mt-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg shadow-md max-w-xl mx-auto flex items-center gap-2 justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>İpucu:</strong> Eğer CTRL tuşuna basılı tutarak bir kelimeye tıklarsanız, 3 saniye içinde tahmin edebilirsiniz!</span>
                </div>
              </div>
            )}

            {/* Kelime Listesi ve Yükleniyor */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 text-[#154667] animate-spin" />
              </div>
            ) : words.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aradığınız kriterlere uygun kelime bulunamadı.
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap justify-center gap-5 mt-5">
                  {words.map((word) => (
                    <WordCard key={word.id} word={word} />
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 border rounded-md disabled:opacity-50 text-[#154667] border-[#154667] hover:bg-[#154667] hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-gray-700">
                      {page} / {lastPage}
                    </span>
                    <button
                      disabled={page === lastPage}
                      onClick={() => setPage(page + 1)}
                      className="p-2 border rounded-md disabled:opacity-50 text-[#154667] border-[#154667] hover:bg-[#154667] hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <FAQ
            title="Yazılımcı Sözlüğü SSS"
            subtitle="Yazılım terimleri, İngilizce/Türkçe karşılıkları ve öğrenim hakkında sorular"
            items={[
              { question: "Yazılımcı sözlüğü nedir?", answer: "Yazılım geliştirme süreçlerinde sık kullanılan teknik terimler, mimari kavramlar ve kısaltmaların anlaşılır Türkçe karşılıklarını sunan interaktif bir terimler kümesidir." },
              { question: "Terim kartları nasıl kullanılır?", answer: "Kartların üzerine tıklayarak anlamını görüntüleyebilir, CTRL tuşuna basılı tutarak tıklarsanız tahmin modunda 3 saniye süre kazanabilirsiniz." }
            ]}
          />

          {/* Other Tools Cross-Navigation */}
          <div className="mt-16">
            <OtherTools />
          </div>
        </div>

        {/* Bilgi Modalı */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                <h5 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-[#154667]" />
                  Nasıl Kullanılır?
                </h5>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
                  onClick={() => setIsModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              <div className="text-gray-700 space-y-3 mb-6">
                <p>Bu sözlük, yazılım dünyasında sıkça karşılaşılan terimlerin anlamlarını keşfetmenize yardımcı olur.</p>
                <h6 className="font-bold text-lg text-gray-800 mt-4">Filtreleme Seçenekleri</h6>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Kategori Butonları:</strong> Terimleri "Genel", "Frontend", "Backend" gibi kategorilere göre filtreleyebilirsiniz.</li>
                  <li><strong>Harf Filtresi:</strong> Belirli bir harfle başlayan terimleri görmek için harf butonlarını kullanın.</li>
                  <li><strong>Sıralama:</strong> "A-Z" veya "Z-A" butonlarıyla terimleri alfabetik olarak sıralayabilir, "Karıştır" ile rastgele bir sıralama elde edebilirsiniz.</li>
                </ul>
                <hr className="border-gray-200" />
                <h6 className="font-bold text-lg text-gray-800 mt-4">✨ Özel İpucu</h6>
                <p>Eğer bir kelimenin anlamını hemen görmek istemiyorsanız, <strong>CTRL tuşuna basılı tutarak</strong> kelimeye tıklayın. Anlam 3 saniye boyunca gizlenecek ve kendinizi test etme şansı bulacaksınız!</p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function WordCard({ word }: { word: Word }) {
  const [flipped, setFlipped] = useState(false);
  const [guessMode, setGuessMode] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      setGuessMode(true);
      setTimeout(() => {
        setGuessMode(false);
        setFlipped(prev => !prev);
      }, 3000);
    } else {
      setFlipped(prev => !prev);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`word-card w-[220px] h-[140px] md:w-[220px] md:h-[140px] sm:w-[160px] sm:h-[120px] max-[480px]:w-[140px] max-[480px]:h-[100px] perspective-1000 cursor-pointer shadow-lg rounded-xl overflow-hidden word-item ${
        flipped ? 'flipped' : ''
      }`}
    >
      <div className="word-inner w-full h-full relative transform-style-3d transition-transform duration-500 ease-in-out">
        {/* Ön Taraf */}
        <div className="word-front absolute inset-0 w-full h-full backface-hidden flex items-center justify-center rounded-xl shadow-md p-3 text-center bg-gray-50 text-[#154667] font-bold hover:bg-[#E3F2FD] transition-colors">
          <h5 className="text-lg md:text-xl font-bold">{word.title}</h5>
        </div>
        
        {/* Arka Taraf */}
        <div className="word-back absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center rounded-xl shadow-md p-4 text-center text-sm leading-relaxed overflow-y-auto bg-[#E3F2FD] text-gray-800 transform rotate-y-180">
          {guessMode ? (
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-xs text-gray-500">Tahmin et... (3s)</span>
            </div>
          ) : (
            <p className="word-description">{word.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
