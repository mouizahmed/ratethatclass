'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getUniversity, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { Course, University } from '@/types/university';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { CourseCard } from '@/components/display/CourseCard';
import { Input } from '@/components/ui/input';
import { MultipleSelector } from '@/components/ui/multipleselector';
import { Dropdown } from '@/components/common/Dropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getComparator } from '@/lib/utils';
import { useAlert } from '@/contexts/alertContext';
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
import { BreadCrumb } from '@/components/display/BreadCrumb';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from 'next/navigation';

const sortCourses = (courses: Course[], order: 'asc' | 'desc', orderBy: keyof typeof courseSortingOptions) => {
  return [...courses].sort(getComparator(order, orderBy));
};

export default function Page() {
  const { universityTag } = useParams();
  const { addAlert } = useAlert();
  const router = useRouter();

  const [university, setUniversity] = useState<University>({} as University);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [departmentList, setDepartmentList] = useState<Record<string, string>>({});
  const [selectedDepartments, setSelectedDepartments] = useState<Record<string, string>>({});
  const [searchValue, setSearchValue] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof typeof courseSortingOptions>(Object.keys(courseSortingOptions)[0] || '');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialLoadCompleteRef = useRef<boolean>(false);

  useEffect(() => {
    if (!universityTag) return;

    const fetchInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const universityInfo = await getUniversity(universityTag as string);
        setUniversity(universityInfo);

        const { data } = await getCoursesByUniversityID(universityInfo.university_id, 1, 20, '');
        setCourseList(data);

        const departments = await getDepartmentsByUniversityID(universityInfo.university_id);
        const departmentMap = departments.reduce((acc, obj) => {
          acc[obj.department_id] = obj.department_name;
          return acc;
        }, {} as Record<string, string>);
        setDepartmentList(departmentMap);
        initialLoadCompleteRef.current = true;
      } catch (error) {
        console.error(error);
        addAlert('destructive', (error as Error).message, 3000);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [universityTag, addAlert]);

  useEffect(() => {
    if (!university.university_id || !initialLoadCompleteRef.current) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearchLoading(true);
        setCurrentPage(1);
        const departmentIDsArray = Object.keys(selectedDepartments);
        const { data, meta } = await getCoursesByUniversityID(
          university.university_id,
          1,
          20,
          searchValue,
          departmentIDsArray.length > 0 ? departmentIDsArray : undefined
        );
        setCourseList(data);
        setHasMore(meta.total_pages > 1);
      } catch (error) {
        console.error(error);
        addAlert('destructive', 'Failed to search courses', 3000);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, university.university_id, selectedDepartments, addAlert]);

  const loadMoreCourses = useCallback(async () => {
    if (!university.university_id || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const departmentIDsArray = Object.keys(selectedDepartments);
      const { data, meta } = await getCoursesByUniversityID(
        university.university_id,
        currentPage + 1,
        20,
        searchValue,
        departmentIDsArray.length > 0 ? departmentIDsArray : undefined
      );
      setCourseList((prev) => [...prev, ...data]);
      setCurrentPage((prev) => prev + 1);

      setHasMore(currentPage + 1 < meta.total_pages);
    } catch (error) {
      console.error(error);
      addAlert('destructive', 'Failed to load more courses', 3000);
    } finally {
      setIsLoadingMore(false);
    }
  }, [university.university_id, currentPage, isLoadingMore, hasMore, addAlert, searchValue, selectedDepartments]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isSearchLoading) {
          loadMoreCourses();
        }
      },
      { threshold: 0.1 }
    );

    const target = loadMoreRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMoreCourses, hasMore, isLoadingMore, isSearchLoading]);

  function updateSort() {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  const sortedRows = React.useMemo(() => sortCourses(courseList, order, orderBy), [courseList, order, orderBy]);

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
      university_id: university?.university_id ?? '',
      university_name: university?.university_name ?? '',
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
    };

    await postCourse(courseData, reviewData);

    const courseLink = data.courseStep.courseTag.trim().replaceAll(' ', '_');
    router.push(`/${universityTag}/${courseLink}`);
  };

  return (
    <div className="">
      {isInitialLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="medium" />
        </div>
      ) : university != undefined && Object.keys(university).length > 0 ? (
        <div className="flex flex-col items-center gap-4 p-8 sm:p-20">
          <UniversityHeader university={university} />
          <div className="w-full max-w-3xl">
            <BreadCrumb links={prevLinks} />
          </div>

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
            <div>
              <MultipleSelector
                data={departmentList}
                value={selectedDepartments}
                setValue={setSelectedDepartments}
                placeholder="Departments..."
                itemType="departments"
              />
            </div>
            <div className="flex items-center justify-center gap-5">
              <Dropdown
                data={courseSortingOptions}
                value={orderBy}
                setValue={setOrderBy}
                placeholder="Sort By"
                initialValue={Object.keys(courseSortingOptions)[0] || ''}
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

          <div className="grid md:grid-cols-2 gap-10 w-full max-w-3xl">
            {isSearchLoading ? (
              <div className="col-span-2 flex justify-center py-10">
                <Spinner size="medium" />
              </div>
            ) : sortedRows.length > 0 ? (
              <>
                {sortedRows.map((course) => (
                  <CourseCard key={course.course_id} course={course} />
                ))}
                <div ref={loadMoreRef} className="col-span-2 flex justify-center py-4">
                  {isLoadingMore && <Spinner size="small" />}
                </div>
              </>
            ) : (
              <div className="col-span-2 flex justify-center py-10">
                <p className="text-lg text-gray-500">No courses match your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 justify-center h-screen items-center">
          <div className="flex flex-col justify-center items-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              There are no universities that match your search criteria.
            </h3>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              If you think there is a missing university, you can submit a request to add it here.
            </h3>
          </div>
          <Link href="/university-requests">
            <Button>Request University</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
