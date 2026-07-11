'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function About() {
  const quotes = [
    "Mevlana: 'Kendini bilmeyen, alemi bilemez.'",
    "İbn Arabi: 'Kendini bilen, Yaratan'ı bulur.'",
    "Hz. Ali: 'Kendini bilen, evrenin sırrına vakıf olur.'",
    "İbn Sina: 'Bir insan kendini tanıdığında, hayatını anlamlandırabilir.'",
    "Mevlana: 'Dünya, insanın içindeki yansımanın sadece bir örneğidir.'",
    "İbn Haldun: 'Gerçek anlayış, önce insanın kendisini tanımasıyla başlar.'",
    "Ahmed Yesevi: 'İnsanın içindeki hakikat, dış dünyada her yerde vardır.'",
    "İbn Hazm: 'Kendini tanımak, insanın en yüksek mertebesidir.'",
    "Bahaeddin Nakşibend: 'Kendini tanıyan, her şeyin gerçek yüzünü görür.'",
    "İmam Gazali: 'İlim, insanın özünü bulmasına yardımcı olur.'",
    "Yunus Emre: 'Kendi içinde bir huzur bulamayan, dışarıda da huzur bulamaz.'",
    "Şeyh Bedreddin: 'Gerçek bilgi, insanın ruhunda doğar.'",
    "İbn al-Qayyim: 'Kendini tanımak, Allah'ı tanımaktır.'",
    "Ebu Hanife: 'İnsan, içindeki ahlaki değerleri keşfettikçe, dış dünyasını da anlamaya başlar.'",
    "İbn Tufeyl: 'Gerçek bilgi, insanın ruhsal yolculuğunda ortaya çıkar.'",
    "Mevlana: 'Kendini bilmek, evrenin sırrını çözmektir.'",
    "İbn Rüşd: 'Kendini anlamayan, gerçek bilgiyi bulamaz.'",
    "İmam Şafi: 'Kendini bilmeyen, alemi nasıl bilebilir?'",
    "Süleyman Çelebi: 'Gerçek hikmet, insanın içindeki cevherle buluşur.'",
    "İbn Bâcce: 'Zihnin huzuru, kalbin huzurunun yansımasıdır.'",
    "Abdulkadir Geylani: 'Gerçek yolculuk, insanın içindeki hakikate doğru bir yolculuktur.'",
    "Zekeriyya el-Ensari: 'İman, insanın içindeki gerçekleri keşfetmesidir.'",
    "Molla Fenari: 'İçindeki güzellikleri keşfeden, dış dünyadaki güzellikleri de görebilir.'",
    "Nizam-ül Mülk: 'Kendini tanımak, insanın topluma ve dünyaya katkı yapmasının ilk adımıdır.'",
    "İbn Arabi: 'Her insan, kendisini tanıdığında dünyayı tanır.'"
  ];

  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  const skills = [
    { name: 'PHP', desc: 'Web uygulamaları için güçlü ve yaygın bir backend dili.', link: 'https://www.php.net/' },
    { name: 'Laravel', desc: "MVC yapısı ve temiz syntax'ı ile modern bir PHP framework'ü.", link: 'https://laravel.com/' },
    { name: 'NestJS', desc: "TypeScript tabanlı, modüler yapısıyla modern bir backend framework'ü.", link: 'https://nestjs.com/' },
    { name: 'Python', desc: 'Veri analitiği ve otomasyon için çok yönlü bir dil.', link: 'https://www.python.org/' },
    { name: 'MySQL', desc: 'Güçlü ve güvenilir, ilişkisel veritabanı yönetim sistemi.', link: 'https://www.mysql.com/' },
    { name: 'Vue.js', desc: "Reaktif arayüzler için hafif ve esnek bir JavaScript framework'ü.", link: 'https://vuejs.org/' },
    { name: 'Git', desc: 'Kod sürüm kontrolü ve ekip işbirliği için dağıtık versiyon sistemi.', link: 'https://git-scm.com/' },
    { name: 'Docker', desc: 'Uygulamaları bağımsız konteynerler içinde çalıştırma platformu.', link: 'https://www.docker.com/' },
    { name: 'JWT', desc: 'JSON Web Token ile kullanıcı doğrulama ve yetkilendirme işlemleri.', link: 'https://jwt.io/' },
    { name: 'HTML', desc: 'Web sayfalarının iskelet yapısını oluşturan temel işaretleme dili.', link: 'https://html.com/' },
    { name: 'CSS', desc: 'Web sayfalarının stilini ve görsel düzenini belirleyen stil dili.', link: 'https://www.w3.org/Style/CSS/' },
    { name: 'Tailwind CSS', desc: 'Hızlı arayüz geliştirmek için kullanılan modern bir CSS framework\'ü.', link: 'https://tailwindcss.com/' },
    { name: 'JavaScript', desc: 'İnteraktif web sayfaları için temel frontend ve backend dili.', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'jQuery', desc: 'JavaScript kodunu basitleştiren, hızlı ve hafif bir kütüphane.', link: 'https://jquery.com/' },
    { name: 'Postman', desc: "API testleri yapmak ve endpoint'leri doğrulamak için popüler bir araç.", link: 'https://www.postman.com/' }
  ];

  const currentDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PageTransition>
      {/* Cover Header */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32 text-center text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('/about.png')]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Ben Kimim?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg italic text-zinc-200"
          >
            {quote ? `“${quote}”` : 'Yükleniyor...'}
          </motion.p>
          <p className="mt-4 text-sm text-zinc-400 italic">
            "Yazılım dünyasında her geçen gün yeni bir şeyler öğrenmek, beni daha iyi bir yazılımcı yapıyor."
          </p>
          <p className="mt-2 text-xs text-zinc-500">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      {/* Profile Bio */}
      <section className="bg-white dark:bg-zinc-950 py-16 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 relative rounded-full overflow-hidden shadow-2xl border-4 border-zinc-100 dark:border-zinc-800">
              <img
                src="/favicon.png"
                alt="Tayfun - Profil Fotoğrafı"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop';
                }}
              />
            </div>
            <div className="md:w-2/3 text-center md:text-left space-y-4">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Merhaba, ben Tayfun.</h2>
              <p className="text-lg text-zinc-650 dark:text-zinc-300">
                Yazılım dünyasında sürekli öğrenmeyi ve gelişmeyi ilke edinmiş bir backend geliştiriciyim.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                3 yıllık deneyimimle, sadece kod yazmanın ötesinde, ölçeklenebilir ve sürdürülebilir projeler inşa etmeyi hedefliyorum. Etkili ekip çalışmalarıyla, performansı optimize eden, güvenli ve kullanıcı dostu çözümler üretmek en büyük tutkum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Skills */}
      <section className="bg-zinc-50 dark:bg-zinc-900/40 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">Teknik Yeteneklerim</h2>
            <p className="mt-4 text-lg text-zinc-550 dark:text-zinc-400">Projelerimde aktif olarak kullandığım ve uzmanlaştığım teknolojiler.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-4 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200/60 dark:border-zinc-800 hover:shadow-md transition-all duration-300"
              >
                <a
                  href={skill.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-brand-blue dark:text-zinc-300 hover:scale-105 transition-transform"
                >
                  <span className="font-bold text-sm tracking-wider">{skill.name.slice(0, 3).toUpperCase()}</span>
                </a>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{skill.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{skill.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Call to Action */}
      <section className="bg-white dark:bg-zinc-950 py-20 text-center transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">Birlikte Çalışalım Mı?</h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Teknolojiyle sınırları zorlayan projelerinizde size destek olabilirim. Gelin, birlikte daha iyisini inşa edelim!
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/contact"
              className="bg-brand-blue hover:bg-[#0c2f47] text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              İletişime Geçin
            </Link>
            <Link
              href="/projects"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-250 dark:hover:bg-zinc-800 font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              Projelerimi Gör
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
