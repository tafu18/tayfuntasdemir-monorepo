'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main className="flex-1 flex flex-col min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />

      {/* Vakt-i Huzur Floating Icon */}
      <a 
        href="https://vaktihuzur.com.tr" 
        target="_blank"
        rel="noopener noreferrer"
        title="Vakt-i Huzur"
        className="fixed bottom-[150px] right-[20px] z-[1000] bg-white w-[60px] h-[60px] flex items-center justify-center rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 duration-300"
      >
        <Image src="/hilal.png" alt="Vakt-i Huzur" width={50} height={50} className="w-[50px] h-[50px] object-contain" />
      </a>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/905385972318?text=Merhaba%20Tayfun%20Taşdemir,%20Nasılsın?"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[80px] right-[20px] z-[1000] bg-[#25D366] text-white w-[60px] h-[60px] rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.2)] flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <i className="fab fa-whatsapp text-3xl"></i>
      </a>
    </>
  );
}
