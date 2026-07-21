import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tayfuntasdemir.com.tr'),
  title: {
    default: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
    template: "%s | Tayfun Taşdemir",
  },
  description: "Tayfun Taşdemir kişisel blogu, mobil ve web projeleri, geliştirici araçları (JSON, JWT, Regex, Base64, Vakt-i Huzur, Tek Tıkla).",
  keywords: [
    "Tayfun Taşdemir",
    "Yazılım Uzmanı",
    "Mobil Uygulama",
    "React",
    "Next.js",
    "Vakt-i Huzur",
    "Tek Tıkla",
    "Namaz Vakitleri",
    "Developer Tools",
  ],
  authors: [{ name: "Tayfun Taşdemir", url: "https://tayfuntasdemir.com.tr" }],
  creator: "Tayfun Taşdemir",
  publisher: "Tayfun Taşdemir",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://tayfuntasdemir.com.tr",
    siteName: "Tayfun Taşdemir",
    title: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
    description: "Tayfun Taşdemir kişisel blogu, yazılım ve geliştirici araçları.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Tayfun Taşdemir Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
    description: "Tayfun Taşdemir kişisel blogu, yazılım ve geliştirici araçları.",
    images: ["/icon.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-7957415403888500",
  },
  icons: {
    icon: '/favicon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />

        {/* Vakt-i Huzur Floating Icon */}
        <a 
          href="https://vaktihuzur.com.tr" 
          target="_blank"
          rel="noopener noreferrer"
          title="Vakt-i Huzur"
          className="fixed bottom-[150px] right-[20px] z-[1000] bg-white w-[60px] h-[60px] flex items-center justify-center rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 duration-300"
        >
          <Image src="/hilal.png" alt="Vakt-i Huzur" width={50} height={50} className="w-[50px] h-[50px] object-contain" />
        </a>

        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/905385972318?text=Merhaba%20Tayfun%20Taşdemir,%20Nasılsın?"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[80px] right-[20px] z-[1000] bg-[#25D366] text-white w-[60px] h-[60px] rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.2)] flex items-center justify-center hover:scale-110 transition-transform duration-300"
        >
          <i className="fab fa-whatsapp text-3xl"></i>
        </a>

        {/* FontAwesome Icon Library */}
        <Script 
          src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" 
          crossOrigin="anonymous" 
          strategy="afterInteractive" 
        />

        {/* Google AdSense Script - sadece production'da yükle */}
        {process.env.NODE_ENV === 'production' && (
          <Script 
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5754237680544740" 
            crossOrigin="anonymous" 
            strategy="afterInteractive" 
          />
        )}

        {/* Chatbase Chatbot Script */}
        <Script id="chatbase-embed-script" strategy="afterInteractive">
          {`
            (function() {
                if (!window.chatbase || window.chatbase("getState") !== "initialized") {
                    window.chatbase = (...arguments) => {
                        if (!window.chatbase.q) {
                            window.chatbase.q = []
                        }
                        window.chatbase.q.push(arguments)
                    };
                    window.chatbase = new Proxy(window.chatbase, {
                        get(target, prop) {
                            if (prop === "q") {
                                return target.q
                            }
                            return (...args) => target(prop, ...args)
                        }
                    })
                }
                const onLoad = function() {
                    const script = document.createElement("script");
                    script.src = "https://www.chatbase.co/embed.min.js";
                    script.id = "ox05BFshtrgYkUPn5z1HW";
                    script.domain = "www.chatbase.co";
                    document.body.appendChild(script)
                };
                if (document.readyState === "complete") {
                    onLoad()
                } else {
                    window.addEventListener("load", onLoad)
                }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
