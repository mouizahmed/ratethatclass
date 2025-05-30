import { Metadata, Viewport } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
}

const DEFAULT_CONFIG = {
  siteName: 'Rate That Class',
  siteUrl: 'https://ratethatclass.com',
  defaultDescription:
    'Course selection made easier! Read anonymous reviews about university classes and help others make informed decisions.',
  defaultKeywords: ['course reviews', 'university', 'college', 'class reviews', 'student reviews', 'course selection'],
  defaultOgImage: '/og-image.jpg', // You'll need to add this image
  twitterHandle: '@ratethatclass',
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = DEFAULT_CONFIG.defaultOgImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noIndex = false,
    noFollow = false,
  } = config;

  const fullTitle = title.includes(DEFAULT_CONFIG.siteName) ? title : `${title} | ${DEFAULT_CONFIG.siteName}`;
  const fullDescription = description || DEFAULT_CONFIG.defaultDescription;
  const allKeywords = [...DEFAULT_CONFIG.defaultKeywords, ...keywords].join(', ');
  const canonicalUrl = canonical ? `${DEFAULT_CONFIG.siteUrl}${canonical}` : undefined;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${DEFAULT_CONFIG.siteUrl}${ogImage}`;

  const robots = [];
  if (noIndex) robots.push('noindex');
  if (noFollow) robots.push('nofollow');
  if (robots.length === 0) robots.push('index', 'follow');

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    authors: [{ name: DEFAULT_CONFIG.siteName }],
    creator: DEFAULT_CONFIG.siteName,
    publisher: DEFAULT_CONFIG.siteName,
    robots: robots.join(', '),
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
    openGraph: {
      type: ogType,
      title: fullTitle,
      description: fullDescription,
      siteName: DEFAULT_CONFIG.siteName,
      url: canonicalUrl,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description: fullDescription,
      images: [fullOgImage],
      creator: DEFAULT_CONFIG.twitterHandle,
      site: DEFAULT_CONFIG.twitterHandle,
    },
    manifest: '/manifest.json',
    // icons: {
    //   icon: [
    //     { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    //     { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    //   ],
    //   apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    // },
  };
}

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#000000',
  };
}

export const SEO_CONFIGS = {
  home: {
    title: 'Rate That Class - University Course Reviews',
    description:
      'Find honest, anonymous reviews of university courses. Make informed decisions about your class selection with real student feedback.',
    keywords: ['university course reviews', 'college class reviews', 'student feedback', 'course selection'],
    canonical: '/',
  },
  about: {
    title: 'About Rate That Class',
    description:
      'Learn about Rate That Class - the platform helping students make informed course selection decisions through anonymous reviews.',
    keywords: ['about', 'course review platform', 'student community'],
    canonical: '/about',
  },
  login: {
    title: 'Login to Rate That Class',
    description: 'Sign in to your Rate That Class account to write reviews and help fellow students.',
    keywords: ['login', 'sign in', 'student account'],
    canonical: '/login',
    noIndex: true,
  },
  register: {
    title: 'Create Account - Rate That Class',
    description:
      'Join Rate That Class to write anonymous course reviews and help other students make better decisions.',
    keywords: ['register', 'sign up', 'create account', 'student community'],
    canonical: '/register',
    noIndex: true,
  },
  profile: {
    title: 'My Profile - Rate That Class',
    description: 'Manage your Rate That Class profile and view your course reviews.',
    keywords: ['profile', 'account', 'my reviews'],
    canonical: '/profile',
    noIndex: true,
  },
  privacy: {
    title: 'Privacy Policy - Rate That Class',
    description: 'Read our privacy policy to understand how we protect your data and maintain anonymity.',
    keywords: ['privacy policy', 'data protection', 'anonymity'],
    canonical: '/privacy',
  },
  guidelines: {
    title: 'Community Guidelines - Rate That Class',
    description: 'Learn about our community guidelines for writing helpful and respectful course reviews.',
    keywords: ['guidelines', 'community rules', 'review standards'],
    canonical: '/guidelines',
  },
  universityRequests: {
    title: 'Request Your University - Rate That Class',
    description: "Don't see your university? Request it to be added to our platform.",
    keywords: ['university request', 'add university', 'new school'],
    canonical: '/university-requests',
  },
  notFound: {
    title: 'Page Not Found - Rate That Class',
    description: "The page you're looking for doesn't exist. Return to Rate That Class to find course reviews.",
    canonical: '/404',
    noIndex: true,
  },
};

export function generateUniversityMetadata(universityName: string, universityTag: string) {
  return generateMetadata({
    title: `${universityName} Course Reviews`,
    description: `Read honest student reviews for courses at ${universityName}. Find the best classes and make informed decisions about your academic path.`,
    keywords: [`${universityName}`, `${universityName} courses`, `${universityName} reviews`, 'university courses'],
    canonical: `/${universityTag}`,
  });
}

export function generateCourseMetadata(
  courseTag: string,
  courseName: string,
  universityName: string,
  universityTag: string,
  courseId: string
) {
  return generateMetadata({
    title: `${courseTag} - ${universityName} Course Reviews`,
    description: `Read student reviews for ${courseTag} ${
      courseName ? `(${courseName})` : ''
    } at ${universityName}. Get insights from real students who took this course.`,
    keywords: [
      courseTag,
      `${courseTag} ${universityName}`,
      `${universityName} ${courseTag}`,
      courseName || '',
      'course review',
      'class review',
    ].filter(Boolean),
    canonical: `/${universityTag}/${courseId}`,
    ogType: 'article',
  });
}

export function generateDepartmentMetadata(
  departmentName: string,
  universityName: string,
  universityTag: string,
  departmentSlug: string
) {
  return generateMetadata({
    title: `${departmentName} Courses - ${universityName}`,
    description: `Browse ${departmentName} courses at ${universityName}. Read student reviews and find the best classes in this department.`,
    keywords: [
      `${departmentName}`,
      `${departmentName} ${universityName}`,
      `${universityName} ${departmentName}`,
      'department courses',
    ],
    canonical: `/${universityTag}/department/${departmentSlug}`,
  });
}
