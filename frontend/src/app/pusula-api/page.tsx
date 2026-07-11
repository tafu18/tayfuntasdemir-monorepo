'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Compass, Info, X, Menu } from 'lucide-react';

type HistoryItem = {
  id: number;
  url: string;
  method: string;
  bodyType: string;
  headers: { key: string, value: string }[];
  jsonBody: string;
  multipartBody: { key: string, type: string, value: string }[];
};

export default function PusulaApi() {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const MAX_HISTORY_COUNT = 100;

  const [form, setForm] = useState({
    url: 'https://tayfuntasdemir.com.tr/api/stats',
    method: 'GET',
    bodyType: 'json',
    headers: [{ key: 'Accept', value: 'application/json' }],
    jsonBody: '{}',
    multipartBody: [{ key: 'user_name', type: 'text', value: 'Tayfun' }]
  });

  const [mainTab, setMainTab] = useState('headers'); // 'headers' | 'body'
  const [response, setResponse] = useState<any>(null);
  const [resTab, setResTab] = useState('body'); // 'body' | 'headers'

  // Load history on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('apiTesterHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('History parse error:', error);
    }

    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth, 10));
    } else {
      setSidebarWidth(window.innerWidth < 768 ? 280 : 320);
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      const minWidth = 240;
      const maxWidth = window.innerWidth / 2;

      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
      }
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const saveRequestToHistory = () => {
    const requestToSave = { ...form, id: Date.now() };
    let newHistory = history.filter(item => item.url !== requestToSave.url || item.method !== requestToSave.method);
    newHistory.unshift(requestToSave);
    if (newHistory.length > MAX_HISTORY_COUNT) {
      newHistory.pop();
    }
    setHistory(newHistory);
    localStorage.setItem('apiTesterHistory', JSON.stringify(newHistory));
  };

  const loadRequestFromHistory = (id: number) => {
    const requestToLoad = history.find(item => item.id === id);
    if (requestToLoad) {
      const cloned = JSON.parse(JSON.stringify(requestToLoad));
      if (cloned.multipartBody) {
        cloned.multipartBody.forEach((item: any) => {
          if (item.type === 'file') item.value = '';
        });
      }
      setForm(cloned);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const deleteHistoryItem = (id: number) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('apiTesterHistory', JSON.stringify(newHistory));
  };

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    saveRequestToHistory();

    let headersObject: any = {};
    try {
      form.headers.forEach(h => {
        if (h.key) headersObject[h.key] = h.value;
      });
      if (form.bodyType === 'json' && form.jsonBody.trim() !== '' && form.jsonBody.trim() !== '{}') {
        JSON.parse(form.jsonBody);
      }
    } catch (err) {
      setResponse({ error: 'Geçersiz JSON formatı. Lütfen Body alanını kontrol edin.' });
      setIsLoading(false);
      return;
    }

    try {
      let bodyData = null;
      if (form.method !== 'GET' && form.method !== 'HEAD') {
        if (form.bodyType === 'json') {
          bodyData = form.jsonBody;
        }
      }

      const fetchOptions: RequestInit = {
        method: form.method,
        headers: headersObject,
      };

      if (form.method !== 'GET' && form.method !== 'HEAD' && form.bodyType === 'json') {
        fetchOptions.body = form.jsonBody;
      }

      const startTime = performance.now();
      const res = await fetch('/api/pusula-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.url,
          method: form.method,
          headers: headersObject,
          bodyType: form.bodyType,
          jsonBody: form.jsonBody
        })
      });

      const endTime = performance.now();
      const data = await res.json();

      if (!res.ok && data.error) {
        setResponse({ error: data.error });
      } else {
        setResponse({
          status: data.status,
          duration: Math.round(endTime - startTime),
          headers: data.headers,
          body: data.body
        });
      }
    } catch (err: any) {
      setResponse({ error: 'Ağ hatası veya sunucuya ulaşılamıyor. Proxy başarısız oldu.' });
    } finally {
      setIsLoading(false);
    }
  };

  const prettyPrintJson = (data: any) => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-100 font-['Plus_Jakarta_Sans',sans-serif]">

        <style dangerouslySetInnerHTML={{
          __html: `
          .status-2xx { color: #16a34a; }
          .status-3xx { color: #ca8a04; }
          .status-4xx { color: #f97316; }
          .status-5xx { color: #dc2626; }
          pre { white-space: pre-wrap; word-wrap: break-word; background-color: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem; max-height: 400px; overflow-y: auto; }
        `}} />

        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 absolute inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 h-full transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'}`}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="p-4 border-b flex justify-center items-center bg-slate-900">
            <Compass className="w-12 h-12 text-blue-500 mr-2" />
            <span className="text-2xl font-bold text-white tracking-tight">Pusula<span className="text-blue-500">API</span></span>
          </div>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Geçmiş</h2>
            <p className="text-sm text-gray-500">Toplam: {history.length} / 100</p>
          </div>
          <div className="overflow-y-auto flex-grow">
            {history.length === 0 ? (
              <p className="p-4 text-gray-500">Henüz bir istek kaydedilmedi.</p>
            ) : (
              history.map(item => (
                <div key={item.id} onClick={() => loadRequestFromHistory(item.id)} className="p-3 border-b cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-sm ${item.method === 'GET' ? 'text-green-600' : item.method === 'POST' ? 'text-blue-600' : item.method === 'DELETE' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {item.method}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="text-gray-400 hover:text-red-600 text-xs font-bold">Sil</button>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{item.url}</p>
                  <p className="text-xs text-gray-400">{new Date(item.id).toLocaleString('tr-TR')}</p>
                </div>
              ))
            )}
          </div>
          <div
            onMouseDown={(e) => { if (window.innerWidth >= 768) { e.preventDefault(); setIsResizing(true); } }}
            className="hidden md:block w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors duration-200 absolute inset-y-0 right-0 z-50"
          ></div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8 relative">
          <button onClick={toggleSidebar} className="md:hidden absolute top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md text-gray-600 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex justify-between items-start mb-6">
            <div className="md:pl-0 pl-12">
              <h1 className="text-3xl font-bold text-slate-800">PusulaAPI</h1>
              <p className="text-gray-600">API isteklerinize yön verin. Basit, hızlı ve güçlü bir test ortamı.</p>
            </div>
            <button onClick={() => setInfoModalOpen(true)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors flex-shrink-0">
              <Info className="w-5 h-5" />
              <span className="hidden sm:inline">Bilgi</span>
            </button>
          </div>

          <form onSubmit={sendRequest} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="border rounded p-2 font-mono bg-gray-50 w-full md:w-auto flex-shrink-0 outline-none focus:border-blue-500 text-slate-800">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://api.example.com/data"
                required
                className="border rounded p-2 w-full font-mono flex-grow outline-none focus:border-blue-500 text-slate-800"
              />
              <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 disabled:bg-blue-300 w-full md:w-auto flex-shrink-0 transition-colors">
                {isLoading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>

            <div>
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex gap-6 overflow-x-auto">
                  <button type="button" onClick={() => setMainTab('headers')} className={`py-2 px-1 border-b-2 font-medium whitespace-nowrap ${mainTab === 'headers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Headers</button>
                  <button type="button" onClick={() => setMainTab('body')} className={`py-2 px-1 border-b-2 font-medium whitespace-nowrap ${mainTab === 'body' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Body</button>
                </nav>
              </div>

              {mainTab === 'headers' && (
                <div>
                  {form.headers.map((header, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => { const newH = [...form.headers]; newH[index].key = e.target.value; setForm({ ...form, headers: newH }); }}
                        placeholder="Key"
                        className="border rounded p-2 font-mono text-sm w-full md:w-1/3 outline-none focus:border-blue-500 text-slate-800"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => { const newH = [...form.headers]; newH[index].value = e.target.value; setForm({ ...form, headers: newH }); }}
                        placeholder="Value"
                        className="border rounded p-2 font-mono text-sm w-full md:flex-grow outline-none focus:border-blue-500 text-slate-800"
                      />
                      <button type="button" onClick={() => { const newH = [...form.headers]; newH.splice(index, 1); setForm({ ...form, headers: newH }); }} className="text-red-500 hover:text-red-700 font-bold px-2 self-end md:self-center">X</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm({ ...form, headers: [...form.headers, { key: '', value: '' }] })} className="text-sm text-blue-600 hover:text-blue-800 mt-2">+ Header Ekle</button>
                </div>
              )}

              {mainTab === 'body' && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center text-slate-700"><input type="radio" checked={form.bodyType === 'json'} onChange={() => setForm({ ...form, bodyType: 'json' })} className="mr-1" /> Raw (JSON)</label>
                    <label className="flex items-center text-slate-700 opacity-50 cursor-not-allowed" title="Proxy desteği şimdilik sadece JSON içindir."><input type="radio" disabled checked={form.bodyType === 'multipart'} onChange={() => setForm({ ...form, bodyType: 'multipart' })} className="mr-1" /> Multipart/Form-Data (Yakında)</label>
                  </div>
                  {form.bodyType === 'json' && (
                    <textarea
                      rows={8}
                      value={form.jsonBody}
                      onChange={(e) => setForm({ ...form, jsonBody: e.target.value })}
                      className="w-full border rounded p-2 font-mono text-sm outline-none focus:border-blue-500 text-slate-800"
                      placeholder='{ "key": "value" }'
                    ></textarea>
                  )}
                </div>
              )}
            </div>
          </form>

          {response && (
            <div className="bg-white p-6 rounded-lg shadow-md animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Response</h2>
              {response.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                  <p className="font-bold">Araç Hatası</p>
                  <p>{response.error}</p>
                </div>
              )}
              {response.status && (
                <>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mb-4 font-mono text-lg text-slate-800">
                    <div>Status: <b className={`status-${String(response.status)[0]}xx`}>{response.status}</b></div>
                    <div>Time: <b className="text-blue-600">{response.duration} ms</b></div>
                  </div>
                  <div>
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex gap-6 overflow-x-auto">
                        <button type="button" onClick={() => setResTab('body')} className={`py-2 px-1 border-b-2 font-medium whitespace-nowrap ${resTab === 'body' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Body</button>
                        <button type="button" onClick={() => setResTab('headers')} className={`py-2 px-1 border-b-2 font-medium whitespace-nowrap ${resTab === 'headers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Headers</button>
                      </nav>
                    </div>
                    {resTab === 'body' && (
                      <pre><code>{prettyPrintJson(response.body)}</code></pre>
                    )}
                    {resTab === 'headers' && (
                      <pre><code>{prettyPrintJson(response.headers)}</code></pre>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </main>

        {/* Info Modal */}
        {infoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center"><Compass className="mr-2 text-blue-500" /> PusulaAPI Hakkında</h2>
                <button onClick={() => setInfoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <p className="text-lg text-gray-700">PusulaAPI, API isteklerinize yön vermek için tasarlanmış basit, hızlı ve güçlü bir test aracıdır.</p>
                <hr className="my-4" />
                <h3 className="font-bold text-gray-800 mb-2">Temel Özellikler</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li><strong>Farklı Metotlar:</strong> GET, POST, PUT, PATCH, ve DELETE gibi tüm temel HTTP metotlarını destekler.</li>
                  <li><strong>Esnek Body:</strong> Hem <code>application/json</code> hem de dosya yüklemeleri için <code>multipart/form-data</code> (yakında) formatında istekler gönderebilirsiniz.</li>
                  <li><strong>Dinamik Header'lar:</strong> İsteklerinize kolayca <code>Authorization</code>, <code>Content-Type</code> gibi başlıklar ekleyebilirsiniz.</li>
                  <li><strong>İstek Geçmişi:</strong> Yaptığınız son 100 istek otomatik olarak kaydedilir. Tek tıkla eski isteklerinizi forma geri yükleyebilirsiniz.</li>
                  <li><strong>Proxy Mimarisi:</strong> Arka planda çalışan vekil sunucu sayesinde, tarayıcıların CORS kısıtlamalarına takılmadan API'leri test edebilirsiniz.</li>
                </ul>
                <p className="mt-6 text-sm text-gray-500">Bu araç, Laravel arayüzünden Next.js'e başarıyla port edilmiştir.</p>
              </div>
              <div className="p-4 border-t bg-gray-50 text-right">
                <button onClick={() => setInfoModalOpen(false)} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">Kapat</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}