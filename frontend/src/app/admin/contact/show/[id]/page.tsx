'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, User, Phone, Calendar, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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

export default function AdminContactMessageShow() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMessageDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/contact/admin/${id}`);
      setMessage(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Mesaj detayları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessageDetails();
  }, [id]);

  const toggleStatus = async () => {
    if (!message) return;
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/contact/admin/${message.id}/toggle-status`);
      setMessage({ ...message, status: response.data.status, updated_at: response.data.updated_at });
      setSuccess('Mesaj durumu başarıyla güncellendi.');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Mesaj durumu güncellenirken bir hata oluştu.');
    }
  };

  const formatDate = (dateStr: string) => {
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

  if (error || !message) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Hata</h3>
        <p className="text-sm text-red-600 dark:text-red-500 mb-4">{error || 'Mesaj bulunamadı.'}</p>
        <button
          onClick={fetchMessageDetails}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/contact"
          className="p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Mesaj Detayları
          </h1>
        </div>
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

      {/* Message Info Box */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
          <div>
            <h3 className="font-['Outfit'] font-extrabold text-lg text-slate-900 dark:text-white">
              Gönderen Bilgileri
            </h3>
            <p className="text-slate-400 dark:text-zinc-500 text-xs">
              İletişim formunu dolduran ziyaretçinin detayları.
            </p>
          </div>
          <div>
            <button
              onClick={toggleStatus}
              className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                message.status
                  ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              {message.status ? 'Cevaplandı olarak İşaretli' : 'Cevaplanmadı olarak İşaretli'}
            </button>
          </div>
        </div>

        {/* Sender details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-400 shrink-0 border border-slate-100 dark:border-zinc-800/50">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">İsim Soyisim</p>
              <p className="font-extrabold text-slate-800 dark:text-zinc-200 mt-0.5">{message.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-400 shrink-0 border border-slate-100 dark:border-zinc-800/50">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">E-posta Adresi</p>
              <a href={`mailto:${message.email}`} className="font-extrabold text-brand-blue hover:underline mt-0.5 block">{message.email}</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-400 shrink-0 border border-slate-100 dark:border-zinc-800/50">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Telefon Numarası</p>
              {message.phone ? (
                <a href={`tel:${message.phone}`} className="font-extrabold text-slate-800 dark:text-zinc-200 hover:underline mt-0.5 block">{message.phone}</a>
              ) : (
                <p className="font-bold text-slate-400 mt-0.5">-</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-400 shrink-0 border border-slate-100 dark:border-zinc-800/50">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Gönderilme Tarihi</p>
              <p className="font-extrabold text-slate-800 dark:text-zinc-200 mt-0.5">{formatDate(message.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Mesaj
          </h4>
          <div className="p-5 bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 rounded-2xl text-slate-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">
            {message.message}
          </div>
        </div>

        {/* Actions back */}
        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6 flex justify-between items-center text-xs">
          <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Son Güncelleme: {formatDate(message.updated_at)}
          </span>
          <Link
            href="/admin/contact"
            className="px-5 py-2.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-855 rounded-xl font-bold text-slate-650 dark:text-zinc-350 transition-colors"
          >
            Mesaj Listesine Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
