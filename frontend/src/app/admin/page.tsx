'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { FileText, Eye, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface PostStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
}

interface MessageStats {
  total: number;
  resolved: number;
  unresolved: number;
}

export default function AdminDashboard() {
  const [postStats, setPostStats] = useState<PostStats | null>(null);
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch Post Stats
      const postStatsRes = await api.get('/posts/admin/stats');
      setPostStats(postStatsRes.data);

      // 2. Fetch Messages List to aggregate message stats
      const messageListRes = await api.get('/contact/admin/list?limit=500');
      const messages = messageListRes.data.data || [];
      const total = messageListRes.data.total || messages.length;
      
      const resolved = messages.filter((m: any) => m.status === true || m.status === 1).length;
      const unresolved = total - resolved;

      setMessageStats({
        total,
        resolved,
        unresolved
      });
    } catch (err: any) {
      console.error(err);
      setError('İstatistikler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Hata Oluştu</h3>
        <p className="text-sm text-red-600 dark:text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Yeniden Dene
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Yazı',
      value: postStats?.totalPosts || 0,
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-500',
      link: '/admin/posts',
      subtext: `${postStats?.publishedPosts || 0} Yayınlanan / ${postStats?.draftPosts || 0} Taslak`,
    },
    {
      title: 'Toplam Okunma',
      value: postStats?.totalViews || 0,
      icon: Eye,
      color: 'bg-emerald-500/10 text-emerald-500',
      link: '/admin/posts',
      subtext: 'Tüm gönderilerin toplam okunma sayısı',
    },
    {
      title: 'Toplam Mesaj',
      value: messageStats?.total || 0,
      icon: Mail,
      color: 'bg-amber-500/10 text-amber-500',
      link: '/admin/contact',
      subtext: `${messageStats?.resolved} Cevaplanan / ${messageStats?.unresolved} Bekleyen`,
    },
  ];

  // Helper values for custom SVG charts
  const publishedRatio = postStats?.totalPosts 
    ? (postStats.publishedPosts / postStats.totalPosts) * 100 
    : 0;
  
  const draftRatio = postStats?.totalPosts 
    ? (postStats.draftPosts / postStats.totalPosts) * 100 
    : 0;

  // Doughnut parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const publishedStroke = (publishedRatio / 100) * circumference;
  const draftStroke = (draftRatio / 100) * circumference;

  // Message ratio
  const resolvedRatio = messageStats?.total 
    ? (messageStats.resolved / messageStats.total) * 100 
    : 0;
  const unresolvedRatio = messageStats?.total 
    ? (messageStats.unresolved / messageStats.total) * 100 
    : 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Genel Bakış
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Blog ve iletişim istatistiklerinin genel durumu.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Verileri Yenile
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-zinc-800/50 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-zinc-400">{card.subtext}</span>
                <Link href={card.link} className="text-brand-blue font-bold hover:underline">
                  Yönet
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Posts Stat Chart (SVG Doughnut) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm"
        >
          <h3 className="font-['Outfit'] font-bold text-lg text-slate-950 dark:text-white mb-6">
            Gönderi Durum Dağılımı
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {postStats?.totalPosts ? (
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgb(241, 245, 249)" className="dark:stroke-zinc-800" strokeWidth="12" />
                  {/* Published Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - publishedStroke}
                    strokeLinecap="round"
                  />
                  {/* Draft Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (publishedStroke + draftStroke)}
                    strokeLinecap="round"
                    className="origin-center"
                    style={{ transform: `rotate(${publishedRatio * 3.6}deg)` }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{postStats.totalPosts}</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Yazı</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 dark:text-zinc-500 text-sm">Görüntülenecek gönderi bulunmuyor.</p>
            )}

            <div className="space-y-4 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 sm:w-28 text-sm">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Yayınlanan</p>
                  <p className="text-xs text-slate-400">{postStats?.publishedPosts || 0} Yazı ({Math.round(publishedRatio)}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div className="flex-1 sm:w-28 text-sm">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Taslak</p>
                  <p className="text-xs text-slate-400">{postStats?.draftPosts || 0} Yazı ({Math.round(draftRatio)}%)</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message Stat Chart (SVG Progress Bars) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm"
        >
          <h3 className="font-['Outfit'] font-bold text-lg text-slate-950 dark:text-white mb-6">
            Mesaj Yanıtlanma Durumu
          </h3>
          <div className="space-y-6 py-2">
            <div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Cevaplanan Mesajlar
                </span>
                <span className="font-extrabold text-slate-950 dark:text-white">
                  {messageStats?.resolved || 0} / {messageStats?.total || 0} ({Math.round(resolvedRatio)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resolvedRatio}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Yanıt Bekleyen Mesajlar
                </span>
                <span className="font-extrabold text-slate-950 dark:text-white">
                  {messageStats?.unresolved || 0} / {messageStats?.total || 0} ({Math.round(unresolvedRatio)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unresolvedRatio}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/50 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-zinc-400">Okunmamış mesajlar için gelen kutunuzu kontrol etmeyi unutmayın.</span>
              <Link href="/admin/contact" className="text-brand-blue font-bold shrink-0 hover:underline">
                Gelen Kutusu
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
