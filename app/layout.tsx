import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinView | 나만의 코인 종목 분석 앱",
  description: "실시간 코인 정보를 확인할 수 있는 스마트한 투자 도우미",
  icons: {
    icon: "/icons/coin_view_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="mx-auto w-full max-w-[430px] h-dvh border-x-2 shadow-lg flex flex-col min-h-0 overflow-hidden">
          <Provider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </Provider>
        </div>
      </body>
    </html>
  );
}
