'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import { Calendar, Eye, ArrowLeft, BookOpen } from 'lucide-react';

interface PostDetailProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetail({ params }: PostDetailProps) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        Yazı Yükleniyor...
      </div>
    );
  }

  if (!data?.post) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h2 className="text-xl font-semibold">Yazı bulunamadı.</h2>
        <Link href="/posts" className="mt-4 text-indigo-600 inline-block">Bloga Geri Dön</Link>
      </div>
    );
  }

  const { post, related, mostRead } = data;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Post */}
          <div className="flex-1 max-w-4xl">
            <Link href="/posts" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white mb-8 group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Bloga Dön
            </Link>

            <article className="prose prose-zinc dark:prose-invert max-w-none">
              <div className="flex items-center gap-x-4 text-xs text-zinc-500 mb-6">
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {new Date(post.created_at).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {post.views} okuma
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-6">
                {post.title}
              </h1>

              {post.image && (
                <div className="aspect-[21/9] w-full rounded-xl bg-zinc-100 overflow-hidden mb-8 relative">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${post.image}`}
                    alt={post.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop';
                    }}
                  />
                </div>
              )}

              <div
                className="mt-8 text-base leading-8 text-zinc-700 dark:text-zinc-300 space-y-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-12">
            {/* Most Read */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-indigo-500" />
                En Çok Okunanlar
              </h3>
              <ul className="space-y-4">
                {mostRead.map((item: any) => (
                  <li key={item.id}>
                    <Link href={`/post/${item.slug}`} className="text-sm font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 block line-clamp-2">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Posts */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Benzer Yazılar</h3>
              <ul className="space-y-4">
                {related.map((item: any) => (
                  <li key={item.id}>
                    <Link href={`/post/${item.slug}`} className="text-sm font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 block line-clamp-2">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
