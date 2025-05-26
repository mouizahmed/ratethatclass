import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/display/Navbar';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/display/Footer';
import AdSense from '@/components/adsense/AdSense';
import { generateMetadata, SEO_CONFIGS } from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.home);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <AdSense pId={'1038054889464988'} />
        <meta name="google-adsense-account" content="ca-pub-1038054889464988"></meta>
        <meta name="google-site-verification" content="your-google-site-verification-code" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <Navbar />
        <div className="min-h-screen">{children}</div>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
