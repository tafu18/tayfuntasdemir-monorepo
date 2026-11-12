import { cache } from 'react';

/** Sunucu tarafında backend'e erişim adresi (Docker içinde INTERNAL_API_URL=http://backend:4000). */
export const SERVER_API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type PostDetailData = { post: any; related: any[]; mostRead: any[] };
export type PostListData = { data: any[]; total: number; page: number; lastPage: number };

/** Aynı istek içinde layout (metadata) + page tek fetch paylaşır. 404 ise null döner. */
export const getPostBySlug = cache(async (slug: string): Promise<PostDetailData | null> => {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/posts/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.post ? data : null;
  } catch (e) {
    console.error('getPostBySlug failed:', e);
    return null;
  }
});

export const getPosts = cache(async (page = 1, limit = 9): Promise<PostListData | null> => {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/posts?page=${page}&limit=${limit}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('getPosts failed:', e);
    return null;
  }
});

/** HTML içerikten düz metin özet üretir (meta description vb. için). */
export function excerpt(html: string | undefined, length = 160): string {
  const text = (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : length).trim()}…`;
}

export const getHomeData = cache(async (): Promise<any | null> => {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/posts/home`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('getHomeData failed:', e);
    return null;
  }
});
