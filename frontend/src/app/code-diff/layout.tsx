import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/code-diff', {
  title: 'Kod Karşılaştırma & Diff Aracı - Online Code Diff',
  description: 'İki metin veya kod bloğu arasındaki farkları satır satır ve karakter karakter karşılaştırın.',
  keywords: ['Kod Karşılaştırma', 'Code Diff', 'Text Diff', 'Fark Bulucu', 'Diff Checker'],
});

export default function CodeDiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
