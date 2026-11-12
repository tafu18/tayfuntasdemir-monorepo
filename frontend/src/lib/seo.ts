import type { Metadata } from 'next';

export const SITE_URL = 'https://tayfuntasdemir.com.tr';
export const SITE_NAME = 'Tayfun Taşdemir';
export const SITE_LOCALE = 'tr_TR';
export const DEFAULT_DESCRIPTION =
  'Tayfun Taşdemir kişisel blogu, mobil ve web projeleri, ücretsiz geliştirici araçları (JSON, JWT, Regex, Base64, Cron, cURL) ve Vakt-i Huzur, Tek Tıkla uygulamaları.';

/** Başlığın sonundaki tekrar eden marka ekini temizler (root template zaten "| Tayfun Taşdemir" ekliyor). */
export function stripBrand(title: string): string {
  return title.replace(/\s*[|\-–]\s*Tayfun Taşdemir(\s+Blog)?\s*$/i, '').trim();
}

/** Sayfaya özel 1200x630 Open Graph görseli URL'i (app/og/route.tsx). */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set('subtitle', subtitle);
  return `/og?${params.toString()}`;
}

type SeoInput = Omit<Metadata, 'title'> & {
  title: string;
  description: string;
};

/**
 * Sayfa metadata'sını canonical, eksiksiz OpenGraph ve Twitter alanlarıyla tamamlar.
 * Next.js metadata'yı sığ (shallow) birleştirdiği için child segmentteki `openGraph`
 * root'taki görseli/siteName'i siler; bu helper her sayfada bunları yeniden kurar.
 */
export function withSeo(path: string, input: SeoInput): Metadata {
  const { title: rawTitle, description, openGraph, twitter, alternates, ...rest } = input;
  const title = stripBrand(rawTitle);
  const ogTitle = stripBrand((openGraph?.title as string | undefined) ?? title);
  const ogDescription = (openGraph?.description as string | undefined) ?? description;
  const image = {
    url: ogImageUrl(ogTitle),
    width: 1200,
    height: 630,
    alt: ogTitle,
  };

  return {
    ...rest,
    title,
    description,
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
      ...alternates,
    },
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url: path,
      images: [image],
      ...openGraph,
      title: ogTitle,
      description: ogDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image.url],
      ...twitter,
    },
  };
}

/** Basit BreadcrumbList JSON-LD üretir. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Backend'deki görsel yolunu herkese açık mutlak URL'e çevirir (lib/api.ts getImageUrl ile aynı kurallar). */
export function absoluteImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || SITE_URL).replace(/\/$/, '');
  let path = url.startsWith('/') ? url : `/${url}`;
  if (!path.startsWith('/uploads/')) path = `/uploads${path}`;
  return `${base}${path}`;
}
