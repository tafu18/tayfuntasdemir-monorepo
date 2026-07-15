'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Projects() {
  const quotes = [
    "Mevlana: “İki günü eşit olan zarardadır.”",
    "Azi Mahmud Hüdai: “Her şey gönlünde olduğu gibi olur.”",
    "Yunus Emre: “Biri var, her zaman seninle, o da sensin.”",
    "Mevlana: “Dünle beraber gitti, ne kadar söz varsa düne ait.”",
    "Azi Mahmud Hüdai: “Birlikten kuvvet doğar, ayrılık hüsran getirir.”",
    "Yunus Emre: “Gerçekten sev, ne oldum deme, ne olacağım de.”",
    "Nesimi: 'Ben de bir insanım, her insan gibi bir acıyı hissederim.'",
    "İbn Arabi: 'Gerçek aşk, kendini unutabilmektir.'",
    "Hz. Ali: 'Düşmanını tanı, dostunu daha iyi tanı.'",
    "Mevlana: 'Her şeyin başı sevgidir.'",
    "Yunus Emre: 'Bütün mürşitlerin tarif ettiği aşk, Allah aşkıdır.'",
    "İbn Sina: 'Bilgi, insanın içindeki karanlıkları aydınlatır.'",
    "Hz. Muhammed (SAV): 'Kim bir kişiye doğru yolu gösterirse, ona bir dünya kadar sevap verilir.'",
    "Bahaeddin Nakşibend: 'Gerçek derviş, her şeyin içindedir ama hiçbir şeye bağlı değildir.'",
    "İbn Tufeyl: 'İnsanlar, hayatın anlamını sorgulamadan geçerler.'",
    "İbn Haldun: 'Toplumların yükselmesi için eğitim şarttır.'",
    "Süleyman Çelebi: 'Ey aşk, aşk olmasaydın, bu dünyada ne vardı?'",
    "İmam Gazali: 'İlim, insanın gönlünde huzur yaratır.'",
    "Mevlana: 'Bir insan bir kez sevdiğinde, her şeyin farkına varır.'",
    "Zekeriyya el-Ensari: 'İman, sabır ve tevazu ile güçlenir.'",
    "Molla Fenari: 'Gerçekte en zengin olan, gönlü zengin olandır.'",
    "İbn al-Qayyim: 'İman, sabır ve tevekkül ile korunur.'",
    "Hz. Ali: 'Kendini bilmek, her şeyin başlangıcıdır.'",
    "İbn Bâcce: 'Zihnin huzuru, kalbin huzurunu getirir.'",
    "Ahmed Yesevi: 'Sürekli düşün, sevgiye yönel, aşk her şeyin temelidir.'",
    "Abdulkadir Geylani: 'Bir insanın kalbi ne kadar temizse, dünyası o kadar güzel olur.'",
    "Şeyh Bedreddin: 'Gerçek yol, insanın kendi içindeki yolu bulmasıdır.'",
    "İbn Hazm: 'Sevgi, kalpteki bir ateştir; ama ne kadar sabırlı olursak, o kadar az yakar.'",
    "Süleyman Çelebi: 'Aşkın anlamı, her şeyin onun etrafında dönmesidir.'",
    "Ebu Hanife: 'Zihin, sabırlı olursa, kalp de onu takip eder.'",
    "Nizam-ül Mülk: 'Bir devletin en güçlü kaynağı, onun halkıdır.'",
    "Mevlana: 'Sevgi, ne doğuda ne batıda, her yerde bir olmalıdır.'"
  ];

  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  const projects = [
    {
      name: 'Kokpit',
      subtitle: 'Saha Yönetim Sistemi',
      description: 'KEP entegrasyonu, veri export işlemleri, API loglama ve çeşitli backend geliştirmeleri yapıldı.',
      image: 'https://kokpit.tech/wp-content/uploads/2022/10/kokpit-logo.png',
      link: 'https://kokpit.tech/tr/'
    },
    {
      name: 'Pera Passage',
      subtitle: 'Ziyaretçi Takip & Yönetim Sistemi',
      description: 'Projenin backend altyapısının geliştirilmesinde baştan sona aktif rol alındı ve tüm süreçlere katkı sağlandı.',
      image: 'https://perapassage.com/wp-content/uploads/2023/06/pera-passage-logo.png',
      link: 'https://perapassage.com/tr/'
    },
    {
      name: 'Rent Go',
      subtitle: 'Araç Kiralama Platformu',
      description: 'Sektörün lider firmalarından biri için sıfırdan, modern teknolojilerle backend altyapısı geliştirilmektedir.',
      image: 'https://s3.eu-central-1.amazonaws.com/static.obilet.com/RentACar/Vendor/29/logo.png',
      link: 'https://www.rentgo.com/'
    },
    {
      name: 'Tapu Sor',
      subtitle: 'Varlık Yönetim Sistemi',
      description: 'Gayrimenkul ve varlık yönetimi üzerine kurulu bu platformun backend altyapısına katkı sağlandı.',
      image: 'https://i0.wp.com/blog.tapusor.com/wp-content/uploads/2022/02/tapusor-logo-1.jpg?w=1920&ssl=1',
      link: 'https://tapusor.com/'
    },
    {
      name: 'Oniki',
      subtitle: 'Etkinlik & Dijital Networking Platformu',
      description: 'Canlı etkinlik anlarında yüksek performans sağlamak amacıyla Redis ile anlık veri işleme ve optimizasyon yapıldı.',
      image: 'https://oniki.net/wp-content/uploads/2022/10/oniki-black-logo.png.webp',
      link: 'https://oniki.net/tr/'
    },
    {
      name: 'Petner',
      subtitle: 'Evcil Hayvan Platformu',
      description: 'Redis kullanılarak dinamik anasayfa algoritması, takip ve arkadaşlık sistemleri gibi sosyal özellikler geliştirildi.',
      image: 'https://petner.com.tr/wp-content/uploads/2023/06/petner-logo.png',
      link: 'https://petner.com.tr/tr/'
    },
    {
      name: 'Avfast',
      subtitle: 'Avukatlar Arası Yardımlaşma Platformu',
      description: 'Avukatların kendi aralarında görev ataması yapabildikleri ve yardımlaştıkları bir platform geliştirildi.',
      image: 'https://avfast.com.tr/_nuxt/img/AvFast_logo.ee67be9.png',
      link: 'https://avfast.com.tr/'
    },
    {
      name: 'Fops',
      subtitle: 'Saha Yönetim Sistemi',
      description: 'Dijital sözleşme yönetimi, QR kod ile müşteri anketleri ve çeşitli otomasyon geliştirmeleri yapıldı.',
      image: 'https://dashboard.fops.com.tr/_nuxt/img/fops_beyaz_logo.886ba78.png',
      link: '#',
      bgColor: 'bg-[#57b77e]'
    },
    {
      name: 'Ivmo',
      subtitle: 'Uluslararası Sanal Para İşlemleri',
      description: 'Kripto para işlemleri ve transferleri için güvenli ve performanslı backend servisleri geliştirildi.',
      image: 'https://ivmo.com/wp-content/uploads/2023/04/a12-1.png',
      link: '#',
      bgColor: 'bg-gradient-to-r from-[#0bbc84] to-[#00c16e]'
    },
    {
      name: 'Güngören Belediyesi',
      subtitle: 'Resmi Web Sitesi & Uygulamaları',
      description: 'Belediye için saha yönetimi ve Emlak Vergisi gibi çeşitli iç uygulamaların geliştirmesi yapıldı.',
      image: 'https://seeklogo.com/images/G/gungoren-belediyesi-istanbul-logo-2C57426593-seeklogo.com.png',
      link: 'https://www.gungoren.bel.tr/'
    }
  ];

  const currentDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PageTransition>
      {/* Cover Header */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32 text-center text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('/project-bg.jpeg')]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Projelerim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg italic text-zinc-200"
          >
            {quote ? `“${quote}”` : 'Yükleniyor...'}
          </motion.p>
          <p className="mt-2 text-xs text-zinc-500">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white dark:bg-zinc-950 py-16 text-center transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Bugüne Kadar Üzerinde Çalıştığım Projeler</h2>
          <p className="mt-4 text-lg text-zinc-550 dark:text-zinc-400 leading-relaxed">
            Yazılım geliştirme yolculuğumda çeşitli sektörlerde farklı projelere emek verdim. Bu projeler, müşterilerin ihtiyaçlarına en iyi şekilde çözüm üretmek ve etkili yazılım çözümleri sunmak amacıyla gerçekleştirildi. İşte üzerinde çalıştığım bazı projeler:
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="bg-zinc-50 dark:bg-zinc-900/40 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
                  <div className={`flex items-center justify-center p-8 min-h-[160px] ${project.bgColor || 'bg-zinc-50 dark:bg-zinc-800/40'}`}>
                    <img
                      src={project.image}
                      alt={`${project.name} Logo`}
                      className="max-h-20 object-contain filter dark:brightness-95"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=300&auto=format&fit=crop';
                      }}
                    />
                  </div>
                </a>
                <div className="p-6 flex flex-col flex-grow space-y-3">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{project.name}</h3>
                  <p className="text-sm font-semibold text-brand-blue dark:text-[#a0c4db]">{project.subtitle}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed flex-grow">{project.description}</p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-[#0c2f47] dark:text-brand-blue dark:hover:text-blue-350 pt-2"
                  >
                    Detayları İncele &rarr;
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Call to Action */}
      <section className="bg-brand-blue text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold">Yeni Projeler İçin İşbirliği Yapmak İstiyorum</h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Yazılım geliştirme konusundaki tecrübemi projelerinize taşımak için sabırsızlanıyorum. Eğer projenizde güvenilir bir yazılım desteğine ihtiyacınız varsa, birlikte harika işler başarabiliriz.
          </p>
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-block bg-white text-brand-blue hover:text-[#0c2f47] font-semibold py-3 px-8 rounded-lg hover:bg-zinc-50 transition-transform transform hover:scale-105"
            >
              İletişime Geçin
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
