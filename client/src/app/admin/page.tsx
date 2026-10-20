import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { noIndex } from '@/lib/seo';
import AdminPageClient from './AdminPageClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage reports and moderate content on Rate That Class.',
  robots: noIndex,
};

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminPageClient />
    </AuthProvider>
  );
}
