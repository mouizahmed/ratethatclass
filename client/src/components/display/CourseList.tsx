'use client';

import React, { useState, useCallback } from 'react';
import { Course } from '@/types/university';
import { CourseCard } from '@/components/display/CourseCard';
import { Input } from '@/components/ui/input';
import { Dropdown } from '@/components/common/Dropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { courseSortingOptions } from '@/lib/constants';
import { DialogForm, StepProps } from '@/components/forms/DialogForm';
import { ReviewMetadataForm } from '@/components/forms/steps/ReviewMetadataForm';
import { getNewCourseFormSchema } from '@/components/forms/schema';
import { CourseForm } from '@/components/forms/steps/CourseForm';
import { ReviewCommentsForm } from '@/components/forms/steps/ReviewCommentsForm';
import { ReviewRatingForm } from '@/components/forms/steps/ReviewRatingForm';
import ReviewConfirmationForm from '@/components/forms/steps/ReviewConfirmationForm';
import { getCurrentSQLDate } from '@/lib/utils';
import { Delivery, Grade, Review, Term, Textbook, Vote, Workload } from '@/types/review';
import { postCourse } from '@/requests/postRequests';
import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { getCoursesByUniversityId } from '@/requests/getRequests';
import { encodeCourseId } from '@/lib/url';
import { AuthProvider } from '@/contexts/authContext';
import { toastUtils } from '@/lib/toast-utils';

interface CourseListProps {
  initialCourses: Course[];
  initialHasMore: boolean;
  universityId: string;
  universityName: string;
  departmentList: Record<string, string>;
  initialDepartment?: string;
}

export function CourseList({
  initialCourses,
  initialHasMore,
  universityId,
  universityName,
  departmentList,
  initialDepartment,
}: CourseListProps) {
  return (
    <AuthProvider>
      <CourseListContent
        initialCourses={initialCourses}
        initialHasMore={initialHasMore}
        universityId={universityId}
        universityName={universityName}
        departmentList={departmentList}
        initialDepartment={initialDepartment}
      />
    </AuthProvider>
  );
}

function CourseListContent({
  initialCourses,
  initialHasMore,
  universityId,
  universityName,
  departmentList,
  initialDepartment,
}: CourseListProps) {
  const router = useRouter();

  const [courseList, setCourseList] = useState<Course[]>(initialCourses);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment || '');
  const [searchValue, setSearchValue] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof typeof courseSortingOptions>('');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedDepartment = useDebounce(selectedDepartment, 300);
  const debouncedOrder = useDebounce(order, 300);
  const debouncedOrderBy = useDebounce(orderBy, 300);

  const fetchCourses = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setIsSearchLoading(true);
        const { data, meta } = await getCoursesByUniversityId(
          universityId,
          page,
          20,
          debouncedSearchValue,
          debouncedDepartment || undefined,
          debouncedOrderBy,
          debouncedOrder
        );

        if (append) {
          setCourseList((prev) => [...prev, ...data]);
        } else {
          setCourseList(data);
        }
        setHasMore(page < meta.total_pages);
        setCurrentPage(page);
      } catch (error) {
        console.log('Error fetching courses:', error);
        toastUtils.loadError('courses');
      } finally {
        setIsSearchLoading(false);
      }
    },
    [universityId, debouncedSearchValue, debouncedDepartment, debouncedOrderBy, debouncedOrder]
  );

  React.useEffect(() => {
    const isInitialState =
      debouncedSearchValue === '' &&
      debouncedDepartment === (initialDepartment || '') &&
      debouncedOrder === 'desc' &&
      (debouncedOrderBy === '' || debouncedOrderBy === Object.keys(courseSortingOptions)[0]);

    if (isInitialState && !debouncedSearchValue) {
      setCourseList(initialCourses);
      setHasMore(initialHasMore);
      setCurrentPage(1);
      return;
    }

    fetchCourses(1, false);
  }, [
    debouncedSearchValue,
    debouncedDepartment,
    debouncedOrder,
    debouncedOrderBy,
    fetchCourses,
    initialCourses,
    initialHasMore,
    initialDepartment,
  ]);

  const loadMoreCourses = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const { data, meta } = await getCoursesByUniversityId(
        universityId,
        currentPage + 1,
        20,
        debouncedSearchValue,
        debouncedDepartment || undefined,
        debouncedOrderBy,
        debouncedOrder
      );

      setCourseList((prev) => [...prev, ...data]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(currentPage + 1 < meta.total_pages);
    } catch (error) {
      console.log(error);
      toastUtils.loadError('more courses');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    currentPage,
    isLoadingMore,
    hasMore,
    universityId,
    debouncedSearchValue,
    debouncedDepartment,
    debouncedOrderBy,
    debouncedOrder,
  ]);

  function updateSort() {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  const steps: StepProps<ReturnType<typeof getNewCourseFormSchema>>[] = [
    {
      title: 'Add Course',
      description: 'Please provide your personal details',
      content: () => <CourseForm departmentList={departmentList} courseList={courseList ?? []} />,
      fields: ['courseStep'],
    },
    {
      title: 'Review Ratings',
      description: 'Please provide your personal details',
      content: ReviewRatingForm,
      fields: ['reviewRatingsStep'],
    },
    {
      title: 'Review Details',
      description: 'Please enter the details of your review.',
      content: () => <ReviewMetadataForm />,
      fields: ['reviewMetadataStep'],
    },
    {
      title: 'Review Comments',
      description: 'Please enter comments about your review.',
      content: () => <ReviewCommentsForm />,
      fields: ['reviewCommentsStep'],
    },
    {
      title: 'Confirmation',
      description: 'Please Confirm your review',
      content: () => <ReviewConfirmationForm />,
    },
  ];

  const handleSubmit = async (data: {
    courseStep: {
      courseTag: string;
      courseName: string;
      departmentName: string;
    };
    reviewMetadataStep: {
      professorName: string;
      grade: Grade | null;
      deliveryMethod: Delivery;
      workload: Workload;
      textbookUse: Textbook;
      evaluationMethods: Record<string, boolean>;
      yearTaken: string;
      termTaken: Term;
    };
    reviewRatingsStep: {
      overallScore: number;
      easyScore: number;
      interestScore: number;
      usefulScore: number;
    };
    reviewCommentsStep: {
      courseComments: string;
      professorComments: string;
      adviceComments: string;
    };
  }) => {
    const courseData: Course = {
      university_id: universityId,
      university_name: universityName,
      course_tag: data.courseStep.courseTag,
      course_name: data.courseStep.courseName,
      department_name: data.courseStep.departmentName,
    };

    const reviewData: Review = {
      professor_name: data.reviewMetadataStep.professorName,
      grade: data.reviewMetadataStep.grade,
      delivery_method: data.reviewMetadataStep.deliveryMethod,
      workload: data.reviewMetadataStep.workload,
      textbook_use: data.reviewMetadataStep.textbookUse,
      evaluation_methods: Object.keys(data.reviewMetadataStep.evaluationMethods),
      overall_score: data.reviewRatingsStep.overallScore,
      easy_score: data.reviewRatingsStep.easyScore,
      interest_score: data.reviewRatingsStep.interestScore,
      useful_score: data.reviewRatingsStep.usefulScore,
      year_taken: data.reviewMetadataStep.yearTaken,
      term_taken: data.reviewMetadataStep.termTaken,
      date_uploaded: getCurrentSQLDate(),
      course_comments: data.reviewCommentsStep.courseComments,
      professor_comments: data.reviewCommentsStep.professorComments,
      advice_comments: data.reviewCommentsStep.adviceComments,
      vote: Vote.up,
      account_type: 'student', // change
    };

    await postCourse(courseData, reviewData);

    const universityTag = universityName.replaceAll(' ', '_').toLowerCase();
    const courseLink = encodeCourseId(data.courseStep.courseTag);
    router.push(`/${universityTag}/${courseLink}`);
  };

  return (
    <>
      <div className="w-full max-w-3xl">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pr-10"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full max-w-3xl flex flex-col gap-4 md:grid md:grid-cols-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Dropdown
              data={departmentList}
              value={selectedDepartment}
              setValue={setSelectedDepartment}
              placeholder={
                selectedDepartment ? `Department: ${departmentList[selectedDepartment] || ''}` : 'Select Department'
              }
              initialValue=""
              returnType="key"
            />
          </div>
          {selectedDepartment && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDepartment('')}
              className="h-10 w-10 flex-shrink-0"
              title="Clear department filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center gap-5">
          <Dropdown
            data={courseSortingOptions}
            value={orderBy}
            setValue={setOrderBy}
            placeholder="Sort By"
            initialValue={''}
            returnType="key"
          />
          <Button variant="outline" className="h-10 w-10" onClick={updateSort}>
            {order === 'desc' ? <ArrowDownWideNarrow /> : <ArrowUpWideNarrow />}
          </Button>
        </div>
        <div className="col-span-2 flex">
          <DialogForm
            triggerButton={<Button className="w-full">Add Course</Button>}
            steps={steps}
            onSubmit={handleSubmit}
            schema={getNewCourseFormSchema(courseList ?? [])}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-3xl">
        {isSearchLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="medium" />
          </div>
        ) : courseList.length > 0 ? (
          <>
            {courseList.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
            <div className="flex justify-center py-4">
              {hasMore && (
                <Button onClick={loadMoreCourses} disabled={isLoadingMore} className="w-40" data-noindex="true">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="small" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More'
                  )}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center py-10">
            <p className="text-lg text-gray-500">No courses match your search criteria.</p>
          </div>
        )}
      </div>
    </>
  );
}
