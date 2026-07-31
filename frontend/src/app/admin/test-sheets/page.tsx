'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, FileSpreadsheet, Check, X, Loader2 } from 'lucide-react';

interface TestSheet {
  id: number;
  name: string;
  spreadsheetId: string;
  range: string;
  isActive: boolean;
}

export default function TestSheetsAdminPage() {
  const [sheets, setSheets] = useState<TestSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    spreadsheetId: '',
    range: '',
    isActive: true,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchSheets = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/test-sheets/all`);
      if (res.ok) {
        const data = await res.json();
        setSheets(data);
      }
    } catch (err) {
      console.error('Sheet listesi çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.spreadsheetId) return;

    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${apiUrl}/api/test-sheets/${editingId}`
        : `${apiUrl}/api/test-sheets`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: '', spreadsheetId: '', range: 'Sayfa1!A:Z', isActive: true });
        setEditingId(null);
        fetchSheets();
      }
    } catch (err) {
      console.error('Kaydetme hatası:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sheet: TestSheet) => {
    setEditingId(sheet.id);
    setForm({
      name: sheet.name,
      spreadsheetId: sheet.spreadsheetId,
      range: sheet.range,
      isActive: sheet.isActive,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu test dosyasını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/test-sheets/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSheets();
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', spreadsheetId: '', range: 'Sayfa1!A:Z', isActive: true });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FileSpreadsheet className="w-7 h-7 text-brand-blue" />
          Test Case Excel Yönetimi
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Botun tarayacağı Google Sheet dosyalarını ve sayfa aralıklarını buradan ekleyebilirsiniz.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 mb-4">
          {editingId ? 'E-Tablo Düzenle' : 'Yeni E-Tablo Ekle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Tablo İsmi / Başlık
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Sprint 24 Test Suite"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 1M1hc1D8gGAtZoVJ3lgomfQEq1QES..."
                value={form.spreadsheetId}
                onChange={(e) => setForm({ ...form, spreadsheetId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Sayfa ve Aralık (Range) - <span className="text-brand-blue font-normal">Tüm sekmeler için boş bırakabilirsiniz</span>
              </label>
              <input
                type="text"
                placeholder="Tüm sekmeler için boş bırakın (Örn: Sayfa1!A:Z)"
                value={form.range}
                onChange={(e) => setForm({ ...form, range: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                />
                <span>Bot Tarafından Taransın (Aktif)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingId ? 'Güncelle' : 'Kaydet'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-200">Kayıtlı Test Dosyaları</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <span>Yükleniyor...</span>
          </div>
        ) : sheets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
            Henüz eklenmiş bir E-Tablo bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Tablo Adı</th>
                  <th className="px-6 py-3.5 font-semibold">Spreadsheet ID</th>
                  <th className="px-6 py-3.5 font-semibold">Aralık</th>
                  <th className="px-6 py-3.5 font-semibold">Durum</th>
                  <th className="px-6 py-3.5 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {sheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{sheet.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">{sheet.spreadsheetId}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-300">{sheet.range}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sheet.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {sheet.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(sheet)}
                        className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sheet.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
