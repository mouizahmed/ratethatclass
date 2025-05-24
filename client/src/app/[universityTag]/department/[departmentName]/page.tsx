import React from 'react';
import { getUniversity, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { CourseList } from '@/components/display/CourseList';
import { Metadata } from 'next';
import { courseSortingOptions } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { createDepartmentSlug } from '@/lib/url';

type PageProps = {
  params: Promise<{
    universityTag: string;
    departmentName: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);

  if (!university.university_id) {
    return {
      title: 'University Not Found',
    };
  }

  const departments = await getDepartmentsByUniversityID(university.university_id);
  const department = departments.find((d) => createDepartmentSlug(d.department_name) === resolvedParams.departmentName);

  if (!department) {
    return {
      title: 'Department Not Found',
    };
  }

  return {
    title: `${department.department_name} Courses at ${university.university_name} - Course Reviews`,
    description: `Browse and review courses in the ${department.department_name} department at ${university.university_name}. Find detailed course reviews, ratings, and student feedback.`,
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);

  if (!university.university_id) {
    notFound();
  }

  const departments = await getDepartmentsByUniversityID(university.university_id);
  const department = departments.find((d) => createDepartmentSlug(d.department_name) === resolvedParams.departmentName);

  if (!department) {
    notFound();
  }

  const initialOrderBy = Object.keys(courseSortingOptions)[0];
  const initialOrder = 'desc' as const;

  const { data: initialCourses, meta } = await getCoursesByUniversityID(
    university.university_id,
    1,
    20,
    '',
    department.department_id,
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
      link: `/${resolvedParams.universityTag}`,
    },
    {
      label: department.department_name,
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
        initialDepartment={department.department_id}
      />
    </div>
  );
}
