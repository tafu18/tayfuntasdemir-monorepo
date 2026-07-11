'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Shield, Zap, EyeOff, ChevronDown, Check, Copy } from 'lucide-react';

export default function IpAddressTool() {
  const [ip, setIp] = useState('');
  const [copied, setCopied] = useState(false);
  const [protocol, setProtocol] = useState('IPv4');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api64.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip) {
          setIp(data.ip);
          setProtocol(data.ip.includes(':') ? 'IPv6' : 'IPv4');
        }
      })
      .catch((err) => {
        console.error('IP adresi alınamadı:', err);
        setIp('Tespit edilemedi');
      });
  }, []);

  const copyIp = () => {
    if (!ip || ip === 'Tespit edilemedi') return;
    navigator.clipboard.writeText(ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400">
            IP Sorgulama Aracı
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-zinc-900 dark:text-white">
            IP Adresim <span className="text-indigo-600 dark:text-indigo-400">Nedir?</span>
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Dijital imzanızı anında görün, tek tıkla panonuza kopyalayın.
          </p>
        </header>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{protocol}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white select-all break-all">
              {ip || 'Yükleniyor...'}
            </div>
            <button
              onClick={copyIp}
              disabled={!ip}
              className={`shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-950 text-white hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Kopyalandı' : 'Adresi Kopyala'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-150 dark:border-zinc-800 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <Shield className="h-4 w-4 text-indigo-500" />
              %100 Güvenli
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <Zap className="h-4 w-4 text-amber-500" />
              Anlık Tespit
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <EyeOff className="h-4 w-4 text-emerald-500" />
              Gizlilik Odaklı
            </div>
          </div>
        </section>

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
      </div>
    </PageTransition>
  );
}
