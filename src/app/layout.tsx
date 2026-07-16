import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrototypeControls } from "@/components/simetrik/prototype-controls";
import "./globals.css";

const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var theme = localStorage.getItem("simetrik-theme") || "dark";
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch (e) {}
  })();
`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simetrik v3 — Prototipo",
  description: "Prototipo exploratorio de Simetrik v3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <PrototypeControls />
        </TooltipProvider>
      </body>
    </html>
  );
}
