'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Calendar, Eye, Phone, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMessages = async (currentPage: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/contact/admin/list?page=${currentPage}&limit=10`);
      setMessages(response.data.data || []);
      setTotalPages(response.data.lastPage || 1);
    } catch (err: any) {
      console.error(err);
      setError('Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page]);

  const toggleStatus = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/contact/admin/${id}/toggle-status`);
      const updatedMessage = response.data;
      
      // Update message state locally
      setMessages(messages.map((m) => {
        if (m.id === id) {
          return { ...m, status: updatedMessage.status };
        }
        return m;
      }));
      setSuccess('Mesaj durumu güncellendi.');
      
      // Clear success notification after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Mesaj durumu güncellenirken bir hata oluştu.');
    }
  };

  const formatDate = (dateStr: string) => {
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
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Gelen Mesajlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Ziyaretçilerinizden gelen iletişim formlarını yönetin.
          </p>
        </div>
        <button
          onClick={() => fetchMessages(page)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-850 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
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

      {/* Messages Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-lg">Henüz hiç mesaj bulunmuyor.</p>
            <p className="text-sm mt-1">İletişim formundan gönderilecek mesajlar burada listelenecektir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/55 dark:bg-zinc-900/55 text-slate-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Sıra No</th>
                  <th className="px-6 py-4">Gönderen</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Mesaj</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-sm">
                {messages.map((msg, index) => (
                  <tr key={msg.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 text-slate-400 dark:text-zinc-500 font-medium">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">
                      {msg.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                      {msg.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                      {msg.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {msg.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                      {msg.message}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(msg.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          msg.status
                            ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                        }`}
                      >
                        {msg.status ? 'Cevaplandı' : 'Cevaplanmadı'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(msg.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/contact/show/${msg.id}`}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all inline-flex items-center"
                        title="Mesajı Görüntüle"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </Link>
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
              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-650 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-850 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Önceki
            </button>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Sayfa {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-650 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-850 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
