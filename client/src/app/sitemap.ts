import { MetadataRoute } from 'next';
import { getUniversities, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { createDepartmentSlug, encodeCourseId } from '@/lib/url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ratethatclass.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/university-requests`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  try {
    const universities = await getUniversities();
    const allPages = [...staticPages];

    for (const university of universities) {
      const universityTag = university.university_name.replaceAll(' ', '_').toLowerCase();

      // Add university main page
      allPages.push({
        url: `${baseUrl}/${universityTag}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      });

      try {
        const departments = await getDepartmentsByUniversityID(university.university_id);

        for (const department of departments) {
          const departmentSlug = createDepartmentSlug(department.department_name);
          allPages.push({
            url: `${baseUrl}/${universityTag}/department/${departmentSlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          });
        }

        const { data: courses } = await getCoursesByUniversityID(
          university.university_id,
          1,
          100, // Limit to first 100 courses per university to keep sitemap manageable
          '',
          undefined,
          'review_count',
          'desc'
        );

        for (const course of courses) {
          const courseId = encodeCourseId(course.course_tag);
          allPages.push({
            url: `${baseUrl}/${universityTag}/${courseId}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
      } catch (error) {
        console.log(`Error fetching data for university ${university.university_name}:`, error);
        // Continue with other universities even if one fails
      }
    }

    return allPages;
  } catch (error) {
    console.log('Error generating sitemap:', error);
    return staticPages;
  }
}
