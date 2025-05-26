import { MetadataRoute } from 'next';
import { getUniversities, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { createDepartmentSlug, encodeCourseId } from '@/lib/url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ratethatclass.com';

  // Static pages that are always included
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/university-requests`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Try to generate dynamic pages if API is available
  try {
    const dynamicPages = await generateDynamicPages(baseUrl);
    const allPages = [...staticPages, ...dynamicPages];

    console.log(
      `Generated sitemap with ${allPages.length} URLs (${staticPages.length} static, ${dynamicPages.length} dynamic)`
    );
    return allPages;
  } catch (error) {
    console.log('Failed to generate dynamic sitemap, using static pages only:', error);
    console.log(`Generated sitemap with ${staticPages.length} static URLs only`);
    return staticPages;
  }
}

async function generateDynamicPages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const dynamicPages: MetadataRoute.Sitemap = [];

  // Fetch universities with timeout
  const universities = await Promise.race([
    getUniversities(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Universities API timeout')), 10000)),
  ]);

  if (!universities || universities.length === 0) {
    throw new Error('No universities found');
  }

  // Limit to prevent sitemap from becoming too large
  const maxUniversities = 25;
  const maxCoursesPerUniversity = 100;
  const maxDepartmentsPerUniversity = 30;

  for (const university of universities.slice(0, maxUniversities)) {
    const universityTag = university.university_name.replaceAll(' ', '_').toLowerCase();

    // Add university page
    dynamicPages.push({
      url: `${baseUrl}/${universityTag}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    try {
      // Fetch departments for this university
      const departments = await Promise.race([
        getDepartmentsByUniversityID(university.university_id.toString()),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Departments timeout')), 5000)),
      ]);

      // Add department pages
      for (const department of departments.slice(0, maxDepartmentsPerUniversity)) {
        const departmentSlug = createDepartmentSlug(department.department_name);
        dynamicPages.push({
          url: `${baseUrl}/${universityTag}/department/${departmentSlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Fetch courses for this university
      const coursesResponse = await Promise.race([
        getCoursesByUniversityID(
          university.university_id.toString(),
          1,
          maxCoursesPerUniversity,
          '',
          undefined,
          'review_count',
          'desc'
        ),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Courses timeout')), 5000)),
      ]);

      // Add course pages
      for (const course of coursesResponse.data) {
        const courseId = encodeCourseId(course.course_tag);
        dynamicPages.push({
          url: `${baseUrl}/${universityTag}/${courseId}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    } catch (error) {
      console.log(`Skipping detailed pages for ${university.university_name}:`, error);
    }
  }

  return dynamicPages;
}
