import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./slim.css";
import "./custom.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kteck Solutions - Especialistas em TI, Redes e Segurança",
  description: "Consultoria especializada em infraestrutura de redes, cibersegurança e automação para empresas. Mais de 8 anos de experiência em TI de alta performance.",
  keywords: ["Consultoria de TI", "Segurança da Informação", "Infraestrutura de Redes", "Automação Empresarial", "Suporte TI Sorocaba", "Kteck Solutions"],
  authors: [{ name: "Kteck Solutions" }],
  openGraph: {
    title: "Kteck Solutions - Especialistas em TI",
    description: "Soluções modernas e seguras em TI, redes e cibersegurança para sua empresa.",
    url: "https://kteck.com.br",
    siteName: "Kteck Solutions",
    images: [
      {
        url: "/assets/img/logo_oficial.png",
        width: 1200,
        height: 630,
        alt: "Kteck Solutions Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kteck Solutions - Especialistas em TI",
    description: "Consultoria em Redes, Segurança e Automação para Empresas.",
    images: ["/assets/img/logo_oficial.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body className={inter.className}>
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/script.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
