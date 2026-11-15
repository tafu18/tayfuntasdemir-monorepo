import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/kisa-link', {
  title: 'KısaLink - Hızlı Link Kısaltıcı & QR Kod Üretici',
  description:
    'Uzun URL adreslerini saniyeler içinde kısaltın, özel takma ad belirleyin, geçerlilik süresi ekleyin, QR kod indirin ve tıklanmaları takip edin.',
  keywords: ['Link Kısaltıcı', 'URL Shortener', 'Kısa Link', 'QR Kod', 'Tıklanma Takibi'],
});

export default function KisaLinkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
