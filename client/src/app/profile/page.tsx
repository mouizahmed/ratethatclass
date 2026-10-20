import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { noIndex } from '@/lib/seo';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your Rate That Class profile and view your course reviews.',
  robots: noIndex,
};

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfilePageClient />
    </AuthProvider>
  );
}
