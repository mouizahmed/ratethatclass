import { Metadata } from 'next';

export const SITE_NAME = 'Rate That Class';
export const SITE_URL = 'https://ratethatclass.com';
export const SITE_DESCRIPTION =
  'Find honest, anonymous reviews of university courses. Make informed decisions about your class selection with real student feedback.';

export const OG_IMAGES = [{ url: '/rtc_logo.png', width: 512, height: 512, alt: SITE_NAME }];

export const noIndex: Metadata['robots'] = { index: false, follow: false };

export function universityTagFromName(universityName: string): string {
  return universityName.replaceAll(' ', '_').toLowerCase();
}

function pageMetadata(title: string, description: string, canonical: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    // openGraph is replaced, not merged, so the shared fields have to be repeated here
    openGraph: { type: 'website', siteName: SITE_NAME, images: OG_IMAGES, title, description, url: canonical },
  };
}

export function universityMetadata(universityName: string, universityTag: string): Metadata {
  return pageMetadata(
    `${universityName} Course Reviews`,
    `Read honest student reviews for courses at ${universityName}. Find the best classes and make informed decisions about your academic path.`,
    `/${universityTag}`
  );
}

export function courseMetadata(
  courseTag: string,
  courseName: string,
  universityName: string,
  universityTag: string,
  courseId: string
): Metadata {
  return pageMetadata(
    `${courseTag} - ${universityName} Course Reviews`,
    `Read student reviews for ${courseTag}${
      courseName ? ` (${courseName})` : ''
    } at ${universityName}. Get insights from real students who took this course.`,
    `/${universityTag}/${courseId}`
  );
}

export function departmentMetadata(
  departmentName: string,
  universityName: string,
  universityTag: string,
  departmentSlug: string
): Metadata {
  return pageMetadata(
    `${departmentName} Courses - ${universityName}`,
    `Browse ${departmentName} courses at ${universityName}. Read student reviews and find the best classes in this department.`,
    `/${universityTag}/department/${departmentSlug}`
  );
}
