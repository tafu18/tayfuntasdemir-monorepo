import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTML Viewer & Live Compiler - Canlı HTML/CSS/JS Çalıştırıcı',
  description: 'HTML, CSS ve JavaScript kodlarınızı tarayıcınızda anında çalıştırın, test edin ve canlı önizleyin.',
  keywords: ['HTML Viewer', 'HTML Compiler', 'Canlı HTML Önizleme', 'HTML Editor Online', 'CSS JS Runner'],
};

export default function HtmlViewerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}