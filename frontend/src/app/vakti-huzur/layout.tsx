import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vakt-i Huzur Mobil Uygulaması | Ezan Vakitleri & Kıble',
  description: 'Vakt-i Huzur iOS ve Android mobil uygulaması. Tam vakitli ezan alarmları, pusula ile kıble tespiti, zikirmatik ve günlük İslami içerikler.',
  keywords: ['Vakt-i Huzur', 'Namaz Vakitleri Uygulaması', 'Kıble Bulucu', 'Zikirmatik', 'Hicri Takvim', 'İslami Mobil Uygulama'],
  openGraph: {
    title: 'Vakt-i Huzur | Ezan Vakitleri & İslami Yaşam Uygulaması',
    description: 'Namaz vakitleri, kıble yönü bulma ve zikirmatik içeren Vakt-i Huzur uygulamasını hemen indirin.',
    images: ['/hilal.png'],
  },
};

export default function VaktiHuzurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
