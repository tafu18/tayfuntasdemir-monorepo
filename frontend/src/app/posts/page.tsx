'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import { BookOpen, Calendar, Eye } from 'lucide-react';

function PostsContent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">Blog</h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
          Yazılım, kariyer, web teknolojileri ve yapay zeka üzerine makalelerim.
        </p>
      </div>

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
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
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
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
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
