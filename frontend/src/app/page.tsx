'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Sparkles, Terminal } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts?limit=3')
      .then((res) => {
        setPosts(res.data?.data || []);
      })
      .catch((err) => {
        console.error('Yazılar alınamadı:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-1 text-sm text-zinc-600 dark:text-zinc-400 mb-6"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Modern NestJS & Next.js Monorepo</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl"
            >
              Fikirler, Teknoloji ve <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Yazılım Portfolyosu</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400"
            >
              Yazılım dünyasındaki gelişmeleri, kişisel projelerimi ve öğrendiklerimi paylaştığım dijital platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex items-center gap-x-6"
            >
              <Link
                href="/posts"
                className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 flex items-center group"
              >
                Blogu Oku
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/applications"
                className="text-sm font-semibold leading-6 text-zinc-900 dark:text-white flex items-center hover:opacity-85"
              >
                Uygulamaları Keşfet
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Güncel Blog</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-6">
                Yapay zeka, modern web teknolojileri ve programlama dilleri üzerine teknik yazılar.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Mini Araçlar</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-6">
                Namaz vakitleri takibi, borç hesaplayıcı, döviz kurları ve sözlük gibi entegre mini araçlar.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Oyun Salonu</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-6">
                Tarayıcı üzerinden oynanabilen yılan, adam asmaca ve mayın tarlası gibi keyifli mini oyunlar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">Son Yazılar</h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">Blog sayfamızda yayınlanan en son içerikler.</p>
            </div>
            <Link href="/posts" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:opacity-85 flex items-center">
              Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex flex-col space-y-4">
                  <div className="bg-zinc-200 dark:bg-zinc-800 h-48 w-full rounded-xl" />
                  <div className="bg-zinc-200 dark:bg-zinc-800 h-6 w-3/4 rounded" />
                  <div className="bg-zinc-200 dark:bg-zinc-800 h-4 w-full rounded" />
                  <div className="bg-zinc-200 dark:bg-zinc-800 h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col items-start justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-shadow dark:bg-zinc-900 bg-white">
                  <div className="w-full">
                    {post.image && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${post.image}`}
                        alt={post.title}
                        className="aspect-[16/9] w-full rounded-lg bg-zinc-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] mb-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    )}
                    <div className="flex items-center gap-x-4 text-xs">
                      <time dateTime={post.created_at} className="text-zinc-500">
                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      </time>
                      <span className="relative z-10 rounded-full bg-zinc-50 px-3 py-1.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Teknoloji
                      </span>
                    </div>
                    <div className="group relative">
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                        <Link href={`/post/${post.slug}`}>
                          <span className="absolute inset-0" />
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {post.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500">
              Henüz yazı eklenmedi.
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
