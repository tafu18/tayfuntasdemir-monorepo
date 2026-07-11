import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/api/posts/slug/${slug}`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      return {
        title: 'Blog Yazısı | Tayfun Taşdemir',
        description: 'Yazılım ve teknoloji üzerine güncel makaleler.',
      };
    }
    
    const data = await res.json();
    const post = data.post;
    
    if (!post) {
      return {
        title: 'Yazı Bulunamadı | Tayfun Taşdemir',
        description: 'Böyle bir blog yazısı mevcut değil.',
      };
    }
    
    const title = post.meta_title || `${post.title} | Tayfun Taşdemir`;
    const description = post.meta_description || post.content.substring(0, 160).replace(/<[^>]*>/g, '').trim();
    
    return {
      title,
      description,
      keywords: post.meta_keywords || '',
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.publish_at || post.created_at,
        modifiedTime: post.updated_at,
        authors: ['Tayfun Taşdemir'],
      }
    };
  } catch (e) {
    console.error(e);
    return {
      title: 'Blog Yazısı | Tayfun Taşdemir',
      description: 'Yazılım ve teknoloji üzerine güncel makaleler.',
    };
  }
}

export default async function PostLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let jsonLd: any = null;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/api/posts/slug/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      const post = data.post;
      if (post) {
        jsonLd = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Ana Sayfa",
                  "item": "https://tayfuntasdemir.com.tr"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Gönderiler",
                  "item": "https://tayfuntasdemir.com.tr/posts"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": `https://tayfuntasdemir.com.tr/post/${post.slug}`
                }
              ]
            },
            {
              "@type": "BlogPosting",
              "headline": post.title,
              "image": post.image ? (post.image.startsWith('http') ? post.image : `${API_URL}${post.image}`) : 'https://tayfuntasdemir.com.tr/favicon.png',
              "datePublished": post.publish_at || post.created_at,
              "dateModified": post.updated_at,
              "author": {
                "@type": "Person",
                "name": "Tayfun Taşdemir",
                "url": "https://tayfuntasdemir.com.tr/about"
              },
              "description": post.meta_description || post.content.substring(0, 160).replace(/<[^>]*>/g, '').trim(),
              "mainEntityOfPage": `https://tayfuntasdemir.com.tr/post/${post.slug}`
            }
          ]
        };
      }
    }
  } catch (e) {
    console.error('JSON-LD schema generation failed:', e);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
