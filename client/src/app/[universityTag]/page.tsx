'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getUniversity, getCoursesByUniversityID, getDepartmentsByUniversityID } from '@/requests/getRequests';
import { Course, University } from '@/types/university';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { CourseCard } from '@/components/display/CourseCard';
import Search from '@/components/common/Search';
import { MultipleSelector } from '@/components/ui/multipleselector';
import { Dropdown } from '@/components/common/Dropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow } from 'lucide-react';
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

export default function Page() {
  const { universityTag } = useParams();
  const { addAlert } = useAlert();
  const router = useRouter();

  const [university, setUniversity] = useState<University>();
  const [courseList, setCourseList] = useState<Course[]>();

  const [departmentList, setDepartmentList] = useState<Record<string, string>>({});
  const [selectedDepartments, setSelectedDepartments] = useState<Record<string, string>>({});
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedSearchValue, setSelectedSearchValue] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof typeof courseSortingOptions>(Object.keys(courseSortingOptions)[0] || '');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!universityTag) return;

    const loadUniversity = async () => {
      const universityInfo: University = await getUniversity(universityTag as string);
      setUniversity(universityInfo);

      return universityInfo;
    };

    const loadCourses = async (university: University) => {
      const courses: Course[] = await getCoursesByUniversityID(university.university_id);
      setCourseList(courses);

      return courses;
    };

    const loadDepartments = async (university: University) => {
      const departments: Record<string, string> = await getDepartmentsByUniversityID(university.university_id).then(
        (response) =>
          response.reduce((acc, obj) => {
            acc[obj.department_id] = obj.department_name;
            return acc;
          }, {} as Record<string, string>)
      );

      setDepartmentList(departments);

      return departments;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const universityInfo: University = await loadUniversity();
        await loadCourses(universityInfo);
        await loadDepartments(universityInfo);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        addAlert('destructive', (error as Error).message, 3000);
      }
    };

    fetchData();
  }, [universityTag, addAlert]);

  function updateSort() {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  const filterSearch = useCallback(
    (course: Course) => {
      let searchCheck = true;
      let departmentCheck = true;

      if (searchValue.length !== 0) {
        searchCheck =
          course.course_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          course.course_tag.toLowerCase().includes(searchValue.toLowerCase());
      }

      if (Object.keys(selectedDepartments).length !== 0) {
        departmentCheck = Object.prototype.hasOwnProperty.call(selectedDepartments, course.department_id ?? '');
      }

      return searchCheck && departmentCheck;
    },
    [searchValue, selectedDepartments]
  );

  const sortedRows = React.useMemo(
    () => [...(courseList || [])].sort(getComparator(order, orderBy)).filter(filterSearch),
    [courseList, order, orderBy, filterSearch]
  );

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

    const courseLink = data.courseStep.courseTag.replaceAll(' ', '_');
    router.push(`/${universityTag}/${courseLink}`);
  };

  return (
    <div className="">
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="medium" />
        </div>
      ) : university != undefined && Object.keys(university).length > 0 ? (
        <div className="flex flex-col items-center gap-4 p-8 sm:p-20">
          <UniversityHeader university={university} />
          <div className="w-full max-w-3xl">
            <BreadCrumb links={prevLinks} />
          </div>
          {courseList && (
            <React.Fragment>
              <div className="w-full max-w-3xl">
                <Search
                  data={courseList}
                  valueKey="course_tag"
                  labelKey="course_name"
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  selectedValue={selectedSearchValue}
                  setSelectedValue={setSelectedSearchValue}
                  placeholder="Search courses..."
                  emptyMessage="No courses found."
                />
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
                    // Dynamically build the schema using the current courseList.
                    schema={getNewCourseFormSchema(courseList ?? [])}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-10 w-full max-w-3xl">
                {sortedRows.map((course) => (
                  <CourseCard key={course.course_id} course={course} />
                ))}
              </div>
            </React.Fragment>
          )}
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
