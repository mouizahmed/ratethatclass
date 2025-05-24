import React from 'react';
import { getUniversity, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { CourseCard } from '@/components/display/CourseCard';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { CourseList } from '@/components/display/CourseList';
import { Metadata } from 'next';
import { courseSortingOptions } from '@/lib/constants';

export async function generateMetadata({ params }: { params: { universityTag: string } }): Promise<Metadata> {
  const university = await getUniversity(params.universityTag);
  return {
    title: `${university.university_name} - Course Reviews`,
  };
}

export default async function Page({ params }: { params: { universityTag: string } }) {
  const university = await getUniversity(params.universityTag);
  const departments = await getDepartmentsByUniversityID(university.university_id);

  // Default sorting parameters
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
      <CourseList
        initialCourses={initialCourses}
        initialHasMore={meta.total_pages > 1}
        universityId={university.university_id}
        departmentList={departmentMap}
      />
    </div>
  );
}
