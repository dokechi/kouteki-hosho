import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "公的保障見える化",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="siteHeader">
          <Link href="/" className="logo">公的保障見える化</Link>
          <nav><Link href="/sources">出典一覧</Link></nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
