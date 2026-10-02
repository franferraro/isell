import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "isell.cba | Servicio técnico y accesorios en Córdoba",
  description:
    "Accesorios premium, reparación de celulares, cambio de pantallas y baterías, y compra de celulares usados en Zona Norte de Córdoba.",
  keywords: [
    "servicio técnico celulares Córdoba",
    "accesorios para celulares Córdoba",
    "reparación de celulares Zona Norte Córdoba",
    "compra de celulares usados Córdoba",
  ],
  openGraph: {
    title: "isell.cba | Todo para tu celular",
    description:
      "Servicio técnico, accesorios premium y compra de celulares usados en Zona Norte de Córdoba.",
    locale: "es_AR",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/images/logo-isell.png?v=2", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo-isell.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
