import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kod Karşılaştırma & Diff Aracı - Online Code Diff',
  description: 'İki metin veya kod bloğu arasındaki farkları satır satır ve karakter karakter karşılaştırın.',
  keywords: ['Kod Karşılaştırma', 'Code Diff', 'Text Diff', 'Fark Bulucu', 'Diff Checker'],
};

export default function CodeDiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
