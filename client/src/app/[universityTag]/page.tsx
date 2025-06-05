import React from 'react';
import { getUniversity, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { CourseList } from '@/components/display/CourseList';
import { Metadata } from 'next';
import { courseSortingOptions } from '@/lib/constants';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createDepartmentSlug } from '@/lib/url';
import { UniversityPageProps } from '@/types/pages';
import { generateUniversityMetadata, generateViewport } from '@/lib/seo';

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);

  if (!university.university_id) {
    return {
      title: 'University Not Found',
      description: 'The university you are looking for could not be found.',
      robots: 'noindex, nofollow',
    };
  }

  return generateUniversityMetadata(university.university_name, resolvedParams.universityTag);
}

export const viewport = generateViewport();

export default async function Page({ params }: UniversityPageProps) {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);

  if (!university.university_id) {
    notFound();
  }

  const departments = await getDepartmentsByUniversityID(university.university_id);

  const initialOrderBy = Object.keys(courseSortingOptions)[0];
  const initialOrder = 'desc' as const;

  const { data: initialCourses, meta } = await getCoursesByUniversityID(
    university.university_id,
    1,
    20,
    '',
    undefined,
    initialOrderBy,
    initialOrder
  );

  const departmentMap = departments.reduce((acc, obj) => {
    acc[obj.department_id] = obj.department_name;
    return acc;
  }, {} as Record<string, string>);

  const prevLinks = [
    {
      label: 'Home',
      link: '/',
    },
    {
      label: university?.university_name || '',
      link: null,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4 p-8 sm:p-20">
      <UniversityHeader university={university} />
      <div className="w-full max-w-3xl">
        <BreadCrumb links={prevLinks} />
      </div>
      <div className="w-full max-w-3xl flex flex-wrap gap-2 sr-only">
        {departments.slice(0, 10).map((dept) => (
          <Link
            key={dept.department_id}
            href={`/${resolvedParams.universityTag}/department/${createDepartmentSlug(dept.department_name)}`}
            className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full text-sm transition-colors"
          >
            {dept.department_name}
          </Link>
        ))}
      </div>
      <CourseList
        initialCourses={initialCourses}
        initialHasMore={meta.total_pages > 1}
        universityId={university.university_id}
        universityName={university.university_name}
        departmentList={departmentMap}
      />
    </div>
  );
}
