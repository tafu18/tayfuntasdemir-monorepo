import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yazılım & Teknoloji Makaleleri | Tayfun Taşdemir Blog',
  description: 'Tayfun Taşdemir kişisel blogundaki tüm yazılım, mobil uygulama, backend, Node.js ve teknoloji makaleleri.',
  keywords: ['Yazılım Blogu', 'Node.js Dersleri', 'React Rehberi', 'Teknoloji Makaleleri', 'Tayfun Taşdemir Blog'],
};

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
