'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/university';
import Link from 'next/link';
import { ratingItem } from '@/lib/display';
import { encodeCourseId } from '@/lib/url';

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="w-full">
      <Link href={`/${course.university_name.replaceAll(' ', '_').toLowerCase()}/${encodeCourseId(course.course_tag)}`}>
        <Card className="w-full hover:bg-zinc-50 cursor-pointer hover:shadow-md hover:border-zinc-300 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <div className="flex-1">
                  {course?.course_tag}: {course?.course_name}
                </div>
                <div className="text-md text-muted-foreground font-normal mt-1 sm:mt-0">{course?.department_name}</div>
              </div>
            </CardTitle>
            <CardDescription className="m-0">
              <p className="leading-7 font-bold text-black">{course?.review_num} Reviews</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {ratingItem(
                {
                  type: 'overall',
                  label: 'Overall',
                  value: course?.overall_score || 0,
                },
                1
              )}
              {ratingItem(
                {
                  type: 'easy',
                  label: 'Easiness',
                  value: course?.easy_score || 0,
                },
                1
              )}
              {ratingItem(
                {
                  type: 'interest',
                  label: 'Interest',
                  value: course?.interest_score || 0,
                },
                1
              )}
              {ratingItem(
                {
                  type: 'use',
                  label: 'Usefulness',
                  value: course?.useful_score || 0,
                },
                1
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
