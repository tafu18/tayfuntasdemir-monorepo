import { MetadataRoute } from 'next';

const baseUrl = 'https://tayfuntasdemir.com.tr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    // Ana Sayfa & Temel Sayfalar
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/posts', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/applications', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/projects', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },

    // Öne Çıkan Projeler & Uygulamalar
    { path: '/vakti-huzur', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tek-tikla', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/namaz-vakitleri', priority: 0.9, changeFrequency: 'daily' as const },

    // Yüksek Aranma Hacimli Geliştirici Araçları (High SEO Priority)
    { path: '/cron-generator', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/curl-converter', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/jwt-secret-generator', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/jwt', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/json', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/base64', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/password-generator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/regex', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/converter', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/compiler', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/epoch', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/url', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/generator', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/ip', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/pusula-api', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/code-diff', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/hicri', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/doviz', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/sozluk', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/terminal', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/live-dashboard', priority: 0.7, changeFrequency: 'weekly' as const },

    // Mini Oyunlar
    { path: '/game/hangman', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/game/minesweeper', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/game/rock', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/game/snake', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/game/memory', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dinamik Blog Yazıları
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/api/posts?limit=500`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const posts = data.data || data || [];
      if (Array.isArray(posts)) {
        postEntries = posts.map((post: any) => ({
          url: `${baseUrl}/post/${post.slug}`,
          lastModified: new Date(post.updated_at || post.created_at || Date.now()),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (e) {
    // Fallback if backend API is offline during build
  }

  return [...staticEntries, ...postEntries];
}
