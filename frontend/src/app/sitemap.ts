import { MetadataRoute } from 'next';

const baseUrl = 'https://tayfuntasdemir.com.tr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/about',
    '/projects',
    '/posts',
    '/applications',
    '/namaz-vakitleri',
    '/vakti-huzur',
    '/tek-tikla',
    '/hicri',
    '/doviz',
    '/ip',
    '/json',
    '/base64',
    '/jwt',
    '/password-generator',
    '/url',
    '/regex',
    '/code-diff',
    '/epoch',
    '/sozluk',
    '/contact',
    '/llm.txt',
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/posts' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/vakti-huzur' || route === '/tek-tikla' ? 0.9 : 0.8,
  }));

  // Attempt to fetch dynamic blog posts for sitemap
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/api/posts?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const posts = data.data || data || [];
      if (Array.isArray(posts)) {
        postEntries = posts.map((post: any) => ({
          url: `${baseUrl}/post/${post.slug}`,
          lastModified: new Date(post.updated_at || post.created_at || Date.now()),
          changeFrequency: 'monthly',
          priority: 0.7,
        }));
      }
    }
  } catch (e) {
    // Fallback gracefully if backend API is offline during build
  }

  return [...staticEntries, ...postEntries];
}
