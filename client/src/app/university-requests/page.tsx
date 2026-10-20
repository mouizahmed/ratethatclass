import React from 'react';
import { Metadata } from 'next';
import UniversityRequestsClient from './UniversityRequestsClient';

export const metadata: Metadata = {
  title: 'Request Your University',
  description: "Don't see your university? Request it to be added to our platform.",
  alternates: { canonical: '/university-requests' },
};

export default function UniversityRequestsPage() {
  return <UniversityRequestsClient />;
}
