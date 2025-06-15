import React from 'react';
import ClientSearch from '@/components/common/ClientSearch';
import { getUniversities } from '@/requests/getRequests';
import Link from 'next/link';
import UniversityCarousel from '@/components/display/UniversityCarousel';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';
import { University } from '@/types/university';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.home);
export const viewport = generateViewport();

// Disable caching completely
export const dynamic = 'force-dynamic';

export default async function Home() {
  let universities: University[] = [];
  try {
    universities = await getUniversities();
  } catch (error) {
    console.log('Failed to fetch universities during build:', error);
    // Continue with empty universities array
  }

  return (
    <div className="flex flex-col items-center gap-10 p-8 sm:p-20">
      <div className="flex flex-col items-center gap-3">
        <h1 className="scroll-m-20 text-2xl lg:text-3xl font-bold tracking-tight lg:text-5xl">
          Course selection made easy
        </h1>
        <p className="leading-7">Write anonymous reviews about your classes and help others make informed decisions.</p>
      </div>
      <div className="w-full max-w-3xl">
        <ClientSearch
          data={universities}
          valueKey="university_name"
          labelKey="university_name"
          placeholder="Search universities..."
          emptyMessage="No universities found."
        />
        <div className="flex justify-center">
          <p className="leading-7 text-sm">
            Don&apos;t see your school?{' '}
            <Link href="/university-requests" className="ml-auto inline-block text-sm underline-offset-4 underline">
              Click Here
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        {universities.length === 0 ? (
          <div className="flex justify-center">
            <p className="leading-7 [&:not(:first-child)]:mt-6">No universities found.</p>
          </div>
        ) : (
          <UniversityCarousel universities={universities} />
        )}
      </div>
    </div>
  );
}
