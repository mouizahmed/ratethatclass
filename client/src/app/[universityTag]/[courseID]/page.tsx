import React from 'react';
import { getUniversity, getCourseByCourseTag, getProfessorsByCourseID } from '@/requests/getRequests';
import { getReviewsByCourseID } from '@/requests/getAuthenticatedRequests';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { Metadata } from 'next';
import { sortingOptions } from '@/lib/constants';
import { CourseReviews } from '@/components/display/CourseReviews';
import { decodeCourseId } from '@/lib/url';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{
    universityTag: string;
    courseID: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);
  const course = await getCourseByCourseTag(university.university_id, decodeCourseId(resolvedParams.courseID));

  if (!course.course_id) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.course_tag} - ${university.university_name} Course Reviews`,
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);
  const course = await getCourseByCourseTag(university.university_id, decodeCourseId(resolvedParams.courseID));

  if (!course.course_id) {
    notFound();
  }

  const professors = await getProfessorsByCourseID(course.course_id);

  const initialOrderBy = Object.keys(sortingOptions)[0];
  const initialOrder = 'desc' as const;

  const { data: initialReviews, meta } = await getReviewsByCourseID(
    course.course_id,
    1,
    10,
    undefined,
    undefined,
    undefined,
    initialOrderBy,
    initialOrder
  );

  const professorMap = professors.reduce((acc, obj) => {
    acc[obj.professor_id] = obj.professor_name;
    return acc;
  }, {} as Record<string, string>);

  const prevLinks = [
    {
      label: 'Home',
      link: '/',
    },
    {
      label: university?.university_name || '',
      link: `/${(university?.university_name || '').replaceAll(' ', '_').toLowerCase()}`,
    },
    {
      label: course?.course_tag || '',
      link: null,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4 p-8 sm:p-20">
      <UniversityHeader university={university} />
      <div className="w-full max-w-3xl">
        <BreadCrumb links={prevLinks} />
      </div>
      <CourseReviews
        course={course}
        initialReviews={initialReviews}
        initialHasMore={meta.total_pages > 1}
        professorList={professorMap}
      />
    </div>
  );
}
