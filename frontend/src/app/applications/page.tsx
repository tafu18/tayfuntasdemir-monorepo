'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Book, DollarSign, Wallet, Search, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export default function Applications() {
  const [activeTab, setActiveTab] = useState<'prayer' | 'dictionary' | 'currency' | 'loans'>('prayer');

  // --- 1. Prayer Times State ---
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [liveTimes, setLiveTimes] = useState<any>(null);
  const [prayerError, setPrayerError] = useState('');

  // --- 2. Dictionary State ---
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [words, setWords] = useState<any[]>([]);
  const [searchWord, setSearchWord] = useState('');
  const [letterFilter, setLetterFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // --- 3. Currency State ---
  const [rates, setRates] = useState<any>(null);
  const [currencyLoading, setCurrencyLoading] = useState(false);

  // --- 4. Loans State ---
  const [loanPassword, setLoanPassword] = useState('');
  const [isLoanAuthed, setIsLoanAuthed] = useState(false);
  const [loanAuthError, setLoanAuthError] = useState('');
  const [loanData, setLoanData] = useState<any>(null);
  const [editingPaymentKey, setEditingPaymentKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ salary: 0, gram_price: 0, paid_tl: 0, paid_gram: 0 });

  // Load Initial Data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['prayer', 'dictionary', 'currency', 'loans'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }

    // Load Regions
    api.get('/prayer/regions')
      .then(res => {
        setRegions(res.data);
        if (res.data.length > 0) {
          // Set default to Istanbul region if available
          const defaultReg = res.data.find((r: any) => r.name === 'İstanbul' || r.id === 'istanbul') || res.data[0];
          setSelectedRegion(defaultReg.id);
        }
      })
      .catch(err => console.error(err));

    // Load Word Categories
    api.get('/words/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    // Load Words
    loadWords();
  }, []);

  // Fetch Cities when Region changes
  useEffect(() => {
    if (!selectedRegion) return;
    api.get(`/prayer/cities?region_id=${selectedRegion}`)
      .then(res => {
        setCities(res.data);
        if (res.data.length > 0) {
          setSelectedCity(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, [selectedRegion]);

  // Fetch Prayer Times when City changes
  useEffect(() => {
    if (!selectedCity) return;
    const cityObj = cities.find(c => c.id === selectedCity);
    const regionObj = regions.find(r => r.id === selectedRegion);
    if (!cityObj || !regionObj) return;

    api.get(`/prayer/live?region=${encodeURIComponent(regionObj.name)}&city=${encodeURIComponent(cityObj.name)}`)
      .then(res => {
        if (res.data.error) {
          setPrayerError(res.data.error);
          setLiveTimes(null);
        } else {
          setLiveTimes(res.data);
          setPrayerError('');
        }
      })
      .catch(err => {
        console.error(err);
        setPrayerError('Namaz vakitleri alınamadı.');
      });
  }, [selectedCity, cities, regions, selectedRegion]);

  // Load Words Helper
  const loadWords = (catId?: string, query?: string, sort = sortOrder, letter = letterFilter) => {
    let url = `/words?sort=${sort}`;
    if (catId && catId !== 'Tümü') {
      url += `&category_id=${catId}`;
    }
    if (letter) {
      url += `&letter=${letter}`;
    }
    api.get(url)
      .then(res => {
        let items = res.data?.data || [];
        if (query) {
          items = items.filter((w: any) => w.title.toLowerCase().includes(query.toLowerCase()));
        }
        setWords(items);
      })
      .catch(err => console.error(err));
  };

  // Trigger load words when filter changes
  useEffect(() => {
    loadWords(selectedCategory, searchWord, sortOrder, letterFilter);
  }, [selectedCategory, searchWord, sortOrder, letterFilter]);

  // Fetch Currency Rates
  const fetchCurrencies = () => {
    setCurrencyLoading(true);
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          const tryRate = data.rates.TRY;
          const eurRate = data.rates.EUR;
          setRates({
            USD: tryRate,
            EUR: tryRate / eurRate,
            updated: new Date().toLocaleTimeString('tr-TR'),
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setCurrencyLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'currency' && !rates) {
      fetchCurrencies();
    }
  }, [activeTab]);

  // Loan Auth Submit
  const handleLoanAuth = async () => {
    setLoanAuthError('');
    try {
      const res = await api.post('/loans/auth', { password: loanPassword });
      if (res.data?.status === 'success') {
        setIsLoanAuthed(true);
        loadLoanData();
      } else {
        setLoanAuthError('Hatalı şifre, tekrar deneyin.');
      }
    } catch {
      setLoanAuthError('Doğrulama hatası oluştu.');
    }
  };

  const loadLoanData = () => {
    api.get('/loans/panel')
      .then(res => setLoanData(res.data))
      .catch(err => console.error(err));
  };

  // Start Edit Monthly Payment
  const startEditPayment = (payment: any, monthYear: string) => {
    setEditingPaymentKey(monthYear);
    if (payment) {
      setEditForm({
        salary: Number(payment.salary),
        gram_price: Number(payment.gram_price),
        paid_tl: Number(payment.paid_tl),
        paid_gram: Number(payment.paid_gram),
      });
    } else {
      setEditForm({ salary: 0, gram_price: 0, paid_tl: 0, paid_gram: 0 });
    }
  };

  // Save Monthly Payment
  const savePayment = async (monthYear: string) => {
    try {
      const res = await api.post('/loans/save', {
        month_year: monthYear,
        ...editForm,
      });
      if (res.data?.status === 'success') {
        setEditingPaymentKey(null);
        loadLoanData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-250 dark:border-zinc-800 space-x-8 mb-12 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'prayer'
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Namaz Vakitleri</span>
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'dictionary'
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Book className="h-4 w-4" />
            <span>Sözlük / Filtre</span>
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'currency'
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Döviz Kurları</span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'loans'
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Borç Takip Paneli</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'prayer' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Location Selectors */}
              <div className="lg:col-span-1 space-y-6">
                <h2 className="text-xl font-bold">Bölge & İlçe Seçimi</h2>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1.5">Şehir</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                  >
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id}>{reg.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1.5">İlçe</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                  >
                    {cities.map((cit) => (
                      <option key={cit.id} value={cit.id}>{cit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prayer Times Result */}
              <div className="lg:col-span-2 space-y-8">
                {prayerError && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-sm font-medium">
                    {prayerError}
                  </div>
                )}
                {liveTimes ? (
                  <div className="space-y-6">
                    {/* Timer & Next Prayer */}
                    <div className="rounded-2xl bg-zinc-900 text-white dark:bg-zinc-900 p-8 shadow-sm flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Sıradaki Vakit</span>
                        <h3 className="text-3xl font-extrabold mt-1">{liveTimes.next_prayer_name}</h3>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Kalan Süre</span>
                        <span className="text-4xl font-mono font-bold mt-1 block tracking-wider">{liveTimes.remaining_time}</span>
                      </div>
                    </div>

                    {/* All Times List */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {Object.entries(liveTimes.all_times || {}).map(([name, time]: any) => (
                        <div key={name} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-center bg-white dark:bg-zinc-900">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">{name}</span>
                          <span className="block text-2xl font-bold mt-2 font-mono">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  !prayerError && <div className="text-zinc-500 py-12 text-center">Namaz vakitleri yükleniyor...</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'dictionary' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Kelime ara..."
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                  >
                    <option value="Tümü">Tüm Kategoriler</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={sortOrder}
                    onChange={(e: any) => setSortOrder(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                  >
                    <option value="asc">A'dan Z'ye Sırala</option>
                    <option value="desc">Z'den A'ya Sırala</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-1 items-center justify-start max-w-full overflow-hidden">
                  <button
                    onClick={() => setLetterFilter('')}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      !letterFilter ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    Hepsi
                  </button>
                  {['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLetterFilter(l)}
                      className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                        letterFilter === l ? 'bg-zinc-900 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Words List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {words.length > 0 ? (
                  words.map((word) => (
                    <div key={word.id} className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{word.title}</h3>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-medium">
                          {word.category?.name || 'Genel'}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{word.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-zinc-500">
                    Arama kriterlerine uygun kelime bulunamadı.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'currency' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Döviz Kurları (TRY Bazlı)</h2>
                <button
                  onClick={fetchCurrencies}
                  disabled={currencyLoading}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50"
                >
                  {currencyLoading ? 'Güncelleniyor...' : 'Kurları Yenile'}
                </button>
              </div>

              {rates ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-zinc-500 font-medium">Dolar (USD / TRY)</span>
                      <h3 className="text-3xl font-extrabold mt-1 font-mono">{rates.USD.toFixed(2)}</h3>
                    </div>
                    <span className="text-emerald-500 font-bold">₺</span>
                  </div>
                  <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-zinc-500 font-medium">Euro (EUR / TRY)</span>
                      <h3 className="text-3xl font-extrabold mt-1 font-mono">{rates.EUR.toFixed(2)}</h3>
                    </div>
                    <span className="text-indigo-500 font-bold">₺</span>
                  </div>
                  <span className="col-span-2 text-xs text-zinc-400 text-center">
                    Son güncelleme: {rates.updated} (Open Exchange Rates API)
                  </span>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">Kurlar yükleniyor...</div>
              )}
            </motion.div>
          )}

          {activeTab === 'loans' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {!isLoanAuthed ? (
                /* Password Gate */
                <div className="max-w-md mx-auto p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-6">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-600 dark:text-zinc-400">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Şifreli Panel Girişi</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Borç takip paneline erişmek için şifre girin.</p>
                  </div>
                  <input
                    type="password"
                    placeholder="Şifre"
                    value={loanPassword}
                    onChange={(e) => setLoanPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoanAuth()}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none"
                  />
                  {loanAuthError && <p className="text-sm text-red-500 font-semibold">{loanAuthError}</p>}
                  <button
                    onClick={handleLoanAuth}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                  >
                    Giriş Yap
                  </button>
                </div>
              ) : (
                /* Authenticated Dashboard */
                loanData && (
                  <div className="space-y-8">
                    {/* Header Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Toplam Ödenen TL</span>
                        <h3 className="text-2xl font-extrabold mt-1 font-mono text-indigo-600">{Number(loanData.totalPaidTL).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</h3>
                      </div>
                      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Toplam Ödenen Gram</span>
                        <h3 className="text-2xl font-extrabold mt-1 font-mono text-emerald-600">{Number(loanData.totalPaidGram).toFixed(4)} GR</h3>
                      </div>
                      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Kalan Borç</span>
                        <h3 className="text-2xl font-extrabold mt-1 font-mono text-red-650">{Number(loanData.remainingLoan).toFixed(4)} GR / {loanData.totalLoanGram} GR</h3>
                      </div>
                    </div>

                    {/* Monthly Payments List */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
                          <thead className="bg-zinc-50 dark:bg-zinc-900 font-semibold text-zinc-500">
                            <tr>
                              <th className="px-6 py-4">Ay/Yıl</th>
                              <th className="px-6 py-4">Maaş (TL)</th>
                              <th className="px-6 py-4">Gram Fiyatı (TL)</th>
                              <th className="px-6 py-4">Ödenen TL</th>
                              <th className="px-6 py-4">Ödenen Gram</th>
                              <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                            {loanData.months.map((item: any) => {
                              const isEditing = editingPaymentKey === item.month_year;
                              return (
                                <tr key={item.month_year} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                                  <td className="px-6 py-4">{item.display}</td>
                                  {isEditing ? (
                                    <>
                                      <td className="px-6 py-4">
                                        <input
                                          type="number"
                                          value={editForm.salary}
                                          onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                                          className="w-24 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-6 py-4">
                                        <input
                                          type="number"
                                          value={editForm.gram_price}
                                          onChange={(e) => setEditForm({ ...editForm, gram_price: Number(e.target.value) })}
                                          className="w-24 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-6 py-4">
                                        <input
                                          type="number"
                                          value={editForm.paid_tl}
                                          onChange={(e) => setEditForm({ ...editForm, paid_tl: Number(e.target.value) })}
                                          className="w-24 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-6 py-4">
                                        <input
                                          type="number"
                                          value={editForm.paid_gram}
                                          onChange={(e) => setEditForm({ ...editForm, paid_gram: Number(e.target.value) })}
                                          className="w-24 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                          onClick={() => savePayment(item.month_year)}
                                          className="px-2 py-1 rounded bg-zinc-900 text-white text-xs font-semibold dark:bg-white dark:text-zinc-950"
                                        >
                                          Kaydet
                                        </button>
                                        <button
                                          onClick={() => setEditingPaymentKey(null)}
                                          className="px-2 py-1 rounded border border-zinc-200 text-xs font-semibold dark:border-zinc-700"
                                        >
                                          İptal
                                        </button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-6 py-4">{item.payment ? `${Number(item.payment.salary).toLocaleString('tr-TR')} ₺` : '-'}</td>
                                      <td className="px-6 py-4">{item.payment ? `${Number(item.payment.gram_price).toLocaleString('tr-TR')} ₺` : '-'}</td>
                                      <td className="px-6 py-4">{item.payment ? `${Number(item.payment.paid_tl).toLocaleString('tr-TR')} ₺` : '-'}</td>
                                      <td className="px-6 py-4">{item.payment ? `${Number(item.payment.paid_gram).toFixed(4)} GR` : '-'}</td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => startEditPayment(item.payment, item.month_year)}
                                          className="text-xs text-indigo-650 hover:underline dark:text-indigo-400"
                                        >
                                          Düzenle
                                        </button>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
