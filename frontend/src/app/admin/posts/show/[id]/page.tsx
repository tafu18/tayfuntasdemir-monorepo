'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, getImageUrl } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Calendar, Eye, FileText, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PostViewRecord {
  id: number;
  viewed_at: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  image?: string;
  medium_link?: string;
  publish_at?: string;
  created_at: string;
  views: number;
  postViews?: PostViewRecord[];
}

export default function AdminPostShow() {
  const params = useParams();
  const id = params.id;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPostDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/posts/admin/${id}`);
      setPost(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Gönderi detayları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

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

  if (error || !post) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Hata</h3>
        <p className="text-sm text-red-600 dark:text-red-500 mb-4">{error || 'Gönderi bulunamadı.'}</p>
        <button
          onClick={fetchPostDetails}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
              Gönderi Detayları
            </h1>
          </div>
        </div>
        <Link
          href={`/admin/posts/edit/${post.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          <Edit2 className="w-4.5 h-4.5" /> Yazıyı Düzenle
        </Link>
      </div>

      {/* Main Details and View History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Contents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header section with image */}
            {post.image && (
              <div className="w-full h-64 bg-slate-50 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800/80">
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                {post.status === 'published' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Yayınlandı
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    Taslak
                  </span>
                )}
                <span className="text-slate-400 dark:text-zinc-500 text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(post.publish_at || post.created_at)}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {post.title}
              </h2>
            </div>

            {post.medium_link && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-zinc-400">Bu gönderi Medium üzerinde de yayınlanmış.</span>
                <a
                  href={post.medium_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-bold hover:underline"
                >
                  Medium'da Oku <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Content text */}
            <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
              <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                İçerik
              </h4>
              <div className="text-slate-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm font-['Plus_Jakarta_Sans',sans-serif]">
                {post.content}
              </div>
            </div>
          </div>
        </div>

        {/* View Statistics */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-brand-blue/10 text-brand-blue">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Toplam Okunma
                </p>
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                  {post.views}
                </p>
              </div>
            </div>
          </div>

          {/* View History List */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80">
              <h3 className="font-['Outfit'] font-bold text-base text-slate-950 dark:text-white">
                Görüntüleme Geçmişi
              </h3>
              <p className="text-slate-400 dark:text-zinc-500 text-xs">
                Yazının görüntülendiği son tarihler.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/30 p-4">
              {!post.postViews || post.postViews.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs text-center">
                  Henüz görüntüleme kaydı yok.
                </div>
              ) : (
                post.postViews.map((view, i) => (
                  <div key={view.id} className="py-2.5 px-2 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 rounded-xl transition-all">
                    <span className="text-slate-400 dark:text-zinc-500 font-medium">#{post.postViews!.length - i}</span>
                    <span className="text-slate-700 dark:text-zinc-300 font-semibold">{formatDate(view.viewed_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
