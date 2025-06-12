import React from 'react';
import { getUniversity, getCourseByCourseTag, getProfessorsByCourseId } from '@/requests/getRequests';
import { getReviewsByCourseId } from '@/requests/getRequests';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { Metadata } from 'next';
import { sortingOptions } from '@/lib/constants';
import { CourseReviews } from '@/components/display/CourseReviews';
import { decodeCourseId } from '@/lib/url';
import { notFound } from 'next/navigation';
import { generateCourseMetadata, generateViewport } from '@/lib/seo';
import { CoursePageProps } from '@/types/pages';

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);
  const course = await getCourseByCourseTag(university.university_id, decodeCourseId(resolvedParams.courseId));

  if (!course.course_id) {
    return {
      title: 'Course Not Found',
      description: 'The course you are looking for could not be found.',
      robots: 'noindex, nofollow',
    };
  }

  return generateCourseMetadata(
    course.course_tag,
    course.course_name || '',
    university.university_name,
    resolvedParams.universityTag,
    resolvedParams.courseId
  );
}

export const viewport = generateViewport();

export default async function Page({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const university = await getUniversity(resolvedParams.universityTag);
  const course = await getCourseByCourseTag(university.university_id, decodeCourseId(resolvedParams.courseId));

  if (!course.course_id) {
    notFound();
  }

  const professors = await getProfessorsByCourseId(course.course_id);

  const initialOrderBy = Object.keys(sortingOptions)[0];
  const initialOrder = 'desc' as const;

  const { data: initialReviews, meta } = await getReviewsByCourseId(
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
