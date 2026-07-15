'use client';

import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Columns, MinusCircle, PlusCircle, ArrowLeftRight, GraduationCap, ArrowRightCircle } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

const defaultBefore = `// BEFORE: Spagetti Controller, N+1 Query Problem & Fat Controller
public function index() {
    $users = User::where('status', 'active')->get();
    foreach ($users as $user) {
        // N+1 Query trigger inside loop
        $user->profile = Profile::where('user_id', $user->id)->first();
        $user->posts_count = Post::where('user_id', $user->id)->count();
    }
    return view('users', ['users' => $users]);
}`;

const defaultAfter = `// AFTER: Clean Code, Eager Loading (No N+1) & Query Scopes
public function index() {
    // Clean, optimized query with eager loading and model scopes
    $users = User::active()->with('profile')->withCount('posts')->get();
    return view('users', compact('users'));
}`;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCodeWithDiff(code: string, type: 'before' | 'after') {
  const lines = code.split('\n');
  return lines.map((line, idx) => {
    const isDiff = line.trim().startsWith('//') || 
                   line.includes('N+1') || 
                   line.includes('with(') || 
                   line.includes('withCount(') ||
                   line.includes('active()') || 
                   line.includes('User::where') || 
                   line.includes('foreach') || 
                   line.includes('Profile::where') || 
                   line.includes('Post::where');

    const bgClass = isDiff ? (type === 'before' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)') : 'transparent';
    const numColor = isDiff ? (type === 'before' ? '#f87171' : '#34d399') : '#858585';
    const borderCol = isDiff ? (type === 'before' ? '#ef4444' : '#10b981') : 'transparent';
    
    return `<div style="background-color: ${bgClass}; display: flex; padding: 0.1rem 0.5rem; border-left: 3px solid ${borderCol};">
        <span style="width: 25px; color: ${numColor}; text-align: right; margin-right: 15px; user-select: none; font-size: 0.75rem; line-height: 1.5;">${idx + 1}</span>
        <span style="line-height: 1.5; color: ${isDiff ? (type === 'before' ? '#fca5a5' : '#a7f3d0') : '#d4d4d4'}; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace;">${escapeHtml(line) || ' '}</span>
    </div>`;
  }).join('');
}

export default function CodeDiff() {
  const [beforeCode, setBeforeCode] = useState(defaultBefore);
  const [afterCode, setAfterCode] = useState(defaultAfter);
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const sliderBoxRef = useRef<HTMLDivElement>(null);
  const layerBeforeRef = useRef<HTMLDivElement>(null);
  const layerAfterRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!sliderBoxRef.current) return;
    const rect = sliderBoxRef.current.getBoundingClientRect();
    let posX = clientX - rect.left;
    
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;

    const percentage = (posX / rect.width) * 100;
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const onMouseUp = () => setIsDragging(false);
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onTouchEnd = () => setIsDragging(false);
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [isDragging]);

  const syncScrollBefore = () => {
    if (layerBeforeRef.current && layerAfterRef.current) {
      layerAfterRef.current.scrollTop = layerBeforeRef.current.scrollTop;
      layerAfterRef.current.scrollLeft = layerBeforeRef.current.scrollLeft;
    }
  };

  const syncScrollAfter = () => {
    if (layerBeforeRef.current && layerAfterRef.current) {
      layerBeforeRef.current.scrollTop = layerAfterRef.current.scrollTop;
      layerBeforeRef.current.scrollLeft = layerAfterRef.current.scrollLeft;
    }
  };

  return (
    <PageTransition>
      <div className="diff-page min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4">
        <style dangerouslySetInnerHTML={{__html: `
          .diff-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(245, 158, 11, 0.08); color: #f59e0b; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.25rem; }
          .diff-header h1 { font-family: 'Outfit', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
          .diff-header h1 span { background: linear-gradient(135deg, #f59e0b, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          
          .diff-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06); position: relative; }
          .dark .diff-card { background: #09090b; border-color: #27272a; }
          .diff-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #f59e0b, #10b981); }
          
          .diff-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
          .dark .diff-toolbar { background: #18181b; border-color: #27272a; }
          
          .diff-dots { display: flex; gap: 6px; }
          .diff-dots span { width: 10px; height: 10px; border-radius: 50%; }
          .diff-dots span:nth-child(1) { background: #ef4444; }
          .diff-dots span:nth-child(2) { background: #f59e0b; }
          .diff-dots span:nth-child(3) { background: #22c55e; }
          
          .slider-viewer-box { position: relative; width: 100%; height: 420px; border: 1px solid #2b2b2b; border-radius: 16px; overflow: hidden; background-color: #1e1e1e; user-select: none; }
          .diff-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; padding: 1.5rem 0; white-space: pre; overflow: auto; }
          .layer-before { background-color: #1e1e1e; color: #d4d4d4; z-index: 2; border-right: none; overflow: hidden; }
          .layer-after { background-color: #1e1e1e; color: #d4d4d4; z-index: 1; }
          
          .slider-handle { position: absolute; top: 0; bottom: 0; width: 3px; background-color: #f59e0b; z-index: 10; cursor: ew-resize; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); transform: translateX(-50%); }
          .slider-button { width: 36px; height: 36px; background-color: #f59e0b; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff; font-size: 0.8rem; }
          .dark .slider-button { border-color: #000; }
          
          .code-textarea { background-color: #1e1e1e !important; color: #d4d4d4 !important; border: 1px solid #2d2d2d !important; border-radius: 12px !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.82rem !important; padding: 1.25rem !important; line-height: 1.5 !important; resize: vertical; outline: none !important; box-shadow: none !important; }
          .code-textarea:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important; }
          
          .edu-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.75rem; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04); }
          .dark .edu-card { background: #09090b; border-color: #27272a; }
        `}} />

        <div className="max-w-[1100px] mx-auto flex flex-col gap-12">
          
          <div className="text-center mt-4">
            <div className="diff-badge">
              <Columns className="w-3.5 h-3.5" />
              <span>Geliştirici Araçları</span>
            </div>
            <h1 className="text-slate-900 dark:text-white"><span>Code Diff</span> Slider</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[520px] mx-auto">
              Eski ve yeni kod bloklarını dikey sürgüyü kaydırarak pürüzsüzce karşılaştırın.
            </p>
          </div>

          <div className="diff-card">
            <div className="diff-toolbar">
              <div className="diff-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="text-xs font-semibold text-slate-500 select-none">VS Code Style Interactive Diff Viewer</div>
            </div>

            <div className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Öncesi (Before / Deleted)</label>
                    <span className="text-xs text-red-500 font-semibold flex items-center gap-1.5"><MinusCircle className="w-3.5 h-3.5" /> Kırmızı Çıkarılan Alan</span>
                  </div>
                  <textarea 
                    rows={10} 
                    className="code-textarea w-full" 
                    value={beforeCode}
                    onChange={(e) => setBeforeCode(e.target.value)}
                    placeholder="Eski kod bloğunu buraya girin..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Sonrası (After / Added)</label>
                    <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5"><PlusCircle className="w-3.5 h-3.5" /> Yeşil Eklenen Alan</span>
                  </div>
                  <textarea 
                    rows={10} 
                    className="code-textarea w-full" 
                    value={afterCode}
                    onChange={(e) => setAfterCode(e.target.value)}
                    placeholder="Yeni kod bloğunu buraya girin..."
                  />
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sürgülü Karşılaştırma Önizlemesi (Sürükleyin)</label>
                <div className="slider-viewer-box" ref={sliderBoxRef}>
                  
                  <div 
                    className="diff-layer layer-before" 
                    ref={layerBeforeRef}
                    onScroll={syncScrollBefore}
                    style={{ width: `${sliderPosition}%`, display: sliderPosition <= 0.5 ? 'none' : 'block' }}
                    dangerouslySetInnerHTML={{ __html: renderCodeWithDiff(beforeCode, 'before') }}
                  />
                  
                  <div 
                    className="diff-layer layer-after" 
                    ref={layerAfterRef}
                    onScroll={syncScrollAfter}
                    dangerouslySetInnerHTML={{ __html: renderCodeWithDiff(afterCode, 'after') }}
                  />
                  
                  <div 
                    className="slider-handle" 
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={(e) => { setIsDragging(true); e.preventDefault(); }}
                    onTouchStart={() => setIsDragging(true)}
                  >
                    <div className="slider-button">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Eğitim ve Bilgilendirme */}
          <div className="space-y-8 mt-4">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-amber-500" /> Temiz Kod & Tasarım İlkeleri Rehberi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="edu-card">
                <h3 className="font-['Outfit'] font-bold text-[1.2rem] text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">✨</span> 
                  Clean Code (Temiz Kod) Nedir?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Temiz kod; okunması, değiştirilmesi ve bakımı kolay olan koddur. Kod yazarken kendimiz için değil, bizden sonra o kodu okuyacak geliştiriciler için yazarız.
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-2 list-disc pl-4">
                  <li><strong>Anlamlı İsimlendirmeler:</strong> Değişken isimleri ne amaçla yaratıldığını anlatmalıdır.</li>
                  <li><strong>Kısa Fonksiyonlar:</strong> Bir fonksiyon ideali 10-15 satırı geçmemeli ve tek bir görev yapmalıdır.</li>
                  <li><strong>Gereksiz Yorumlardan Kaçınma:</strong> Kod kendini anlatmalıdır, yorum satırları sadece "neden" yapıldığını açıklar.</li>
                </ul>
              </div>

              <div className="edu-card">
                <h3 className="font-['Outfit'] font-bold text-[1.2rem] text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><ArrowRightCircle className="w-4 h-4" /></span> 
                  DRY (Don't Repeat Yourself) Prensibi
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Kendini Tekrar Etme! Sistemdeki her bilgi veya mantık parçası, tek ve net bir temsil alanına sahip olmalıdır. Kod kopyalayıp yapıştırmak en büyük teknik borçtur (technical debt).
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-2 list-disc pl-4">
                  <li><strong>Tekrar Eden Sorgular:</strong> Veritabanı filtrelerini Eloquent Query Scope haline getirerek tek merkezde toplayın.</li>
                  <li><strong>Ortak Fonksiyonlar:</strong> Helper sınıfları, Helper fonksiyonları veya Laravel Servis sınıfları yazarak kod çoklamasının önüne geçin.</li>
                </ul>
              </div>
            </div>

            <div className="edu-card !mb-12">
              <h3 className="font-['Outfit'] font-bold text-[1.2rem] text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">🧱</span> 
                SOLID Tasarım Prensipleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="space-y-1">
                  <span className="w-8 h-8 rounded-full font-bold flex items-center justify-center mb-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">S</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Single Responsibility</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Bir sınıfın veya fonksiyonun değişmek için yalnızca bir nedeni olmalıdır.</p>
                </div>
                <div className="space-y-1">
                  <span className="w-8 h-8 rounded-full font-bold flex items-center justify-center mb-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">O</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Open/Closed</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Gelişime açık, değiştirmeye kapalı olmalıdır (Interface bağımlılıkları).</p>
                </div>
                <div className="space-y-1">
                  <span className="w-8 h-8 rounded-full font-bold flex items-center justify-center mb-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">L</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Liskov Substitution</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Türetilen alt sınıflar, üst sınıfların yerine hatasız kullanılabilmelidir.</p>
                </div>
                <div className="space-y-1">
                  <span className="w-8 h-8 rounded-full font-bold flex items-center justify-center mb-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">I</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Interface Segregation</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Büyük, her işi yapan tek bir arayüz yerine amaca yönelik küçük arayüzler yazılmalıdır.</p>
                </div>
                <div className="space-y-1">
                  <span className="w-8 h-8 rounded-full font-bold flex items-center justify-center mb-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">D</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Dependency Inversion</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Yüksek seviyeli modüller, somut sınıflara değil soyutlamalara bağımlı olmalıdır.</p>
                </div>
              </div>
            </div>
          </div>

          <OtherTools />
        </div>
      </div>
    </PageTransition>
  );
}
