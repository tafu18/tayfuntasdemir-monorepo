'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Edit2, Trash2, ExternalLink, Calendar, EyeIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  medium_link?: string;
  publish_at?: string;
  created_at: string;
  views: number;
  viewsToday?: number;
}

export default function AdminPostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchPosts = async (currentPage: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/posts/admin/list?page=${currentPage}&limit=10`);
      setPosts(response.data.data || []);
      setTotalPages(response.data.lastPage || 1);
    } catch (err: any) {
      console.error(err);
      setError('Gönderiler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleDelete = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/posts/${id}`);
      setSuccess('Yazı başarıyla silindi.');
      setDeleteConfirmId(null);
      
      // If we are on a page where we deleted the last item, go back a page
      if (posts.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchPosts(page);
      }
    } catch (err: any) {
      console.error(err);
      setError('Yazı silinirken bir hata oluştu.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Gönderi Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Blog yazılarını ekleyin, düzenleyin veya silin.
          </p>
        </div>
        <Link
          href="/admin/posts/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/25 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Yeni Gönderi Oluştur
        </Link>
      </div>

      {/* Notifications */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-lg">Henüz hiç gönderi bulunmuyor.</p>
            <p className="text-sm mt-1">Hemen üstteki butondan ilk gönderinizi yazın!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/55 dark:bg-zinc-900/55 text-slate-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Sıra No</th>
                  <th className="px-6 py-4">Başlık</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Medium Link</th>
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4">Okunma / Bugün</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-sm">
                {posts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 text-slate-400 dark:text-zinc-500 font-medium">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200 max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400">
                          Yayınlandı
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400">
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {post.medium_link ? (
                        <a
                          href={post.medium_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-blue font-bold hover:underline"
                        >
                          Medium Aç <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.publish_at || post.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <EyeIcon className="w-4 h-4 text-slate-400" />
                        <span>{post.views}</span>
                        <span className="text-xs text-emerald-500">/ +{post.viewsToday || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/admin/posts/show/${post.id}`}
                          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                          title="Görüntüle"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <Link
                          href={`/admin/posts/edit/${post.id}`}
                          className="p-2 text-slate-400 hover:text-brand-blue hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </Link>
                        
                        {deleteConfirmId === post.id ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-xl border border-red-100 dark:border-red-950/50">
                            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 mr-1">Emin misiniz?</span>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded-lg cursor-pointer"
                            >
                              Evet
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 px-2 py-0.5 cursor-pointer"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl transition-all cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/20 dark:bg-zinc-900/10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Önceki
            </button>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Sayfa {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
