import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çoklu Dil Canlı Kod Stüdyosu - HTML, JS, Python',
  description: 'HTML, JavaScript ve Python kodlarınızı canlı olarak çalıştırın, test edin ve anında önizleyin.',
  keywords: ['Çoklu Dil Kod Stüdyosu', 'HTML Viewer', 'Python Online', 'JS Runner', 'Canlı Kod Çalıştırıcı'],
};

export default function HtmlViewerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}