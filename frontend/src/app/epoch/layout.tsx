import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unix Epoch Time Dönüştürücü - Timestamp Converter',
  description: 'Unix Timestamp (Epoch time) değerlerini insan tarafından okunabilir tarihe ve tarihleri Epoch değerine dönüştürün.',
  keywords: ['Unix Epoch', 'Timestamp Dönüştürücü', 'Epoch Converter', 'Unix Zaman Çevirici'],
};

export default function EpochLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
