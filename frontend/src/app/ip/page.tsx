'use client';

import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Copy, Check, ShieldAlert, Zap, EyeOff, ChevronDown } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function IpAddress() {
  const [ipv4, setIpv4] = useState('Yükleniyor...');
  const [ipv6, setIpv6] = useState('Yükleniyor...');
  const [copiedv4, setCopiedv4] = useState(false);
  const [copiedv6, setCopiedv6] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Fetch IPv4
    const fetchIpv4 = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setIpv4(data.ip);
      } catch (e) {
        setIpv4('Bulunamadı');
      }
    };

    // Fetch IPv6
    const fetchIpv6 = async () => {
      try {
        const res = await fetch('https://api6.ipify.org?format=json');
        const data = await res.json();
        setIpv6(data.ip);
      } catch (e) {
        setIpv6('Desteklenmiyor veya Bulunamadı');
      }
    };

    fetchIpv4();
    fetchIpv6();
  }, []);

  const copyIp = (text: string, type: 'v4' | 'v6') => {
    if (!text || text === 'Yükleniyor...' || text.includes('Bulunamadı') || text.includes('Desteklenmiyor')) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'v4') {
        setCopiedv4(true);
        setTimeout(() => setCopiedv4(false), 2500);
      } else {
        setCopiedv6(true);
        setTimeout(() => setCopiedv6(false), 2500);
      }
    });
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4 relative z-0">
        
        {/* Background gradient */}
        <div className="fixed inset-0 pointer-events-none z-[-1]" style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(37,99,255,0.03) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(124,58,237,0.03) 0%, transparent 40%)'
        }}></div>

        <style dangerouslySetInnerHTML={{__html: `
          .ip-eyebrow { display: inline-block; background: rgba(37,99,255,0.1); color: #2563ff; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.5rem 1.25rem; border-radius: 100px; margin-bottom: 1.5rem; }
          .ip-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 32px; padding: 2.5rem; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.05); position: relative; z-index: 10; }
          .dark .ip-card { background: #09090b; border-color: #27272a; }
          .ip-card::before { content: ''; position: absolute; inset: -1px; border-radius: 33px; padding: 2px; background: linear-gradient(135deg, #2563ff, #7c3aed); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.3; pointer-events: none; }
          
          .ip-row { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
          .ip-label { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; tracking-wider; display: flex; align-items: center; gap: 0.5rem; }
          .dark .ip-label { color: #a1a1aa; }
          
          .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); animation: pulse-anim 2s infinite; }
          @keyframes pulse-anim { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
          
          .ip-flex { display: flex; align-items: center; gap: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 20px; transition: all 0.3s ease; }
          .dark .ip-flex { background: #18181b; border-color: #27272a; }
          .ip-flex:hover { border-color: #2563ff; background: #fff; box-shadow: 0 10px 30px -5px rgba(37,99,255,0.1); }
          .dark .ip-flex:hover { background: #000; box-shadow: 0 10px 30px -5px rgba(37,99,255,0.2); }
          
          .ip-display { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: clamp(1rem, 3vw, 1.75rem); font-weight: 700; color: #0f172a; padding-left: 1rem; overflow-wrap: break-word; word-break: break-all; }
          .dark .ip-display { color: #f8fafc; }
          
          .copy-btn { background: #2563ff; color: #ffffff; border: none; padding: 0.75rem 1.5rem; border-radius: 14px; font-weight: 700; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-size: 0.9rem; }
          .copy-btn:hover { background: #1d4fd8; transform: translateY(-1px); box-shadow: 0 8px 16px -4px rgba(37,99,255,0.4); }
          .copy-btn.copied { background: #10b981; box-shadow: 0 8px 16px -4px rgba(16, 185, 129, 0.4); }
          
          .info-strip { display: flex; justify-content: center; gap: 2rem; margin-top: 3rem; flex-wrap: wrap; }
          .info-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #64748b; }
          .dark .info-item { color: #a1a1aa; }
          
          .faq-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; transition: all 0.3s ease; }
          .dark .faq-card { background: #09090b; border-color: #27272a; }
          .faq-card:hover { border-color: #2563ff; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
          .faq-card.active { border-color: rgba(37,99,255,0.1); background: #fbfcfe; }
          .dark .faq-card.active { border-color: #27272a; background: #18181b; }
          
          .faq-trigger { width: 100%; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; background: none; border: none; cursor: pointer; text-align: left; font-weight: 700; font-size: 1rem; color: #0f172a; font-family: 'Outfit', sans-serif; }
          .dark .faq-trigger { color: #f8fafc; }
          .faq-icon { color: #2563ff; transition: transform 0.3s ease; }
          .faq-card.active .faq-icon { transform: rotate(180deg); }
          
          .faq-content { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
          .faq-card.active .faq-content { max-height: 500px; }
          .faq-body { padding: 0 2rem 2rem 2rem; color: #64748b; font-size: 0.95rem; line-height: 1.7; }
          .dark .faq-body { color: #a1a1aa; }
          
          @media (max-width: 640px) { .ip-flex { flex-direction: column; padding: 1.25rem; align-items: stretch; } .ip-display { padding: 0 0 1rem 0; text-align: center; font-size: 1.1rem; padding-left: 0; } .copy-btn { justify-content: center; width: 100%; } }
        `}} />

        <div className="max-w-[800px] mx-auto w-full">
          
          <header className="text-center mb-16 mt-4">
            <span className="ip-eyebrow">IP Sorgulama Aracı</span>
            <h1 className="font-['Outfit'] font-extrabold text-[clamp(2.5rem,6vw,4rem)] tracking-tight leading-[1.1] mb-5 text-slate-900 dark:text-white">
              IP Adresim <span className="text-[#2563ff]">Nedir?</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[1.1rem] max-w-[500px] mx-auto">
              Dijital imzanızı anında görün, tek tıkla panonuza kopyalayın.
            </p>
          </header>

          <section className="ip-card mb-24">
            {/* IPv4 Row */}
            <div className="ip-row">
              <div className="ip-label">
                <span className="pulse-dot"></span>
                <span>IPv4 Adresiniz</span>
              </div>
              <div className="ip-flex">
                <div className="ip-display">{ipv4}</div>
                <button 
                  className={`copy-btn ${copiedv4 ? 'copied' : ''}`} 
                  onClick={() => copyIp(ipv4, 'v4')}
                  disabled={ipv4 === 'Yükleniyor...' || ipv4.includes('Bulunamadı')}
                >
                  {copiedv4 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedv4 ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* IPv6 Row */}
            <div className="ip-row mt-6">
              <div className="ip-label">
                <span className="pulse-dot" style={{ background: '#3b82f6' }}></span>
                <span>IPv6 Adresiniz</span>
              </div>
              <div className="ip-flex">
                <div className="ip-display">{ipv6}</div>
                <button 
                  className={`copy-btn ${copiedv6 ? 'copied' : ''}`} 
                  onClick={() => copyIp(ipv6, 'v6')}
                  disabled={ipv6 === 'Yükleniyor...' || ipv6.includes('Bulunamadı') || ipv6.includes('Desteklenmiyor')}
                  style={{ background: ipv6.includes('Desteklenmiyor') ? '#64748b' : undefined }}
                >
                  {copiedv6 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedv6 ? 'Kopyalandı' : ipv6.includes('Desteklenmiyor') ? 'Kopyalanamaz' : 'Kopyala'}</span>
                </button>
              </div>
            </div>

            <div className="info-strip">
              <div className="info-item"><ShieldAlert className="w-4 h-4 text-emerald-500" /> %100 Güvenli</div>
              <div className="info-item"><Zap className="w-4 h-4 text-emerald-500" /> Anlık Tespit</div>
              <div className="info-item"><EyeOff className="w-4 h-4 text-emerald-500" /> Gizlilik Odaklı</div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-['Outfit'] font-extrabold text-[1.75rem] text-slate-900 dark:text-white text-center mb-10">Hakkında Sık Sorulan Sorular</h2>
            
            <div className="flex flex-col gap-4">
              {[
                { title: 'IP adresi nedir?', content: 'IP adresi (İnternet Protokolü Adresi), internet veya yerel ağ üzerindeki cihazlara atanan benzersiz bir sayısal etikettir. Tıpkı bir posta adresi gibi, veri paketlerinin doğru hedefe ulaşmasını sağlar. IPv4 (örn. 192.168.1.1) ve IPv6 (örn. 2001:db8::1) olmak üzere iki sürümü vardır.' },
                { title: 'IPv4 ile IPv6 arasındaki fark nedir?', content: 'IPv4, 32 bitlik adreslerle yaklaşık 4,3 milyar benzersiz adres sunar. IPv6 ise 128 bitlik yapısıyla pratik olarak sınırsız sayıda adres sağlar. İnternet cihazlarının hızlı artışı nedeniyle IPv4 adresleri tükenmekte, dünya giderek IPv6\'ya geçmektedir.' },
                { title: 'IP adresim neden sürekli değişiyor?', content: 'Çoğu internet servis sağlayıcısı (ISS) "dinamik IP" atar; yani modem yeniden başlatıldığında veya belirli süre geçtikten sonra IP adresiniz değişebilir. Sabit bir IP\'ye ihtiyaç duyuyorsanız ISS\'nizden "statik IP" talep edebilirsiniz.' },
                { title: 'Bu araç verilerimi saklıyor mu?', content: 'Hayır, mahremiyetiniz bizim için önceliklidir. Bu araç sadece o anki bağlantınız üzerinden tespit edilen adresi size göstermek için çalışır. Hiçbir veri kaydedilmez, loglanmaz veya üçüncü taraflarla paylaşılmaz.' },
              ].map((faq, idx) => (
                <div key={idx} className={`faq-card ${activeFaq === idx ? 'active' : ''}`}>
                  <button className="faq-trigger" onClick={() => toggleFaq(idx)}>
                    {faq.title}
                    <ChevronDown className="w-5 h-5 faq-icon" />
                  </button>
                  <div className="faq-content">
                    <div className="faq-body">
                      {faq.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <OtherTools />

        </div>
      </div>
    </PageTransition>
  );
}
