import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import Script from "next/script";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, ogImageUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const defaultOgImage = {
  url: ogImageUrl("Tayfun Taşdemir | Yazılım Uzmanı & Blog"),
  width: 1200,
  height: 630,
  alt: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
    template: "%s | Tayfun Taşdemir",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "technology",
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
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
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
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
    description: "Tayfun Taşdemir kişisel blogu, yazılım ve geliştirici araçları.",
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tayfun Taşdemir | Yazılım Uzmanı & Blog",
    description: "Tayfun Taşdemir kişisel blogu, yazılım ve geliştirici araçları.",
    images: [defaultOgImage.url],
  },
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
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
        <PublicLayoutWrapper>
          {children}
        </PublicLayoutWrapper>

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
