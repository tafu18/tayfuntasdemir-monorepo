import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/hash', {
  title: 'Hash Üretici - MD5, SHA-1, SHA-256 ve SHA-512',
  description: 'Metinlerin ve dosyaların MD5, SHA-1, SHA-256 ve SHA-512 hash değerlerini tarayıcınızda anında hesaplayın.',
  keywords: ['Hash Üretici', 'MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'Hash Hesaplama', 'Checksum'],
});

export default function HashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
