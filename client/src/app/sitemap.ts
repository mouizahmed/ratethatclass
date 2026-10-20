import { MetadataRoute } from 'next';
import { getUniversities, getCoursesByUniversityId, getDepartmentsByUniversityId } from '@/requests/getRequests';
import { createDepartmentSlug, encodeCourseId } from '@/lib/url';
import { SITE_URL, universityTagFromName } from '@/lib/seo';

// Rebuild the sitemap once a day so new courses get picked up
export const revalidate = 86400;

const STATIC_PATHS = ['', '/about', '/privacy', '/guidelines', '/university-requests'];
const COURSES_PER_PAGE = 1000;

async function getAllCourseTags(universityId: string): Promise<string[]> {
  const tags: string[] = [];
  for (let page = 1; ; page++) {
    const { data, meta } = await getCoursesByUniversityId(universityId, page, COURSES_PER_PAGE);
    tags.push(...data.map((course) => course.course_tag));
    if (page >= meta.total_pages) return tags;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls = STATIC_PATHS.map((path) => `${SITE_URL}${path}`);

  try {
    const universities = await getUniversities();
    for (const university of universities) {
      const universityUrl = `${SITE_URL}/${universityTagFromName(university.university_name)}`;
      const [departments, courseTags] = await Promise.all([
        getDepartmentsByUniversityId(university.university_id),
        getAllCourseTags(university.university_id),
      ]);

      urls.push(universityUrl);
      urls.push(...departments.map((d) => `${universityUrl}/department/${createDepartmentSlug(d.department_name)}`));
      urls.push(...courseTags.map((tag) => `${universityUrl}/${encodeCourseId(tag)}`));
    }
  } catch (error) {
    console.log('Failed to generate dynamic sitemap entries, using static pages only:', error);
  }

  return urls.map((url) => ({ url }));
}
