import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim | Tayfun Taşdemir',
  description: 'Tayfun Taşdemir ile iletişime geçin. Projeler, iş birliği teklifleri, yazılım danışmanlığı ve sorularınız için mesaj gönderin.',
  keywords: ['Tayfun Taşdemir İletişim', 'Yazılımcı İletişim', 'Freelance Yazılımcı', 'Yazılım Danışmanlığı'],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
