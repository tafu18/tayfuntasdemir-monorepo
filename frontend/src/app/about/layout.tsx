import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/about', {
  title: 'Hakkımda | Tayfun Taşdemir',
  description: 'Tayfun Taşdemir kimdir? 3+ yıllık backend ve mobil geliştirme tecrübesi, teknik yetenekler, eğitim ve kariyer geçmişi.',
  keywords: ['Tayfun Taşdemir', 'Hakkımda', 'Yazılım Uzmanı Biyografi', 'Backend Geliştirici', 'Node.js Developer', 'React Developer'],
  openGraph: {
    title: 'Hakkımda | Tayfun Taşdemir',
    description: 'Tayfun Taşdemir deneyimleri, teknik yetenekleri ve kariyer detayları.',
  },
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
