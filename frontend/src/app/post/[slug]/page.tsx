'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, getImageUrl } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import LazyRender from '@/components/LazyRender';
import OtherTools from '@/components/OtherTools';
import { Calendar, Eye, ArrowLeft, BookOpen, Clock, Wrench, Sparkles, Key, Lock, FileCode, Search, ShieldCheck } from 'lucide-react';

interface PostDetailProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetail({ params }: PostDetailProps) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch post data
  useEffect(() => {
    api.get(`/posts/slug/${slug}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Yazı yüklenemedi:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const hasTracked = useRef(false);

  // Tracking API Call
  useEffect(() => {
    if (!data?.post || hasTracked.current) return;
    
    // Prevent double tracking in React Strict Mode
    hasTracked.current = true;

    const sendPing = (city: string, country: string) => {
      const payload = {
        post_title: data.post.title,
        post_slug: data.post.slug,
        city,
        country
      };
      api.post('/posts/tracking', payload).catch(err => console.error("Tracking error:", err));
    };

    const cachedCity = sessionStorage.getItem('user_city');
    const cachedCountry = sessionStorage.getItem('user_country');

    if (cachedCity && cachedCountry) {
      sendPing(cachedCity, cachedCountry);
    } else {
      fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(geoData => {
          const city = geoData.city || 'Bilinmeyen Şehir';
          const country = geoData.country || 'Bilinmeyen Ülke';
          sessionStorage.setItem('user_city', city);
          sessionStorage.setItem('user_country', country);
          sendPing(city, country);
        })
        .catch(err => {
          console.error("IP API Error:", err);
          sendPing('Bilinmeyen Şehir', 'Bilinmeyen Ülke');
        });
    }
  }, [data?.post]);

  if (loading) {
    return (
      <PageTransition>
        <div className="bg-white dark:bg-zinc-950 pt-8 pb-16 min-h-screen animate-pulse">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Skeleton */}
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mb-6"></div>

            <div className="flex flex-col lg:flex-row lg:gap-x-12">
              {/* Main Post Skeleton */}
              <div className="w-full lg:w-[65%] xl:w-[68%]">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mb-6"></div>
                <div className="flex gap-4 mb-6">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                </div>
                <div className="aspect-[21/9] w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5"></div>
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <aside className="w-full lg:w-1/3 mt-12 lg:mt-0 space-y-8">
                <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              </aside>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!data?.post) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h2 className="text-xl font-semibold">Yazı bulunamadı.</h2>
        <Link href="/posts" className="mt-4 text-brand-dark inline-block">Bloga Geri Dön</Link>
      </div>
    );
  }

  const { post, related, mostRead } = data;

  // Calculate reading time
  const readingTime = Math.floor((post.content?.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 0) / 200) + 1;

  return (
    <PageTransition>
      <div className="bg-white dark:bg-zinc-950 pt-8 pb-16 min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="text-sm font-medium text-zinc-500 mb-6">
            <ol className="flex items-center space-x-2">
              <li><Link href="/" className="hover:text-brand-dark text-brand-blue dark:text-brand-blue dark:hover:text-blue-300">Ana Sayfa</Link></li>
              <li><span className="mx-2">/</span></li>
              <li><Link href="/posts" className="hover:text-brand-dark text-brand-blue dark:text-brand-blue dark:hover:text-blue-300">Gönderiler</Link></li>
              <li><span className="mx-2">/</span></li>
              <li className="text-zinc-700 dark:text-zinc-300" aria-current="page">{post.title}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:gap-x-12">
            
            {/* Main Post */}
            <div className="w-full lg:w-[65%] xl:w-[68%]">
              <article>
                <header className="mb-6">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-blue dark:text-brand-blue leading-tight mb-4 transition-colors">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span>Yayınlanma: {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center"><Eye className="h-4 w-4 mr-1.5" /> {post.views} kez okundu</span>
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /> {readingTime} dakikada okunur</span>
                  </div>
                </header>

                {post.image && (
                  <figure className="mb-8">
                    <img 
                      className="w-full h-auto rounded-xl shadow-lg" 
                      src={getImageUrl(post.image)} 
                      alt={post.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop';
                      }}
                    />
                  </figure>
                )}

                <section 
                  className="prose prose-lg max-w-full prose-indigo dark:prose-invert prose-a:text-brand-dark hover:prose-a:text-blue-800 dark:prose-a:text-brand-blue dark:hover:prose-a:text-blue-300"
                  dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br />') : '' }}
                />
              </article>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-1/3 mt-12 lg:mt-0">
              <div className="sticky top-24 space-y-8">
                
                {/* Share Block */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-brand-blue dark:text-brand-blue mb-4">Bu Yazıyı Paylaş</h3>
                  <div className="flex flex-col gap-4">
                    {/* Sosyal Medya İkonları */}
                    <div className="flex items-center gap-3">
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-opacity" title="X'te Paylaş">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity" title="Facebook'ta Paylaş"><i className="fab fa-facebook-f"></i></a>
                      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-80 transition-opacity" title="LinkedIn'de Paylaş"><i className="fab fa-linkedin-in"></i></a>
                      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-80 transition-opacity" title="WhatsApp'ta Paylaş"><i className="fab fa-whatsapp"></i></a>
                    </div>
                    
                    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800"></div>

                    {/* Mobil Uygulamalar */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Uygulamalarım:</span>
                      <Link href="/vakti-huzur" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-950 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:scale-110 transition-transform overflow-hidden p-1.5" title="Vakt-i Huzur">
                        <Image src="/hilal.png" alt="Vakt-i Huzur" width={30} height={30} className="w-full h-full object-contain" />
                      </Link>
                      <Link href="/tek-tikla" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-950 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:scale-110 transition-transform overflow-hidden p-1" title="Tek Tıkla">
                        <Image src="/tektiklaLogo.png" alt="Tek Tıkla" width={30} height={30} className="w-full h-full object-contain rounded-full" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Popüler Geliştirici Araçları (Internal Linking SEO Widget) */}
                <div className="bg-gradient-to-br from-brand-blue/5 via-emerald-500/5 to-transparent p-6 rounded-2xl border border-brand-blue/15 dark:border-brand-blue/25 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-blue text-white">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                      Geliştirici Araçları
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'JWT Secret Üretici', path: '/jwt-secret-generator', badge: 'Yeni', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950' },
                      { name: 'JWT Decoder & Parser', path: '/jwt', badge: 'Popüler', color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950' },
                      { name: 'JSON Formatter', path: '/json', badge: null, color: '' },
                      { name: 'Base64 Atölyesi', path: '/base64', badge: null, color: '' },
                      { name: 'Güçlü Şifre Oluşturucu', path: '/password-generator', badge: null, color: '' },
                      { name: 'Görsel Dönüştürücü', path: '/converter', badge: null, color: '' },
                    ].map((tool) => (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-brand-blue dark:hover:text-brand-blue transition-all group"
                      >
                        <span className="truncate">{tool.name}</span>
                        {tool.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tool.color}`}>
                            {tool.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/applications"
                    className="block text-center text-xs font-bold text-brand-blue hover:underline pt-1"
                  >
                    Tüm 15+ Aracı Gör →
                  </Link>
                </div>

                {/* Medium Block */}
                {post.medium_link && (
                  <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-brand-blue dark:text-brand-blue mb-4">Medium'da Oku</h3>
                    <a href={post.medium_link} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-zinc-950 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <i className="fab fa-medium mr-2 text-xl"></i>
                      <span>Yazıyı Medium'da Görüntüle</span>
                    </a>
                  </div>
                )}

                {/* Most Read & Related (Lazy Load) */}
                <LazyRender height={300}>
                  {/* Most Read Block */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">En Çok Okunanlar</h3>
                    <div className="space-y-4">
                      {mostRead.map((mostReadPost: any) => (
                        <Link key={mostReadPost.id} href={`/post/${mostReadPost.slug}`} className="flex items-center gap-4 group">
                          <img 
                            src={getImageUrl(mostReadPost.image)} 
                            alt={mostReadPost.title} 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop';
                            }}
                          />
                          <div className="flex-grow">
                            <h4 className="font-semibold text-brand-blue dark:text-brand-blue group-hover:text-brand-dark dark:group-hover:text-blue-300 transition-colors text-sm leading-tight">
                              {mostReadPost.title}
                            </h4>
                            <small className="text-zinc-500">{mostReadPost.views} kez okundu</small>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Related Posts Block */}
                  {related && related.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 mt-8">
                      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">İlgili Yazılar</h3>
                      <ul className="space-y-2">
                        {related.map((relatedPost: any) => (
                          <li key={relatedPost.id}>
                            <Link href={`/post/${relatedPost.slug}`} className="font-medium text-brand-blue dark:text-brand-blue hover:text-brand-dark dark:hover:text-blue-300 transition-colors flex items-start">
                              <span className="mr-2">&rarr;</span>
                              <span>{relatedPost.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </LazyRender>

              </div>
            </aside>
          </div>

          {/* Cross-Linking: Other Developer Tools under Blog Post */}
          <div className="mt-16">
            <OtherTools />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
