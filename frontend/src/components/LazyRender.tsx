import React from 'react';

interface LazyRenderProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
}

/**
 * Ekran dışındaki bölümlerin render/paint maliyetini tarayıcıya erteletir
 * (`content-visibility: auto`), ama içeriği SSR HTML'inde tutar.
 * Önceki IntersectionObserver sürümü içeriği HTML'den tamamen çıkarıyordu;
 * bu da arama motorlarının yazı linklerini ve metinleri görmesini engelliyordu.
 */
export default function LazyRender({ children, height = '200px', className = '' }: LazyRenderProps) {
  const size = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      className={className}
      style={{ contentVisibility: 'auto', containIntrinsicSize: `auto ${size}` }}
    >
      {children}
    </div>
  );
}
