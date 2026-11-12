import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/posts', {
  title: 'Yazılım & Teknoloji Makaleleri | Tayfun Taşdemir Blog',
  description: 'Tayfun Taşdemir kişisel blogundaki tüm yazılım, mobil uygulama, backend, Node.js ve teknoloji makaleleri.',
  keywords: ['Yazılım Blogu', 'Node.js Dersleri', 'React Rehberi', 'Teknoloji Makaleleri', 'Tayfun Taşdemir Blog'],
});

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
