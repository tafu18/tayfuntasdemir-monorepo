'use client';

import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import { 
  FileImage, FileText, Combine, Scissors, ArrowRightLeft, 
  Trash2, Download, UploadCloud, Check, Copy, AlertCircle, 
  FileUp, Palette, Sparkles, Loader2, Play, ChevronUp, ChevronDown 
} from 'lucide-react';

export default function Converter() {
  const [activeTab, setActiveTab] = useState<'image' | 'pdf' | 'docx'>('image');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ----------------------------------------------------
  // GÖRSEL MODÜLÜ (IMAGE CONVERTER) STATE & LOGIC
  // ----------------------------------------------------
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);
  const [imglyLib, setImglyLib] = useState<any>(null);

  // Load @imgly/background-removal dynamically on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@imgly/background-removal')
        .then((module) => {
          setImglyLib(module);
        })
        .catch((err) => {
          console.error('background-removal loading failed', err);
        });
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const processImage = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let activeImageSrc = imagePreview;

      // 1. Yapay Zeka ile Arka Plan Kaldırma (Opsiyonel)
      if (removeBgEnabled) {
        setLoadingText('Yapay zeka modeli yükleniyor ve arka plan kaldırılıyor (İlk çalıştırma biraz sürebilir)...');
        if (!imglyLib) {
          throw new Error('Arka plan kaldırma modülü henüz yüklenmedi. Lütfen sayfayı yenileyip tekrar deneyin.');
        }
        
        // Process background removal client-side
        const blob = await imglyLib.removeBackground(activeImageSrc, {
          progress: (key: string, current: number, total: number) => {
            const pct = Math.round((current / total) * 100);
            setLoadingText(`Arka plan kaldırılıyor: %${isNaN(pct) ? 0 : pct}`);
          }
        });
        activeImageSrc = URL.createObjectURL(blob);
      }

      setLoadingText('Görsel işleniyor ve dönüştürülüyor...');

      // 2. HTML5 Canvas ile Format Çevirici & Arka Plan Rengi
      const img = new Image();
      img.src = activeImageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context alınamadı.');

      // Arka plan rengini ekle (JPEG veya arka plan rengi ekleme seçilmişse)
      if (targetFormat === 'jpeg' || removeBgEnabled) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Görseli canvas üzerine çiz
      ctx.drawImage(img, 0, 0);

      // Çıktıyı al
      let mimeType = 'image/png';
      if (targetFormat === 'jpeg') mimeType = 'image/jpeg';
      if (targetFormat === 'webp') mimeType = 'image/webp';

      const outputDataUrl = canvas.toDataURL(mimeType, 0.9);

      // İndirme işlemini tetikle
      const link = document.createElement('a');
      const originalName = imageFile?.name.substring(0, imageFile.name.lastIndexOf('.')) || 'gorsel';
      link.download = `${originalName}_donusturulmus.${targetFormat}`;
      link.href = outputDataUrl;
      link.click();

      setSuccessMessage('Görsel başarıyla dönüştürüldü ve indirildi!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Görsel işleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  // ----------------------------------------------------
  // PDF MODÜLÜ (PDF MERGE & SPLIT) STATE & LOGIC
  // ----------------------------------------------------
  const [pdfFiles, setPdfFiles] = useState<{ id: string; file: File; name: string; pagesCount: number }[]>([]);
  const [splitPdfFile, setSplitPdfFile] = useState<File | null>(null);
  const [splitPagesText, setSplitPagesText] = useState<string>('');
  const [organizePages, setOrganizePages] = useState<{ id: string; pageIndex: number; thumbnailUrl: string; selected: boolean }[]>([]);
  const [pdfLibModule, setPdfLibModule] = useState<any>(null);

  // Dynamic import of pdf-lib to run client-side only
  useEffect(() => {
    import('pdf-lib').then((module) => {
      setPdfLibModule(module);
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (!sourceIndexStr) return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (sourceIndex === targetIndex) return;

    const newPages = [...organizePages];
    const [removed] = newPages.splice(sourceIndex, 1);
    newPages.splice(targetIndex, 0, removed);
    setOrganizePages(newPages);

    updateSplitPagesText(newPages);
  };

  const togglePageSelection = (index: number) => {
    const newPages = [...organizePages];
    newPages[index].selected = !newPages[index].selected;
    setOrganizePages(newPages);

    updateSplitPagesText(newPages);
  };

  const updateSplitPagesText = (pages: typeof organizePages) => {
    const selected = pages.filter(p => p.selected);
    if (selected.length === 0) {
      setSplitPagesText('');
      return;
    }
    
    const nums = selected.map(p => p.pageIndex + 1);
    const ranges: string[] = [];
    let start = nums[0];
    let end = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === end + 1) {
        end = nums[i];
      } else {
        if (start === end) {
          ranges.push(start.toString());
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = nums[i];
        end = nums[i];
      }
    }
    if (start === end) {
      ranges.push(start.toString());
    } else {
      ranges.push(`${start}-${end}`);
    }
    
    setSplitPagesText(ranges.join(', '));
  };

  const handleSplitPagesTextChange = (text: string) => {
    setSplitPagesText(text);
    
    const pagesToSelect: number[] = [];
    const parts = text.split(',');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            pagesToSelect.push(i - 1);
          }
        }
      } else {
        const pageNum = parseInt(trimmed, 10);
        if (!isNaN(pageNum)) {
          pagesToSelect.push(pageNum - 1);
        }
      }
    });

    setOrganizePages(prev => prev.map(item => ({
      ...item,
      selected: pagesToSelect.includes(item.pageIndex)
    })));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && pdfLibModule) {
      const newFiles = [...pdfFiles];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await pdfLibModule.PDFDocument.load(arrayBuffer);
          const pagesCount = pdfDoc.getPageCount();
          newFiles.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            pagesCount
          });
        } catch (err) {
          console.error('PDF yükleme hatası', err);
          setErrorMessage(`${file.name} geçerli bir PDF dosyası değil.`);
        }
      }
      setPdfFiles(newFiles);
    }
  };

  const removePdfFile = (id: string) => {
    setPdfFiles(pdfFiles.filter(item => item.id !== id));
  };

  const movePdfFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pdfFiles.length - 1) return;

    const newFiles = [...pdfFiles];
    const temp = newFiles[index];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    setPdfFiles(newFiles);
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2 || !pdfLibModule) return;
    setLoading(true);
    setLoadingText('PDF sayfaları birleştiriliyor...');
    try {
      const mergedPdf = await pdfLibModule.PDFDocument.create();

      for (const item of pdfFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const srcPdf = await pdfLibModule.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'birlestirilmis_dokuman.pdf';
      link.click();
      setSuccessMessage('PDF dosyaları başarıyla birleştirildi ve indirildi!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('PDF birleştirme işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSplitPdfFile(file);
      setSuccessMessage('');
      setErrorMessage('');
      setLoading(true);
      setLoadingText('PDF sayfaları çözümleniyor ve önizlemeler oluşturuluyor...');
      setOrganizePages([]);
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const pagesCount = pdf.numPages;
        
        // Initialize placeholders
        const initialPages = Array.from({ length: pagesCount }, (_, i) => ({
          id: `${i}-${Math.random().toString(36).substring(2, 5)}`,
          pageIndex: i,
          thumbnailUrl: '',
          selected: true
        }));
        setOrganizePages(initialPages);
        setSplitPagesText(`1-${pagesCount}`);
        setLoading(false); // Hide overlay to show incremental rendering
        
        // Render incrementally
        for (let i = 1; i <= pagesCount; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 }); // smaller scale for thumbnails
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context!,
            viewport: viewport,
            canvas: canvas
          }).promise;
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          setOrganizePages(prev => prev.map((item, idx) => 
            idx === i - 1 ? { ...item, thumbnailUrl } : item
          ));
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage('PDF sayfaları yüklenirken veya önizlemeler oluşturulurken bir hata oluştu.');
        setLoading(false);
      }
    }
  };

  const splitPdf = async () => {
    if (!splitPdfFile || !pdfLibModule) return;
    setLoading(true);
    setLoadingText('Seçili sayfalar ayıklanıyor ve yeni PDF oluşturuluyor...');
    try {
      const arrayBuffer = await splitPdfFile.arrayBuffer();
      const srcPdf = await pdfLibModule.PDFDocument.load(arrayBuffer);
      
      // Get selected page indexes in order
      const pagesToExtract = organizePages
        .filter(item => item.selected)
        .map(item => item.pageIndex);

      if (pagesToExtract.length === 0) {
        throw new Error('Lütfen ayıklamak/düzenlemek için en az bir sayfa seçin.');
      }

      const newPdf = await pdfLibModule.PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcPdf, pagesToExtract);
      copiedPages.forEach((page: any) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duzenlenmis_${splitPdfFile.name}`;
      link.click();
      setSuccessMessage('Seçtiğiniz sayfalar başarıyla ayıklandı, düzenlendi ve indirildi!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'PDF düzenleme işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // BELGE MODÜLÜ (DOCX TO PDF) STATE & LOGIC
  // ----------------------------------------------------
  const [docxFile, setDocxFile] = useState<File | null>(null);

  const handleDocxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocxFile(file);
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const convertDocxToPdf = async () => {
    if (!docxFile) return;
    setLoading(true);
    setLoadingText('Word dosyası çözümleniyor (tamamen yerel)...');
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      
      // Load mammoth dynamically
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;

      setLoadingText('Belge sayfaları oluşturuluyor...');

      // Raporu geçici bir div içinde render et
      const tempDiv = document.createElement('div');
      tempDiv.id = 'tempDocxDiv';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '794px'; // Standard A4 width in pixels at 96 DPI
      tempDiv.style.padding = '50px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.innerHTML = htmlContent;

      // Add stylesheet overrides for print-like formatting
      const styleSheet = document.createElement('style');
      styleSheet.innerHTML = `
        #tempDocxDiv img { max-width: 100%; height: auto; display: block; margin: 15px auto; }
        #tempDocxDiv table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
        #tempDocxDiv th, #tempDocxDiv td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        #tempDocxDiv th { background-color: #f8fafc; font-weight: bold; }
        #tempDocxDiv h1 { font-size: 24px; font-weight: 800; margin: 24px 0 12px 0; color: #0f172a; }
        #tempDocxDiv h2 { font-size: 20px; font-weight: 700; margin: 20px 0 10px 0; color: #1e293b; }
        #tempDocxDiv h3 { font-size: 16px; font-weight: 600; margin: 16px 0 8px 0; color: #334155; }
        #tempDocxDiv p { margin-bottom: 12px; color: #334155; }
        #tempDocxDiv ul, #tempDocxDiv ol { margin-left: 20px; margin-bottom: 12px; }
        #tempDocxDiv li { margin-bottom: 4px; }
      `;
      tempDiv.appendChild(styleSheet);

      document.body.appendChild(tempDiv);

      // Load html2canvas and jspdf dynamically
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(tempDiv, {
        scale: 2, // higher resolution
        useCORS: true
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 295; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${docxFile.name.substring(0, docxFile.name.lastIndexOf('.'))}.pdf`);
      setSuccessMessage('Word belgesi başarıyla PDF formatına dönüştürüldü ve indirildi!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Belge dönüştürme işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    {
      question: "Dosyalarım güvende mi? Sunucuya yükleniyor mu?",
      answer: "Kesinlikle güvende. Bu araç tamamen tarayıcınızın (client-side) belleğinde çalışır. Hiçbir görsel, Word belgesi veya PDF dosyası sunucuya gönderilmez. Gizlilik öncelikli projeleriniz için mükemmel bir çözümdür."
    },
    {
      question: "Arka plan kaldırma (Background Removal) nasıl çalışır?",
      answer: "Yapay zeka modeli tarayıcınıza bir kez indirilir ve tüm hesaplama gücünü bilgisayarınızın işlemcisinden alarak çalışır. Dolayısıyla internetiniz kapalı olsa dahi arka plan temizleme işlemi başarıyla tamamlanabilir."
    },
    {
      question: "PDF sayfalarını nasıl sıralayabilirim?",
      answer: "PDF Atölyesi sekmesinden birden çok dosya ekleyebilir, sağdaki ok butonlarıyla PDF'lerinizin sırasını değiştirebilir ve tek tıkla birleştirebilirsiniz."
    }
  ];

  return (
    <PageTransition>
      <div className="bg-white dark:bg-zinc-950 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white flex items-center justify-center gap-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-purple-600">Format Atölyesi</span>
            </h1>
            <p className="mt-4 text-lg text-zinc-550 dark:text-zinc-400 max-w-2xl mx-auto">
              %100 Güvenli, tarayıcı tabanlı görsel, PDF ve Word format dönüştürücü.
            </p>
          </div>

          {/* Alert Messages */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-3">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-12 h-12 animate-spin text-brand-blue mb-4" />
              <p className="text-lg font-semibold px-4 text-center max-w-md">{loadingText || 'İşlem yapılıyor, lütfen bekleyin...'}</p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex justify-center border-b border-zinc-200 dark:border-zinc-800 mb-10">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('image')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'image'
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <FileImage className="w-4 h-4" />
                Görsel Modülü
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'pdf'
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Combine className="w-4 h-4" />
                PDF Modülü
              </button>
              <button
                onClick={() => setActiveTab('docx')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'docx'
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                Word to PDF
              </button>
            </nav>
          </div>

          {/* TAB 1: GÖRSEL ATÖLYESİ */}
          {activeTab === 'image' && (
            <div className="space-y-8">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Upload & Options */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand-blue" />
                      Görsel Ayarları & Format
                    </h3>
                    
                    {/* Format Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Hedef Format</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setTargetFormat(fmt)}
                            className={`py-3 px-4 rounded-xl border text-sm font-bold uppercase transition-all ${
                              targetFormat === fmt
                                ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-750 dark:text-zinc-350 hover:bg-zinc-100'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Background Removal Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                          Arka Planı Kaldır (AI)
                        </div>
                        <div className="text-xs text-zinc-500">Cihazınızda çalışarak arka planı temizler</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={removeBgEnabled}
                        onChange={(e) => setRemoveBgEnabled(e.target.checked)}
                        className="w-5 h-5 text-brand-blue border-zinc-300 rounded focus:ring-brand-blue"
                      />
                    </div>

                    {/* Background Color Picker */}
                    {(removeBgEnabled || targetFormat === 'jpeg') && (
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="font-semibold text-zinc-900 dark:text-white text-sm">Arka Plan Rengi</label>
                          <span className="text-xs uppercase font-mono text-zinc-500">{bgColor}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-12 h-12 rounded-lg border-0 cursor-pointer"
                          />
                          <div className="flex-1 grid grid-cols-5 gap-2">
                            {['#ffffff', '#000000', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
                              <button
                                key={color}
                                onClick={() => setBgColor(color)}
                                className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Convert Trigger */}
                    <button
                      onClick={processImage}
                      disabled={!imagePreview}
                      className="w-full py-4 px-6 rounded-2xl bg-brand-blue hover:bg-brand-blue text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg shadow-brand-blue/10 transition-all duration-200"
                    >
                      <Download className="w-5 h-5" />
                      Görseli Dönüştür ve İndir
                    </button>
                  </div>

                  {/* Right Column: Upload Area */}
                  <div className="flex flex-col justify-center">
                    <label className="block text-sm font-semibold text-zinc-750 dark:text-zinc-350 mb-2">Görsel Yükle</label>
                    <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/50 transition-colors min-h-[300px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {imagePreview ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <img 
                            src={imagePreview} 
                            alt="Yüklenen görsel" 
                            className="max-h-[220px] rounded-xl object-contain shadow-md mb-4 bg-zinc-200 dark:bg-zinc-850" 
                          />
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{imageFile?.name}</p>
                          <p className="text-xs text-zinc-500 mt-1">Yeni görsel seçmek için tıklayın veya sürükleyin</p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-12 h-12 text-zinc-400 mb-4" />
                          <p className="text-base font-semibold text-zinc-750 dark:text-zinc-350">Resim dosyasını buraya sürükleyin veya seçin</p>
                          <p className="text-xs text-zinc-500 mt-1">PNG, JPEG, WebP, GIF formatları desteklenir</p>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PDF MODÜLÜ */}
          {activeTab === 'pdf' && (
            <div className="space-y-10">
              
              {/* PDF MERGE SECTION */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                  <Combine className="w-5 h-5 text-brand-blue" />
                  PDF Dosyalarını Birleştirme (Merge)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* PDF Upload */}
                  <div>
                    <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/50 transition-colors min-h-[200px]">
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handlePdfUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-10 h-10 text-zinc-400 mb-3" />
                      <p className="text-sm font-semibold text-zinc-750 dark:text-zinc-350">PDF Dosyaları Ekleyin</p>
                      <p className="text-xs text-zinc-500 mt-1">Birden fazla PDF seçebilirsiniz</p>
                    </div>
                  </div>

                  {/* PDF List & Reorder */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Eklenen Dosyalar ({pdfFiles.length})</h4>
                      {pdfFiles.length === 0 ? (
                        <div className="text-sm text-zinc-450 dark:text-zinc-500 bg-white dark:bg-zinc-950 p-6 rounded-2xl text-center border border-zinc-200 dark:border-zinc-800">
                          Henüz PDF eklenmedi.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {pdfFiles.map((item, idx) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                              <div className="flex items-center gap-2 overflow-hidden mr-2">
                                <span className="text-xs bg-zinc-100 dark:bg-zinc-850 px-2 py-1 rounded font-bold">{idx + 1}</span>
                                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.name}</span>
                                <span className="text-xs text-zinc-500 flex-shrink-0">({item.pagesCount} Sayfa)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => movePdfFile(idx, 'up')} 
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded text-zinc-500 disabled:opacity-30"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => movePdfFile(idx, 'down')} 
                                  disabled={idx === pdfFiles.length - 1}
                                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded text-zinc-500 disabled:opacity-30"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => removePdfFile(item.id)} 
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={mergePdfs}
                      disabled={pdfFiles.length < 2}
                      className="mt-6 w-full py-4 px-6 rounded-2xl bg-brand-blue hover:bg-brand-blue text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg shadow-brand-blue/10 transition-all duration-200"
                    >
                      <Combine className="w-5 h-5" />
                      PDF&apos;leri Birleştir ve İndir
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF SPLIT / EXTRACT SECTION */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-brand-blue" />
                  PDF Sayfalarını Ayıklama & Düzenleme (Split & Organize)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* PDF Upload */}
                  <div>
                    <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/50 transition-colors min-h-[180px]">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleSplitPdfUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-10 h-10 text-zinc-400 mb-3" />
                      {splitPdfFile ? (
                        <div>
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{splitPdfFile.name}</p>
                          <p className="text-xs text-zinc-500 mt-1">Dosyayı değiştirmek için tıklayın</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-zinc-750 dark:text-zinc-350">Düzenlenecek PDF Seçin</p>
                          <p className="text-xs text-zinc-500 mt-1">Tek bir PDF yükleyin</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Extract Options */}
                  <div className="flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Ayıklanacak Sayfalar</label>
                        <input
                          type="text"
                          placeholder="Örn: 1, 3-5, 8"
                          value={splitPagesText}
                          onChange={(e) => handleSplitPagesTextChange(e.target.value)}
                          className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Görsel seçiciyi kullandığınızda bu alan otomatik güncellenir. Virgülle ayırabilir veya tire ile aralık belirtebilirsiniz.</p>
                      </div>
                    </div>

                    <button
                      onClick={splitPdf}
                      disabled={!splitPdfFile || !splitPagesText}
                      className="mt-6 w-full py-4 px-6 rounded-2xl bg-brand-blue hover:bg-brand-blue text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg shadow-brand-blue/10 transition-all duration-200"
                    >
                      <Scissors className="w-5 h-5" />
                      Sayfaları Düzenle ve İndir
                    </button>
                  </div>
                </div>

                {/* Visual Page Organizer Grid */}
                {splitPdfFile && organizePages.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                          Görsel Sayfa Düzenleyici
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Sayfaları sürükleyerek yeniden sıralayabilir, dahil etmek istediğiniz sayfaları seçip kaldırabilirsiniz.
                        </p>
                      </div>
                      <div className="text-xs bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-bold">
                        Toplam {organizePages.length} sayfa / Seçilen: {organizePages.filter(p => p.selected).length}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {organizePages.map((item, idx) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx)}
                          className={`relative border rounded-2xl p-2 bg-white dark:bg-zinc-950 transition-all cursor-move select-none group ${
                            item.selected 
                              ? 'border-brand-blue ring-2 ring-brand-blue/20 shadow-md' 
                              : 'border-zinc-200 dark:border-zinc-800 opacity-50 hover:opacity-80'
                          }`}
                        >
                          {/* Checkbox Overlay */}
                          <div className="absolute top-3 left-3 z-10">
                            <input 
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => togglePageSelection(idx)}
                              className="w-5 h-5 text-brand-blue border-zinc-300 rounded focus:ring-brand-blue cursor-pointer"
                            />
                          </div>
                          
                          {/* Page Badge */}
                          <div className="absolute top-3 right-3 z-10 bg-zinc-900/80 dark:bg-zinc-800/90 text-white text-xs px-2 py-0.5 rounded-md font-bold">
                            Sayfa {item.pageIndex + 1}
                          </div>

                          {/* Thumbnail Canvas Rendered Image */}
                          <div 
                            onClick={() => togglePageSelection(idx)}
                            className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden mb-2 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 cursor-pointer"
                          >
                            {item.thumbnailUrl ? (
                              <img 
                                src={item.thumbnailUrl} 
                                alt={`Page ${item.pageIndex + 1}`} 
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                                <span className="text-[10px] text-zinc-400">Yükleniyor...</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Order Indicator */}
                          <div className="text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 py-1">
                            Sıra: {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: WORD TO PDF */}
          {activeTab === 'docx' && (
            <div className="space-y-8">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto">
                <FileText className="w-16 h-16 text-brand-blue mx-auto mb-6" />
                
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Word to PDF</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8">
                  .docx uzantılı Word belgelerinizi tarayıcı motoru yardımıyla tamamen yerel olarak PDF formatına dönüştürün.
                </p>

                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-850 rounded-2xl p-8 mb-6 relative cursor-pointer hover:border-brand-blue/50 transition-colors">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleDocxUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                  {docxFile ? (
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-250">{docxFile.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">Dosyayı değiştirmek için tıklayın veya sürükleyin</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-350">Bir Word (.docx) belgesi seçin</p>
                      <p className="text-xs text-zinc-500 mt-1">Word şablonları çözümlenerek PDF&apos;e dönüştürülecektir</p>
                    </>
                  )}
                </div>

                <button
                  onClick={convertDocxToPdf}
                  disabled={!docxFile}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-blue hover:bg-brand-blue text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg shadow-brand-blue/10 transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                  PDF&apos;e Dönüştür ve İndir
                </button>
              </div>
            </div>
          )}

          {/* SSS Section */}
          <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-12">
            <FAQ
              title="Sıkça Sorulan Sorular"
              subtitle="Format Atölyesi hakkında merak ettiğiniz detaylar"
              items={faqItems}
            />
          </div>

          {/* Diğer Araçlar */}
          <div className="mt-16">
            <OtherTools />
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
