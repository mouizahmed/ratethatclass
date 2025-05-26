import React from 'react';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';
import UniversityRequestsClient from './UniversityRequestsClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.universityRequests);
export const viewport = generateViewport();

export default function UniversityRequestsPage() {
  return <UniversityRequestsClient />;
}
