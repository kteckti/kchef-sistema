import type { Metadata } from "next";
import { Inter } from "next/font/google";
// 1. Removemos o globals.css antigo e importamos o slim.css
import "./slim.css";
import "./custom.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kteck Delivery",
  description: "Painel Administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* 2. Adicionamos os ícones que o tema Slim exige */}
        <link href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}