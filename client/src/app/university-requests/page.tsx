import React from 'react';
import { Metadata } from 'next';
import { generateMetadata, SEO_CONFIGS } from '@/lib/seo';
import UniversityRequestsClient from './UniversityRequestsClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.universityRequests);

export default function UniversityRequestsPage() {
  return <UniversityRequestsClient />;
}
