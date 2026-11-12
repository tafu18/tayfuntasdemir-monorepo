import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/posts-server';
import PostDetailClient from './PostDetailClient';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  // Gerçek 404 durum kodu (soft-404 yerine)
  if (!data) notFound();
  return <PostDetailClient data={data} />;
}
