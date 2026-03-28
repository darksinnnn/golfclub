import type { Metadata } from "next";
import "./globals.css";
import "lenis/dist/lenis.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "Golf Heroes — Play, Win & Give Back",
  description:
    "A subscription-driven golf platform combining performance tracking, monthly prize draws, and charitable giving. Track your scores, win prizes, and support charities you care about.",
  keywords: "golf, charity, subscription, prize draw, stableford, golf scores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LenisProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
