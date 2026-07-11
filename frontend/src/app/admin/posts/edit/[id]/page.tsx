'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, getImageUrl } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertCircle, Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminPostEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [mediumLink, setMediumLink] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get(`/posts/admin/${id}`);
        const post = response.data;
        setTitle(post.title || '');
        setContent(post.content || '');
        setStatus(post.status || 'draft');
        setMediumLink(post.medium_link || '');
        setImageUrl(post.image || '');
        
        if (post.publish_at) {
          // Format Date to yyyy-MM-ddThh:mm for datetime-local input
          const date = new Date(post.publish_at);
          const offset = date.getTimezoneOffset();
          const localDate = new Date(date.getTime() - (offset * 60 * 1000));
          setPublishAt(localDate.toISOString().slice(0, 16));
        } else {
          setPublishAt('');
        }
      } catch (err: any) {
        console.error(err);
        setError('Yazı detayları yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError('');
      
      const formData = new FormData();
      formData.append('image', file);
      
      setImageUploading(true);
      try {
        const response = await api.post('/posts/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data && response.data.success) {
          setImageUrl(response.data.url);
        } else {
          setError('Görsel yüklenemedi.');
        }
      } catch (err) {
        console.error(err);
        setError('Görsel yükleme hatası. Lütfen tekrar deneyin.');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = {
        title,
        content,
        status,
        image: imageUrl || null,
        medium_link: mediumLink || null,
      };

      if (publishAt) {
        payload.publish_at = new Date(publishAt).toISOString();
      } else {
        payload.publish_at = null;
      }

      await api.put(`/posts/${id}`, payload);
      setSuccess('Yazı başarıyla güncellendi! Gönderi listesine yönlendiriliyorsunuz...');
      
      setTimeout(() => {
        router.push('/admin/posts');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Yazı güncellenirken bir hata oluştu.');
      }
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/posts"
          className="p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Yazıyı Düzenle
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Blog yazısını güncelleyin ve kaydedin.
          </p>
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

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Başlık
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gönderi başlığı..."
            className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm transition-all"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            İçerik
          </label>
          <textarea
            id="content"
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Blog yazısı içeriğini buraya girin (Markdown veya düz metin destekler)..."
            className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm font-mono transition-all"
          />
        </div>

        {/* Grid fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Durum
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm transition-all"
            >
              <option value="draft">Taslak (Draft)</option>
              <option value="published">Yayınla (Published)</option>
            </select>
          </div>

          {/* Publish At */}
          <div>
            <label htmlFor="publishAt" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Planlanan Yayınlanma Tarihi (Opsiyonel)
            </label>
            <input
              id="publishAt"
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm transition-all"
            />
          </div>
        </div>

        {/* Medium Link */}
        <div>
          <label htmlFor="mediumLink" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Medium Linki (Opsiyonel)
          </label>
          <input
            id="mediumLink"
            type="url"
            value={mediumLink}
            onChange={(e) => setMediumLink(e.target.value)}
            placeholder="https://medium.com/@kullanici/gonderi-linki"
            className="block w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm transition-all"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Görsel
          </label>
          <div className="mt-1 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-48 h-32 bg-slate-50 dark:bg-zinc-950 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400">
              {imageUrl ? (
                <img src={getImageUrl(imageUrl)} alt="Görsel önizleme" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[10px]">Resim Yok</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-2">
              <div className="relative">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="imageFile"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-750 dark:text-zinc-250 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" /> {imageUploading ? 'Yükleniyor...' : 'Görsel Değiştir'}
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Mevcut görseli koruyabilir veya yeni bir tane yükleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6 flex justify-end gap-3">
          <Link
            href="/admin/posts"
            className="px-6 py-3 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-xl text-sm font-bold text-slate-650 dark:text-zinc-350 transition-colors cursor-pointer"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={isSaving || imageUploading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
}
