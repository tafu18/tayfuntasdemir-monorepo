import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/webhook', {
  title: 'Webhook Yakalayıcı & İstek İnceleyici - Online RequestBin',
  description:
    'Anlık benzersiz webhook URL oluşturun, gelen HTTP GET/POST/PUT/DELETE isteklerinin header, query ve body verilerini canlı inceleyin.',
  keywords: ['Webhook Tester', 'RequestBin', 'HTTP Inspector', 'Webhook Yakalayıcı'],
});

export default function WebhookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
