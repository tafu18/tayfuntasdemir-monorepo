import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/contact', {
  title: 'İletişim | Tayfun Taşdemir',
  description: 'Tayfun Taşdemir ile iletişime geçin. Projeler, iş birliği teklifleri, yazılım danışmanlığı ve sorularınız için mesaj gönderin.',
  keywords: ['Tayfun Taşdemir İletişim', 'Yazılımcı İletişim', 'Freelance Yazılımcı', 'Yazılım Danışmanlığı'],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
