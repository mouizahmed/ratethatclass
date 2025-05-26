import Link from 'next/link';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.notFound);
export const viewport = generateViewport();

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong
        URL.
      </p>
      <Link href="/" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
