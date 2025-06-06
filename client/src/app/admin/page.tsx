import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';
import AdminPageClient from './AdminPageClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.admin);
export const viewport = generateViewport();

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminPageClient />
    </AuthProvider>
  );
}
