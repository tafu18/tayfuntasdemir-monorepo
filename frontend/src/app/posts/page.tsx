'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, getImageUrl } from '@/lib/api';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Calendar, Eye } from 'lucide-react';

function PostsContent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('Yükleniyor...');

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
    "Mevlana: 'Sevgi, ne doğuda ne batıda, her yerde bir olmalıdır.'",
    "İbn Rüşd: 'Aklın yolu birdir; gerçek mutluluk akıl ile elde edilir.'",
    "Al-Ghazali: 'İlim, sadece bilgi değil, aynı zamanda kalbin ıslahıdır.'",
    "İbn-i Arabi: 'Bütün kainat, içindeki Allah'ı keşfetmek için bir aynadır.'",
    "Ebu Hanife: 'İman, amel ile tamamlanır.'",
    "İbn Şükrü: 'Gerçek zenginlik, gönlün zenginliğidir.'",
    "Hikmet-i Muhammediye: 'Bir insanın değeri, onun sabrında gizlidir.'",
    "Şeyh Nureddin: 'Gönlünü her türlü kötülükten temizle, o zaman her şey güzelleşir.'",
    "İmam Malik: 'Güzel söz, güzel bir davranıştır.'",
    "İbn Qayyim: 'Sabır, en yüksek erdemdir.'",
    "Mevlana: 'Bir insan ne kadar çok severse, o kadar çok öğrenir.'",
    "İmam Şafi: 'Allah’ın emirleri, insanları yüceltir.'",
    "Süleyman Çelebi: 'Gerçek aşk, bir insanın sadece Allah’ı sevmesidir.'",
    "Ebu Talib: 'Bilginin sırrı, içinde huzur barındırır.'",
    "Abdullah bin Mesud: 'İlim, insanın başına gelen en güzel şeydir.'",
    "İbn-i Teymiyye: 'Allah'a yakın olmak, her şeyden daha değerlidir.'",
    "İbrahim Hakkı: 'Gerçek dostluk, kalpte yer eder.'",
    "İbn-i Haldun: 'Bir milletin en büyük serveti, onun eğitimli bireyleridir.'",
    "Muhammed el-Fazari: 'Zihinlerin doğru yönlendirilmesi, kalplerin doğru yönlendirilmesi ile mümkündür.'",
    "İbn-i Bâcce: 'Akıl ve aşk birbirini tamamlayan iki güçtür.'",
    "Süleyman Çelebi: 'Aşk, her şeyin içinde bir sırdır.'",
    "Şeyh Bedreddin: 'Her şeyin en güzel yönü, onun içindeki sevgidir.'",
    "Mevlana: 'Kendini bilmek, her şeyin anahtarıdır.'",
    "Yunus Emre: 'Dünya sadece bir sınav yeridir, asıl hayat ebedi olanlardadır.'",
    "Süleyman Çelebi: 'Gerçek aşk, her şeyin ondan doğmasıdır.'",
    "Bahaeddin Nakşibend: 'Gerçek mürşit, kalp yolcusudur.'",
    "İbn Sina: 'İlim, hayatın her alanında insanın en değerli yol arkadaşıdır.'",
    "Ahmet Yesevi: 'Kalp temizlenmeden gerçek bilgiye ulaşılmaz.'",
    "Şeyh Nureddin: 'Aşk, bir insanın yüreğinde başlar.'",
    "İmam Azam: 'Allah’a inanmak, insanın içindeki huzuru sağlar.'",
    "Mevlana: 'Kendini her şeyden önce tanı, sonra başkalarını anlamaya çalış.'",
    "İbn-i Arabi: 'Aşk, Allah’ın bir tecellisidir.'",
    "Süleyman Hilmi Tunahan: 'Gerçek huzur, kalpteki berraklıktan gelir.'",
    "Ebu Talib: 'Bilgi, insana güç verir.'",
    "Yunus Emre: 'Aşk her zaman, her yerde bulur kendini.'",
    "Ebu Bekir Sıddık: 'İnsan, aklı ve sabrıyla büyür.'",
    "İbn-i Teymiyye: 'Bir insan, doğru yolu bulduğunda, içindeki huzuru hisseder.'",
    "Süleyman Çelebi: 'Gerçek huzur, Allah’a yaklaşmakla elde edilir.'",
    "Mevlana: 'Her şeyin başı sevgidir.'",
    "İbn-i Hazm: 'Her şeyin bir sırrı vardır.'",
    "İbn Arabi: 'Her şey, Allah’ın yansımasıdır.'",
    "Süleyman Çelebi: 'Kalp, her türlü kirlilikten temizlenmelidir.'",
    "Zekeriyya el-Ensari: 'İman, sabırla güçlenir.'",
    "İmam Gazali: 'İlim, ruhun huzurunu sağlar.'",
    "Şeyh Bedreddin: 'Gerçek yolculuk, iç yolculuktur.'",
    "İbn Sina: 'İlim, insanın içindeki karanlıkları aydınlatır.'",
    "Süleyman Çelebi: 'Gerçek aşk, kalbin en derin yerinde başlar.'",
    "İbn Rüşd: 'İlim, insanın hayatını güzelleştirir.'",
    "Mevlana: 'Aşk, insanın kendini bulma yolculuğudur.'",
    "Yunus Emre: 'Gerçek aşk, insanın kalbindeki aydınlıktır.'",
    "Süleyman Çelebi: 'Her şeyin içinde aşkı bulmak gerekir.'",
    "İmam Malik: 'Bilgi insanı yüceltir, cehalet ise alçaltır.'",
    "İbn Qayyim: 'Sabır, kalbin en güzel meyvesidir.'",
    "Mevlana: 'Aşk, her şeyin başlangıcıdır.'",
    "İbn Haldun: 'Eğitim, bir toplumun geleceğini şekillendirir.'",
    "Şeyh Nureddin: 'Gerçek zenginlik, kalpteki huzurdur.'"
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    setLoading(true);
    api.get(`/posts?page=${pageParam}&limit=9`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Yazılar yüklenirken hata:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageParam]);

  const currentDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-0">
      {/* Cover Header */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32 text-center text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('/posts.png')]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Gönderilerim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg italic text-zinc-200"
          >
            “{quote}”
          </motion.p>
          <p className="mt-2 text-xs text-zinc-500">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-zinc-200 dark:bg-zinc-800 h-48 w-full rounded-xl" />
                <div className="bg-zinc-200 dark:bg-zinc-800 h-6 w-3/4 rounded" />
                <div className="bg-zinc-200 dark:bg-zinc-800 h-4 w-full rounded" />
              </div>
            ))}
          </div>
        ) : data.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.data.map((post: any) => (
                <article key={post.id} className="flex flex-col items-start justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-md transition-all hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:bg-zinc-900 bg-white group cursor-pointer">
                  <Link href={`/post/${post.slug}`} className="w-full p-5 block h-full">
                    <div className="aspect-[16/9] w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4 relative">
                      <img
                        src={getImageUrl(post.image)}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-x-4 text-xs text-zinc-500 mb-2">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        {post.views} okuma
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-blue transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {post.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {data.lastPage > 1 && (
              <div className="mt-12 flex justify-center space-x-2">
                {Array.from({ length: data.lastPage }, (_, idx) => idx + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/posts?page=${p}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                      data.page === p
                        ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500">
            Henüz blog yazısı eklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Posts() {
  return (
    <PageTransition>
      <Suspense fallback={<div className="text-center py-24">Yükleniyor...</div>}>
        <PostsContent />
      </Suspense>
    </PageTransition>
  );
}
