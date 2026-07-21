'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Ben Kimim?', path: '/about' },
    { name: 'Projelerim', path: '/projects' },
    { name: 'Gönderiler', path: '/posts' },
    { name: 'Uygulamalar', path: '/applications' },
    { name: 'Namaz Vakitleri', path: '/namaz-vakitleri' },
    { name: 'İletişim', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
            Tayfun Taşdemir
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path.split('?')[0]));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-blue dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}

          {/* Vakt-i Huzur Button */}
          <a
            href="https://vaktihuzur.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 py-2 px-4 bg-brand-dark hover:bg-brand-blue text-white rounded-full text-xs font-bold transition-all transform hover:scale-105 shadow-md flex items-center border border-brand-blue/30"
          >
            <Image src="/hilal.png" alt="Vakt-i Huzur Logo" width={20} height={20} className="w-5 h-5 mr-2 object-contain" />
            Vakt-i Huzur
          </a>
        </nav>

        {/* Mobile Nav Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex p-2 rounded-lg text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white lg:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-1"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path.split('?')[0]));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <a
              href="https://vaktihuzur.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center py-2.5 px-4 mt-2 bg-brand-dark hover:bg-brand-blue text-white rounded-lg font-bold border border-brand-blue/50"
            >
              <Image src="/hilal.png" alt="Vakt-i Huzur Logo" width={20} height={20} className="w-5 h-5 mr-3 object-contain" />
              Vakt-i Huzur'u İndir
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
