import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/doviz', {
  title: 'Canlı Döviz Kurları & Altın Fiyatları - Döviz Çevirici',
  description: 'Dolar, Euro, Sterlin, Gram Altın, Çeyrek Altın ve kripto para canlı fiyat takibi ve döviz hesaplama çeviricisi.',
  keywords: ['Canlı Döviz', 'Dolar Kaç TL', 'Euro Kaç TL', 'Gram Altın Fiyatı', 'Döviz Çevirici', 'Altın Hesaplama'],
});

export default function DovizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
