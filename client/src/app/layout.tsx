import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/display/Navbar';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/display/Footer';
import AdSense from '@/components/adsense/AdSense';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rate That Class',
  description: 'Course selection made easier!',
};

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
