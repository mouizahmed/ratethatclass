import React from 'react';
import { getCoursesByUniversityId } from '@/requests/getRequests';
import { getUniversityCached, getDepartmentsCached } from '@/requests/cachedRequests';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { CourseList } from '@/components/display/CourseList';
import { Metadata } from 'next';
import { courseSortingOptions } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { UniversityPageProps } from '@/types/pages';
import { universityMetadata, noIndex } from '@/lib/seo';

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const university = await getUniversityCached(resolvedParams.universityTag);

  if (!university.university_id) {
    return {
      title: 'University Not Found',
      description: 'The university you are looking for could not be found.',
      robots: noIndex,
    };
  }

  return universityMetadata(university.university_name, resolvedParams.universityTag);
}

export default async function Page({ params }: UniversityPageProps) {
  const resolvedParams = await params;
  const university = await getUniversityCached(resolvedParams.universityTag);

  if (!university.university_id) {
    notFound();
  }

  const departments = await getDepartmentsCached(university.university_id);

  const initialOrderBy = Object.keys(courseSortingOptions)[0];
  const initialOrder = 'desc' as const;

  const { data: initialCourses, meta } = await getCoursesByUniversityId(
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
