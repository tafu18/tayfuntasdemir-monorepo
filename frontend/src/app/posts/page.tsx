'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Calendar, Eye } from 'lucide-react';

function PostsContent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('Yükleniyor...');

  const quotes = [
    "İbn-i Arabi: 'Bütün kainat, içindeki Allah'ı keşfetmek için bir aynadır.'",
    "Ebu Hanife: 'İman, amel ile tamamlanır.'",
    "İbn Şükrü: 'Gerçek zenginlik, gönlün zenginliğidir.'",
    "Hikmet-i Muhammediye: 'Bir insanın değeri, onun sabrında gizlidir.'",
    "Şeyh Nureddin: 'Gönlünü her türlü kötülükten temizle, o zaman her şey güzelleşir.'",
    "İmam Malik: 'Güzel söz, güzel bir davranıştır.'",
    "İbn Qayyim: 'Sabır, en yüksek erdemdir.'",
    "Mevlana: 'Bir insan ne kadar çok severse, o kadar çok öğrenir.'",
    "Yunus Emre: 'Dünya sadece bir sınav yeridir, asıl hayat ebedi olanlardadır.'",
    "İbn Sina: 'İlim, hayatın her alanında insanın en değerli yol arkadaşıdır.'"
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    setLoading(true);
    api.get(`/posts?page=${pageParam}&limit=9`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Yazılar yüklenirken hata:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageParam]);

  const currentDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-0">
      {/* Cover Header */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32 text-center text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('/posts.png')]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Gönderilerim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg italic text-zinc-200"
          >
            “{quote}”
          </motion.p>
          <p className="mt-2 text-xs text-zinc-500">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-zinc-200 dark:bg-zinc-800 h-48 w-full rounded-xl" />
                <div className="bg-zinc-200 dark:bg-zinc-800 h-6 w-3/4 rounded" />
                <div className="bg-zinc-200 dark:bg-zinc-800 h-4 w-full rounded" />
              </div>
            ))}
          </div>
        ) : data.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.data.map((post: any) => (
                <article key={post.id} className="flex flex-col items-start justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-shadow dark:bg-zinc-900 bg-white">
                  <div className="w-full">
                    <div className="aspect-[16/9] w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4 relative">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${post.image}`}
                        alt={post.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-x-4 text-xs text-zinc-500 mb-2">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        {post.views} okuma
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white hover:text-indigo-650 dark:hover:text-indigo-400">
                      <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {post.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {data.lastPage > 1 && (
              <div className="mt-12 flex justify-center space-x-2">
                {Array.from({ length: data.lastPage }, (_, idx) => idx + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/posts?page=${p}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                      data.page === p
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500">
            Henüz blog yazısı eklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Posts() {
  return (
    <PageTransition>
      <Suspense fallback={<div className="text-center py-24">Yükleniyor...</div>}>
        <PostsContent />
      </Suspense>
    </PageTransition>
  );
}
