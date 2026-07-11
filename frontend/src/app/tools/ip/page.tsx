'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Shield, Zap, EyeOff, ChevronDown, Check, Copy } from 'lucide-react';
import OtherTools from '@/components/OtherTools';

export default function IpAddressTool() {
  const [ipv4, setIpv4] = useState('');
  const [ipv6, setIpv6] = useState('');
  const [copied4, setCopied4] = useState(false);
  const [copied6, setCopied6] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Fetch IPv4 strictly
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip) {
          setIpv4(data.ip);
        }
      })
      .catch((err) => {
        console.error('IPv4 adresi alınamadı:', err);
        setIpv4('Tespit edilemedi');
      });

    // Fetch IPv6/IPv4 fallback
    fetch('https://api64.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip) {
          if (data.ip.includes(':')) {
            setIpv6(data.ip);
          } else {
            setIpv6('Bağlantınız IPv6 desteklemiyor');
          }
        }
      })
      .catch((err) => {
        console.error('IPv6 adresi alınamadı:', err);
        setIpv6('Tespit edilemedi');
      });
  }, []);

  const copyToClipboard = (text: string, type: 'ipv4' | 'ipv6') => {
    if (!text || text.includes('Tespit') || text.includes('desteklemiy')) return;
    navigator.clipboard.writeText(text);
    if (type === 'ipv4') {
      setCopied4(true);
      setTimeout(() => setCopied4(false), 2000);
    } else {
      setCopied6(true);
      setTimeout(() => setCopied6(false), 2000);
    }
  };

  const faqs = [
    {
      q: 'IP adresi nedir?',
      a: 'IP adresi (İnternet Protokolü Adresi), internet veya yerel ağ üzerindeki cihazlara atanan benzersiz bir sayısal etikettir. Tıpkı bir posta adresi gibi, veri paketlerinin doğru hedefe ulaşmasını sağlar. IPv4 (örn. 192.168.1.1) ve IPv6 (örn. 2001:db8::1) olmak üzere iki sürümü vardır.',
    },
    {
      q: 'IPv4 ile IPv6 arasındaki fark nedir?',
      a: 'IPv4, 32 bitlik adreslerle yaklaşık 4,3 milyar benzersiz adres sunar. IPv6 ise 128 bitlik yapısıyla pratik olarak sınırsız sayıda adres sağlar. İnternet cihazlarının hızlı artışı nedeniyle IPv4 adresleri tükenmekte, dünya giderek IPv6\'ya geçmektedir.',
    },
    {
      q: 'IP adresim neden sürekli değişiyor?',
      a: 'Çoğu internet servis sağlayıcısı (ISS) "dinamik IP" atar; yani modem yeniden başlatıldığında veya belirli süre geçtikten sonra IP adresiniz değişebilir. Sabit bir IP\'ye ihtiyaç duyuyorsanız ISS\'nizden "statik IP" talep edebilirsiniz.',
    },
    {
      q: 'Bu araç verilerimi saklıyor mu?',
      a: 'Hayır, mahremiyetiniz bizim için önceliklidir. Bu araç sadece o anki bağlantınız üzerinden tespit edilen adresi size göstermek için çalışır. Hiçbir veri kaydedilmez, loglanmaz veya üçüncü taraflarla paylaşılmaz.',
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-650 dark:bg-blue-950/30 dark:text-brand-blue">
            IP Sorgulama Aracı
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            IP Adresim <span className="text-brand-dark dark:text-brand-blue">Nedir?</span>
          </h1>
          <p className="mt-4 text-zinc-550 dark:text-zinc-400">
            Cihazınızın IPv4 ve IPv6 adreslerini anında tespit edin, tek tıkla kopyalayın.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {/* IPv4 Card */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-blue animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider">IPv4 Adresiniz</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white select-all break-all">
                {ipv4 || 'Yükleniyor...'}
              </div>
              {ipv4 && !ipv4.includes('Tespit') && (
                <button
                  onClick={() => copyToClipboard(ipv4, 'ipv4')}
                  className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    copied4
                      ? 'bg-brand-dark text-white'
                      : 'bg-zinc-950 text-white hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
                  }`}
                >
                  {copied4 ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied4 ? 'Kopyalandı' : 'Kopyala'}
                </button>
              )}
            </div>
          </section>

          {/* IPv6 Card */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-blue animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider">IPv6 Adresiniz</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-900 dark:text-white select-all break-all">
                {ipv6 || 'Yükleniyor...'}
              </div>
              {ipv6 && !ipv6.includes('desteklemiy') && !ipv6.includes('Tespit') && (
                <button
                  onClick={() => copyToClipboard(ipv6, 'ipv6')}
                  className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    copied6
                      ? 'bg-brand-dark text-white'
                      : 'bg-zinc-950 text-white hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
                  }`}
                >
                  {copied6 ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied6 ? 'Kopyalandı' : 'Kopyala'}
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-150 dark:border-zinc-800 pt-8 mt-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Shield className="h-4 w-4 text-brand-blue" />
            %100 Güvenli
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Zap className="h-4 w-4 text-amber-500" />
            Çift Protokol (v4/v6)
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <EyeOff className="h-4 w-4 text-brand-blue" />
            Gizlilik Odaklı
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center">Hakkında Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-zinc-900 dark:text-white"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${
                      activeFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <OtherTools />
      </div>
    </PageTransition>
  );
}
