import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/display/Navbar';
import { AuthProvider } from '@/contexts/authContext';
import { AlertProvider } from '@/contexts/alertContext';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/display/Footer';

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          <AlertProvider>
            <Navbar />
            <div className="min-h-screen">{children}</div>
            <Toaster />
            <Footer />
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
