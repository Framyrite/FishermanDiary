import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "./ui-polish.css";

export const metadata: Metadata = {
  title: "Fisherman Diary",
  description: "Fishing trophy diary in Telegram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#071c2a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
