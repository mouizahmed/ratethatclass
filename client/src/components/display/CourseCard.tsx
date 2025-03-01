'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/university';
import { Rating } from '@/types/review';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { ratingItem } from '@/lib/display';

export function CourseCard({ course }: { course: Course }) {
  const checkColor = (color: number) => {
    if (color == 0) {
      return 'bg-gray-600';
    } else if (color <= 2) {
      return 'bg-red-600';
    } else if (color > 2 && color < 4) {
      return 'bg-yellow-600';
    } else {
      return 'bg-green-600';
    }
  };

  return (
    <div className="w-full">
      <Link href={`/${course.university_name.replace(' ', '_').toLowerCase()}/${course.course_tag.replace(' ', '_')}`}>
        <Card className="w-full hover:bg-zinc-100 cursor-pointer hover:shadow-xl hover:border-zinc-300">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2 h-7">
                {course?.course_tag}: {course?.course_name}
                <Separator orientation="vertical" className="min-h-full" />
                <p className="text-md text-muted-foreground">{course?.department_name}</p>
              </div>
            </CardTitle>

            <CardDescription className="m-0">
              <p id="department" className="leading-7 font-bold text-black">
                {course?.review_num} Reviews
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="border rounded-lg m-2 p-2">
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
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
