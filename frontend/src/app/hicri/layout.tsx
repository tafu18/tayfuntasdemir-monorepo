import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/hicri', {
  title: 'Hicri Takvim Çevirici - Hicri Miladi Tarih Dönüştürücü',
  description: 'Miladi tarihleri Hicri tarihe, Hicri tarihleri Miladi tarihe kolayca çevirin. Dini günler ve kandil tarihleri takvimi.',
  keywords: ['Hicri Takvim', 'Hicri Miladi Çevirici', 'Hicri Tarih Kaç', 'Dini Günler Takvimi', 'Ramazan Ne Zaman'],
});

export default function HicriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
