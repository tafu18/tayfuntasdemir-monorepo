import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { getPosts, excerpt } from '@/lib/posts-server';

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const list = await getPosts(1, 50);
  const posts = list?.data ?? [];

  const items = posts
    .map((post: any) => {
      const url = `${SITE_URL}/post/${post.slug}`;
      const date = new Date(post.publish_at || post.created_at).toUTCString();
      return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(post.meta_description || excerpt(post.content, 300))}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/posts</link>
    <description>Yazılım, backend, mobil ve web teknolojileri üzerine makaleler.</description>
    <language>tr-TR</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
