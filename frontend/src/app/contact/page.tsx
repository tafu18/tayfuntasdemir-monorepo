'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const quotes = [
    "Mevlana: 'Konuşmadan önce, doğru, güzel ve gerekli olup olmadığını sor.'",
    "İbn Haldun: 'İyi bir iletişim, insanların kalplerini birbirine yaklaştırır.'",
    "Yunus Emre: 'Söz, gönlün aynasıdır; ne düşünüyorsan, onu söylersin.'",
    "İmam Şafi: 'İletişim, kalpten kalbe giden bir yolculuktur.'",
    "Hz. Ali: 'Konuşmanın en güzel şekli, karşındakini anlamaktır.'",
    "Bahaeddin Nakşibend: 'Gerçek anlam, sözlerin ötesinde bulunur.'",
    "İbn Sina: 'Sözlerin doğru ve öz olması, insanların kalplerine ulaşmasının en etkili yoludur.'",
    "İmam Gazali: 'İyi bir iletişim, insanların birbirini anlamasına olanak tanır.'",
    "Mevlana: 'Kelimeler, sevgi ile birleştiğinde en etkili silah haline gelir.'",
    "Süleyman Çelebi: 'Söz, insanın iç dünyasının yansımasıdır.'",
    "İbn Arabi: 'Gerçek iletişim, ruhların birbirine geçmesidir.'",
    "İbn Tufeyl: 'Sözlerin gücü, anlamını ve amacını doğru iletmektedir.'",
    "Şeyh Bedreddin: 'İyi bir iletişim, kalp ve zihin arasındaki bir köprüdür.'",
    "Hz. Muhammed (SAV): 'Sözleriniz, kalplerinizi birleştirir.'",
    "İbn Qayyim: 'Söz, bir insanın ruhunu şekillendirir.'",
    "İmam Malik: 'Düşünmeden konuşan kişi, kalbini kirletmiş olur.'",
    "Ebu Hanife: 'Güzel söz, insanın ahlakını gösterir.'",
    "İbn Hazm: 'Bir insanı anlayabilmek, onun kalbine dokunabilmektir.'",
    "Mevlana: 'Her kelime, bir yürekten diğerine geçer.'",
    "İmam Şafi: 'Bir kelime, gönülleri fethedebilir, bir diğer ise kalpleri kırabilir.'",
    "Bahaeddin Nakşibend: 'İletişim, kelimelerle değil, niyetle gerçekleşir.'",
    "Yunus Emre: 'Sözdeki doğruluk, kalpten gelir.'",
    "İbn Rüşd: 'Gerçek iletişim, sadece kula değil, ruha hitap eder.'",
    "İmam Gazali: 'İyi bir söz, kalpteki sevgiyi çoğaltır.'",
    "Ebu Bekir Sıddık: 'Söyleyeceğin her şeyin ölçüsünü doğru koy.'",
    "İbn Arabi: 'Gerçek sevgi, sözlerin dışında, davranışlarda da kendini gösterir.'"
  ];

  const [quote, setQuote] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setError('Form gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      {/* Cover Header */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32 text-center text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1600&auto=format&fit=crop')]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Benimle İletişime Geçebilirsiniz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg italic text-zinc-200"
          >
            {quote ? `“${quote}”` : 'Yükleniyor...'}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-zinc-50 dark:bg-zinc-950 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Bir Fikriniz Mi Var?</h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
              Aşağıdaki formu doldurun, mesajınızı alır almaz size geri döneceğim!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form */}
            <div className="lg:col-span-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Mesajınız İletildi!</h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    En kısa sürede e-posta adresiniz üzerinden geri dönüş sağlayacağım. Teşekkürler.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-850 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Adınız</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:border-[#154667] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">E-posta Adresi</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:border-[#154667] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefon Numarası</label>
                    <input
                      type="text"
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:border-[#154667] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Mesajınız</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:border-[#154667] focus:outline-none resize-none"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#154667] hover:bg-[#0c2f47] text-white px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                    <Send className="ml-2 h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Diğer Bilgiler</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[#154667] dark:text-zinc-300">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <strong className="block text-sm font-semibold text-zinc-900 dark:text-white">Adres</strong>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Esenler, İstanbul, Türkiye</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[#154667] dark:text-zinc-300">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <strong className="block text-sm font-semibold text-zinc-900 dark:text-white">E-posta</strong>
                        <a href="mailto:info@tayfuntasdemir.com.tr" className="text-sm text-[#154667] dark:text-[#a0c4db] hover:underline">
                          info@tayfuntasdemir.com.tr
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[#154667] dark:text-zinc-300">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <strong className="block text-sm font-semibold text-zinc-900 dark:text-white">Telefon</strong>
                        <a href="tel:+905385972318" className="text-sm text-[#154667] dark:text-[#a0c4db] hover:underline">
                          +90 538 597 23 18
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Beni Takip Edebilirsiniz</h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://medium.com/@tayfuntasdemircomtr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#154667] dark:hover:text-white transition-colors"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/tayfunTasdemir/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#154667] dark:hover:text-white transition-colors"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a
                      href="https://github.com/tafu18"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-[#154667] dark:hover:text-white transition-colors"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Konum</h4>
                  <div className="aspect-video rounded-xl overflow-hidden shadow-inner">
                    <iframe
                      src="https://maps.google.com/maps?q=Esenler%2C%20%C4%B0stanbul%2C%20T%C3%BCrkiye&t=&z=13&ie=UTF8&iwloc=&output=embed"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
