'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import LazyRender from '@/components/LazyRender';
import { motion } from 'framer-motion';
import { Smartphone, Shield, Code, Key, Compass, ChevronRight, MessageSquare, Lightbulb, Handshake, Globe } from 'lucide-react';

export default function HomeClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [randomQuote, setRandomQuote] = useState('Yükleniyor...');

  const quotes = [
    "Mevlana: “İki günü eşit olan zarardadır.”",
    "Azi Mahmud Hüdai: “Her şey gönlünde olduğu gibi olur.”",
    "Yunus Emre: “Biri var, her zaman seninle, o da sensin.”",
    "Mevlana: “Dünle beraber gitti, ne kadar söz varsa düne ait.”",
    "Azi Mahmud Hüdai: “Birlikten kuvvet doğar, ayrılık hüsran getirir.”",
    "Yunus Emre: “Gerçekten sev, ne oldum deme, ne olacağım de.”",
    "Nesimi: “Ben de bir insanım, her insan gibi bir acıyı hissederim.”",
    "Şems-i Tebrizi: “Hakk’ın karşına çıkardığı değişimlere direnmek yerine teslim ol.”",
    "Fuzuli: “Aşk derdiyle hoşem, el çek ilacımdan tabib.”"
  ];

  useEffect(() => {
    // Pick a random quote
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setRandomQuote(quote);

    // Fetch homepage data
    api.get('/posts/home')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Anasayfa verileri yüklenirken hata oluştu:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="relative bg-zinc-900 text-white min-h-[50vh] flex items-center justify-center py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/index.png')" }}></div>
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            Tayfun Taşdemir
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl italic text-zinc-300 font-serif max-w-2xl mx-auto"
          >
            {randomQuote}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm uppercase tracking-widest text-zinc-400 font-semibold"
          >
            Bilgisayar Mühendisi | Yazılım Geliştirici | Backend Developer
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/contact"
              className="inline-block bg-white text-zinc-900 font-bold py-3 px-8 rounded-xl hover:bg-zinc-100 transition-colors shadow-lg"
            >
              İletişime Geçin
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bugün En Çok Okunanlar */}
      <section className="bg-zinc-50 dark:bg-zinc-900/40 py-16 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8">Bugün En Çok Okunanlar</h2>
          
          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-64 shrink-0 bg-white dark:bg-zinc-900 rounded-2xl h-44 animate-pulse" />
              ))}
            </div>
          ) : data?.mostReadPostsToday?.length > 0 ? (
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-zinc-200">
              {data.mostReadPostsToday.map((post: any) => (
                <div key={post.id} className="flex-shrink-0 w-64">
                  <Link href={`/post/${post.slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="h-32 bg-zinc-100 dark:bg-zinc-800 relative">
                      <img
                        src={getImageUrl(post.image)}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate group-hover:text-blue-650 dark:group-hover:text-brand-blue">{post.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{post.today_views_count} kez okundu</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Bugün henüz hiç yazı okunmadı.</p>
          )}
        </div>
      </section>

      {/* Mobil Uygulamalarım & Hızlı Araçlar */}
      <LazyRender height={600}>
        <section className="bg-white dark:bg-zinc-950 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Mobil Uygulamalarım */}
            <div>
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-brand-blue rounded-full"></span> Mobil Uygulamalarım
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vakt-i Huzur */}
                <div className="group relative bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-20 h-20 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg flex items-center justify-center p-3 transform group-hover:rotate-3 transition-transform duration-500">
                        <img src="/hilal.png" alt="Vakt-i Huzur" className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-450 text-[10px] font-bold rounded-full tracking-wider uppercase">Yeni</span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">Vakt-i Huzur</h3>
                    <p className="text-zinc-650 dark:text-zinc-450 text-sm leading-relaxed mb-8 flex-grow">
                      Namaz vakitleri, kıble bulucu, zikirmatik ve günlük dini içeriklerle ibadetlerinizde yardımcınız olan modern bir uygulama.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-auto">
                      <Link href="/vakti-huzur" className="inline-flex items-center justify-center px-5 py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white text-sm font-bold rounded-xl transition-all">
                        İndir
                      </Link>
                      <Link href="/vakti-huzur" className="inline-flex items-center justify-center px-5 py-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all">
                        Detaylı Bilgi
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Tek Tıkla */}
                <div className="group relative bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-20 h-20 bg-white dark:bg-zinc-950 rounded-2xl shadow-lg flex items-center justify-center p-4 transform group-hover:-rotate-3 transition-transform duration-500">
                        <img src="/tektiklaLogo.png" alt="Tek Tıkla" className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-450 text-[10px] font-bold rounded-full tracking-wider uppercase">Yeni</span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">Tek Tıkla</h3>
                    <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
                      Sık kullandığınız web sitelerini kaydedin, organize edin ve tek bir tıkla anında erişin. Hızlı ve güvenli web deneyimi.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-auto">
                      <Link href="/tek-tikla" className="inline-flex items-center justify-center px-5 py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white text-sm font-bold rounded-xl transition-all">
                        İndir
                      </Link>
                      <Link href="/tek-tikla" className="inline-flex items-center justify-center px-5 py-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all">
                        Detaylı Bilgi
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hızlı Araçlar */}
            <div>
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-brand-blue rounded-full"></span> Hızlı Araçlar
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <Link href="/tools/ip" className="group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white dark:bg-zinc-950 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-brand-dark">IP Adresim</h4>
                </Link>
                <Link href="/tools/base64" className="group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white dark:bg-zinc-950 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-brand-dark">Base64 Atölyesi</h4>
                </Link>
                <Link href="/tools/json" className="group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white dark:bg-zinc-950 group-hover:scale-110 transition-transform duration-300">
                    <Code className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-brand-dark">JSON Formatter</h4>
                </Link>
                <Link href="/password-generator" className="group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-white dark:bg-zinc-950 group-hover:scale-110 transition-transform duration-300">
                    <Key className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 group-hover:text-brand-dark">Şifre Oluşturucu</h4>
                </Link>
              </div>

              <Link href="/applications" className="group flex items-center justify-center w-full py-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl text-zinc-800 dark:text-zinc-200 font-bold hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all duration-500 shadow-sm">
                <span className="flex items-center gap-2">
                  <Compass className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  Tüm Uygulamaları ve Araçları Keşfet
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </LazyRender>

      {/* Son Gönderiler & En Çok Okunanlar (Side-by-Side) */}
      <LazyRender height={600}>
        <section className="bg-zinc-50 dark:bg-zinc-900/20 py-16 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Side: Recent Posts */}
              <div className="lg:col-span-8 space-y-8">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Son Gönderiler</h2>
                
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white dark:bg-zinc-900 rounded-2xl h-48 animate-pulse" />
                    ))}
                  </div>
                ) : data?.lastThreePosts?.length > 0 ? (
                  <div className="space-y-8">
                    {data.lastThreePosts.map((post: any) => (
                      <article key={post.id} className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-zinc-200/50 dark:border-zinc-800/50 group">
                        <Link href={`/post/${post.slug}`} className="block sm:w-1/3 shrink-0 rounded-xl overflow-hidden bg-zinc-150 relative h-48">
                          <img
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                        </Link>
                        <div className="flex flex-col justify-center space-y-2">
                          <span className="text-xs text-zinc-500">
                            {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <Link href={`/post/${post.slug}`}>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-brand-dark transition-colors leading-snug">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-zinc-650 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                            {post.content.replace(/<[^>]*>/g, '')}
                          </p>
                          <span className="text-xs text-zinc-500">{post.views} kez okundu</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Henüz gönderi bulunmuyor.</p>
                )}

                <div className="text-center pt-4">
                  <Link href="/posts" className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all shadow-sm">
                    Tüm Gönderiler
                  </Link>
                </div>
              </div>

              {/* Right Side: Most Read Sidebar */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">En Çok Okunanlar</h3>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : data?.mostRead?.length > 0 ? (
                    <div className="space-y-6">
                      {data.mostRead.map((post: any) => (
                        <Link key={post.id} href={`/post/${post.slug}`} className="flex items-center gap-4 group">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 relative">
                            <img
                              src={getImageUrl(post.image)}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop';
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-brand-dark transition-colors line-clamp-2 leading-tight">
                              {post.title}
                            </h4>
                            <span className="text-[11px] text-zinc-500 block">{post.views} kez okundu</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">Hiç okunma kaydı bulunmuyor.</p>
                  )}
                </div>
              </aside>

            </div>
          </div>
        </section>
      </LazyRender>

      {/* Birlikte Harika İşler Yapabiliriz */}
      <LazyRender height={400}>
        <section className="bg-white dark:bg-zinc-950 py-20 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white">Birlikte Harika İşler Yapabiliriz</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">Projelerinizde size nasıl destek olabileceğimi öğrenin.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
                <Lightbulb className="h-12 w-12 text-brand-blue mb-4" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Yeni Bir Projeniz Mi Var?</h3>
                <p className="text-zinc-650 dark:text-zinc-450 text-sm mb-6 leading-relaxed flex-grow">
                  Web uygulamaları, API entegrasyonları veya veritabanı çözümleri konusunda tecrübemle projenizi hayata geçirebiliriz.
                </p>
                <Link href="/applications" className="font-bold text-brand-dark hover:text-blue-700 transition-colors">
                  Projelerimi İnceleyin &rarr;
                </Link>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
                <Handshake className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Yazılım Desteği</h3>
                <p className="text-zinc-650 dark:text-zinc-450 text-sm mb-6 leading-relaxed flex-grow">
                  Mevcut projelerinize backend desteği, performans iyileştirmeleri veya yeni özellikler eklemek için buradayım.
                </p>
                <Link href="/contact" className="font-bold text-green-600 hover:text-green-700 transition-colors">
                  İletişime Geçin &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </LazyRender>
    </PageTransition>
  );
}
