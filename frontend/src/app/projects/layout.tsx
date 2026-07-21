import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tamamlanan Projeler | Tayfun Taşdemir',
  description: 'Tayfun Taşdemir tarafından geliştirilen ve katkıda bulunulan kurumsal yazılım projeleri, mobil uygulamalar ve dijital platformlar.',
  keywords: ['Tayfun Taşdemir Projeleri', 'Yazılım Portfolyosu', 'Web Projeleri', 'Mobil Projeler', 'React Next.js Portfolyo'],
  openGraph: {
    title: 'Tamamlanan Projeler | Tayfun Taşdemir',
    description: 'Geliştirilen ve katkı sağlanan kurumsal ve bireysel yazılım projeleri.',
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
