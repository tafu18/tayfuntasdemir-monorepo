import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { getPosts } from '@/lib/posts-server';
import { SITE_URL } from '@/lib/seo';
import PostsClient from './PostsClient';

type Props = { searchParams: Promise<{ page?: string }> };

function parsePage(raw?: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  if (page === 1) return {};
  const data = await getPosts(page, 9);
  if (data && data.data.length === 0) notFound();
  // Sayfalama: her sayfa kendini canonical gösterir, başlık tekilleşir.
  return {
    title: `Yazılım & Teknoloji Makaleleri - Sayfa ${page}`,
    alternates: {
      canonical: `/posts?page=${page}`,
      types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
    },
  };
}

export default async function PostsPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const data = (await getPosts(page, 9)) ?? { data: [], total: 0, page, lastPage: 1 };
  if (page > 1 && data.data.length === 0) notFound();

  return (
    <PageTransition>
      <PostsClient initialData={data} />
    </PageTransition>
  );
}
