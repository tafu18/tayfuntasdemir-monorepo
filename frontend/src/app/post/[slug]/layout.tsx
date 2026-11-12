import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, excerpt } from '@/lib/posts-server';
import { SITE_URL, SITE_NAME, absoluteImageUrl, breadcrumbJsonLd, ogImageUrl, stripBrand } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  const post = data?.post;

  // Metadata, botlar için streaming başlamadan çözülür; burada notFound() çağırmak
  // arama motorlarına gerçek 404 durum kodu döndürür (soft-404 önlenir).
  if (!post) notFound();

  const path = `/post/${post.slug}`;
  const title = stripBrand(post.meta_title || post.title);
  const description = post.meta_description || excerpt(post.content);
  const cover = absoluteImageUrl(post.image);
  const images = cover
    ? [{ url: cover, alt: post.title }]
    : [{ url: ogImageUrl(post.title, 'Tayfun Taşdemir · Blog'), width: 1200, height: 630, alt: post.title }];

  return {
    title,
    description,
    keywords: post.meta_keywords || undefined,
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
    },
    openGraph: {
      type: 'article',
      url: path,
      siteName: SITE_NAME,
      locale: 'tr_TR',
      title,
      description,
      images,
      publishedTime: post.publish_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: [`${SITE_URL}/about`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export default async function PostLayout({ children, params }: { children: React.ReactNode } & Props) {
  const { slug } = await params;
  const post = (await getPostBySlug(slug))?.post;

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          breadcrumbJsonLd([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'Blog', path: '/posts' },
            { name: post.title, path: `/post/${post.slug}` },
          ]),
          {
            '@type': 'BlogPosting',
            '@id': `${SITE_URL}/post/${post.slug}#article`,
            headline: post.title.slice(0, 110),
            description: post.meta_description || excerpt(post.content),
            image: absoluteImageUrl(post.image) || `${SITE_URL}${ogImageUrl(post.title)}`,
            datePublished: post.publish_at || post.created_at,
            dateModified: post.updated_at || post.created_at,
            inLanguage: 'tr-TR',
            wordCount: excerpt(post.content, 1e9).split(' ').length,
            keywords: post.meta_keywords || undefined,
            author: {
              '@type': 'Person',
              '@id': `${SITE_URL}/#person`,
              name: SITE_NAME,
              url: `${SITE_URL}/about`,
            },
            publisher: {
              '@type': 'Person',
              '@id': `${SITE_URL}/#person`,
              name: SITE_NAME,
              url: SITE_URL,
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/post/${post.slug}` },
            isPartOf: { '@id': `${SITE_URL}/#website` },
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {children}
    </>
  );
}
