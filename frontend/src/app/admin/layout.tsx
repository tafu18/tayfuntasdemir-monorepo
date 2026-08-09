'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Mail, LogOut, Menu, X, ChevronRight, User, Send, CheckCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Check if we are on the login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token) {
      setIsAuthenticated(true);
      if (userStr) {
        try {
          setAdminUser(JSON.parse(userStr));
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoading(false);
      return;
    }

    // Token yoksa Authelia SSO doğrulaması dene
    const attemptSSO = async () => {
      try {
        const res = await fetch('/api/auth/sso');
        if (res.ok) {
          const data = await res.json();
          if (data && data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setAdminUser(data.user);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('SSO Auto-login failed:', err);
      }

      // SSO başarısızsa veya yerel ortamdaysa login sayfasına yönlendir
      router.push('/admin/login');
      setIsLoading(false);
    };

    attemptSSO();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    router.push('/admin/login');
    router.refresh();
  };

  const handleSendReport = async () => {
    if (reportStatus === 'loading') return;
    setReportStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/report/send-daily`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Sunucu hatası');
      setReportStatus('success');
    } catch {
      setReportStatus('error');
    } finally {
      setTimeout(() => setReportStatus('idle'), 4000);
    }
  };

  const menuItems = [
    { name: 'Genel Bakış', path: '/admin', icon: LayoutDashboard },
    { name: 'Gönderiler', path: '/admin/posts', icon: FileText },
    { name: 'Mesajlar', path: '/admin/contact', icon: Mail },
    { name: 'Test Case Excel', path: '/admin/test-sheets', icon: FileSpreadsheet },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-zinc-800">
          <span className="font-['Outfit'] font-extrabold text-xl bg-gradient-to-r from-brand-blue to-emerald-500 bg-clip-text text-transparent">
            Admin Paneli
          </span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
          {/* Admin User Info */}
          {adminUser && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800/50">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">{adminUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{adminUser.email}</p>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/15'
                      : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </Link>
              );
            })}
          </nav>

          {/* Send Report Button */}
          <div className="pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-500 px-1 mb-2">Araçlar</p>
            <button
              id="send-daily-report-btn"
              onClick={handleSendReport}
              disabled={reportStatus === 'loading'}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                reportStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                  : reportStatus === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-500'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              {reportStatus === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : reportStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : reportStatus === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>
                {reportStatus === 'loading' ? 'Gönderiliyor...' : reportStatus === 'success' ? 'Rapor Gönderildi!' : reportStatus === 'error' ? 'Gönderilemedi!' : 'Günlük Rapor Gönder'}
              </span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30">
          <span className="font-['Outfit'] font-extrabold text-lg bg-gradient-to-r from-brand-blue to-emerald-500 bg-clip-text text-transparent">
            Admin Paneli
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-zinc-900 z-50 flex flex-col md:hidden"
              >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-zinc-800">
                  <span className="font-['Outfit'] font-extrabold text-lg bg-gradient-to-r from-brand-blue to-emerald-500 bg-clip-text text-transparent">
                    Admin Paneli
                  </span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
                  {/* Admin User Info */}
                  {adminUser && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800/50">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">{adminUser.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{adminUser.email}</p>
                      </div>
                    </div>
                  )}

                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-brand-blue text-white'
                              : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Send Report - Mobile */}
                  <div className="pt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-500 px-1 mb-2">Araçlar</p>
                    <button
                      onClick={() => { handleSendReport(); setIsSidebarOpen(false); }}
                      disabled={reportStatus === 'loading'}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        reportStatus === 'success'
                          ? 'bg-emerald-50 text-emerald-600'
                          : reportStatus === 'error'
                          ? 'bg-red-50 text-red-500'
                          : 'text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                      }`}
                    >
                      {reportStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : reportStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : reportStatus === 'error' ? <AlertCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                      <span>{reportStatus === 'loading' ? 'Gönderiliyor...' : reportStatus === 'success' ? 'Gönderildi!' : reportStatus === 'error' ? 'Gönderilemedi!' : 'Günlük Rapor Gönder'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
