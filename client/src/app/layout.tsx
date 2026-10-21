import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/display/Navbar';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/display/Footer';
import AdSense from '@/components/adsense/AdSense';
import { AuthProvider } from '@/contexts/authContext';
import { OG_IMAGES, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - University Course Reviews`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    images: OG_IMAGES,
  },
  twitter: { card: 'summary' },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#000000',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          <Navbar />
          <div className="min-h-screen">{children}</div>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
