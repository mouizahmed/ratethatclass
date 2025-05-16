'use client';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  getUniversity,
  getCourseByCourseTag,
  getReviewsByCourseID,
  getProfessorsByCourseID,
} from '@/requests/getRequests';
import { Course, University, Professor } from '@/types/university';
import { Delivery, Evaluation, Grade, Review, Term, Textbook, Vote, Workload } from '@/types/review';
import { UniversityHeader } from '@/components/display/UniversityHeader';
import { Dropdown } from '@/components/common/Dropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow, EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from '@/components/display/ReviewCard';
import { useAlert } from '@/contexts/alertContext';
import { Separator } from '@/components/ui/separator';
import { DialogForm, StepProps } from '@/components/forms/DialogForm';
import { newReviewForm } from '@/components/forms/schema';
import { ReviewRatingForm } from '@/components/forms/steps/ReviewRatingForm';
import { ReviewMetadataForm } from '@/components/forms/steps/ReviewMetadataForm';
import { ReviewCommentsForm } from '@/components/forms/steps/ReviewCommentsForm';
import ReviewConfirmationForm from '@/components/forms/steps/ReviewConfirmationForm';
import { getCurrentSQLDate } from '@/lib/utils';
import { postReview } from '@/requests/postRequests';
import { useAuth } from '@/contexts/authContext';
import { BreadCrumb } from '@/components/display/BreadCrumb';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { ratingItem } from '@/lib/display';
import { deliveryOptions, sortingOptions, termOptions } from '@/lib/constants';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { ReportDialog } from '@/components/dialogs/ReportDialog';

export default function Page() {
  const { universityTag, courseID } = useParams();
  const [university, setUniversity] = useState<University>();
  const [course, setCourse] = useState<Course>();
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [professorList, setProfessorList] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof typeof sortingOptions>(Object.keys(sortingOptions)[0] || '');
  const [term, setTerm] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [easyScore, setEasyScore] = useState<number>(0);
  const [interestScore, setInterestScore] = useState<number>(0);
  const [usefulScore, setUsefulScore] = useState<number>(0);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);

  const initialLoadCompleteRef = useRef<boolean>(false);
  const courseIdRef = useRef<string>('');

  const { addAlert } = useAlert();
  const { userLoggedIn, currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!universityTag && !courseID) return;

    const loadUniversity = async (universityTag: string) => {
      const universityInfo: University = await getUniversity(universityTag as string);
      setUniversity(universityInfo);

      return universityInfo;
    };

    const loadCourse = async (university: University) => {
      const courseInfo: Course = await getCourseByCourseTag(
        university.university_id,
        (courseID as string).replaceAll('_', ' ')
      );
      setCourse(courseInfo);
      courseIdRef.current = courseInfo.course_id || '';

      setTotalReviews(courseInfo.review_num ?? 0);
      setOverallScore(courseInfo.overall_score ?? 0);
      setEasyScore(courseInfo.easy_score ?? 0);
      setInterestScore(courseInfo.interest_score ?? 0);
      setUsefulScore(courseInfo.useful_score ?? 0);

      return courseInfo;
    };

    const loadProfessors = async (course: Course) => {
      if (!course.course_id) throw new Error('No course ID');

      const getProfessorList: Professor[] = await getProfessorsByCourseID(course.course_id ?? '');
      const professorRecord = getProfessorList.reduce((acc, professor) => {
        acc[professor.professor_id] = professor.professor_name;
        return acc;
      }, {} as Record<string, string>);
      setProfessorList(professorRecord);

      return professorRecord;
    };

    const fetchInitialReviews = async (courseId: string) => {
      if (!courseId) throw new Error('No course ID');

      const response = await getReviewsByCourseID(
        courseId,
        1,
        10,
        selectedProfessor || undefined,
        term || undefined,
        deliveryMethod || undefined,
        orderBy,
        order
      );

      const data = response.data;
      const meta = response.meta;
      setReviewList(data);
      setHasMore(meta.total_pages > 1);
      setCurrentPage(1);
      return data;
    };

    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        const universityInfo: University = await loadUniversity(universityTag as string);
        const courseInfo: Course = await loadCourse(universityInfo);
        await loadProfessors(courseInfo);
        await fetchInitialReviews(courseInfo.course_id || '');

        initialLoadCompleteRef.current = true;
        setIsInitialLoading(false);
      } catch (error) {
        setIsInitialLoading(false);
        addAlert('destructive', (error as Error).message, 3000);
      }
    };
    fetchData();
  }, [courseID, universityTag, addAlert, userLoggedIn]);

  useEffect(() => {
    if (!initialLoadCompleteRef.current || !courseIdRef.current) return;

    const fetchReviews = async () => {
      try {
        setIsSearchLoading(true);
        setCurrentPage(1);

        const response = await getReviewsByCourseID(
          courseIdRef.current,
          1,
          10,
          selectedProfessor || undefined,
          term || undefined,
          deliveryMethod || undefined,
          orderBy,
          order
        );

        if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
          const data = response.data;
          const meta = response.meta;
          setReviewList(data);
          setHasMore(meta.total_pages > 1);

          if (data.length > 0) {
            const calculateAverage = (attribute: keyof Review) => {
              const totalScore = data.reduce((acc: number, review: Review) => acc + (review[attribute] as number), 0);
              return data.length ? totalScore / data.length : 0;
            };

            setTotalReviews(meta.total_items);
            setOverallScore(calculateAverage('overall_score'));
            setEasyScore(calculateAverage('easy_score'));
            setInterestScore(calculateAverage('interest_score'));
            setUsefulScore(calculateAverage('useful_score'));
          } else {
            setTotalReviews(0);
            setOverallScore(0);
            setEasyScore(0);
            setInterestScore(0);
            setUsefulScore(0);
          }
        } else {
          const reviews = response as Review[];
          setReviewList(reviews);
          setHasMore(false);
          setTotalReviews(reviews.length);

          if (reviews.length > 0) {
            const calculateAverage = (attribute: keyof Review) => {
              const totalScore = reviews.reduce(
                (acc: number, review: Review) => acc + (review[attribute] as number),
                0
              );
              return reviews.length ? totalScore / reviews.length : 0;
            };

            setOverallScore(calculateAverage('overall_score'));
            setEasyScore(calculateAverage('easy_score'));
            setInterestScore(calculateAverage('interest_score'));
            setUsefulScore(calculateAverage('useful_score'));
          } else {
            setOverallScore(0);
            setEasyScore(0);
            setInterestScore(0);
            setUsefulScore(0);
          }
        }
      } catch (error) {
        console.log(error);
        addAlert('destructive', 'Failed to search reviews', 3000);
      } finally {
        setIsSearchLoading(false);
      }
    };

    fetchReviews();
  }, [selectedProfessor, term, deliveryMethod, orderBy, order, addAlert]);

  const loadMoreReviews = useCallback(async () => {
    if (!courseIdRef.current || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const response = await getReviewsByCourseID(
        courseIdRef.current,
        currentPage + 1,
        10,
        selectedProfessor || undefined,
        term || undefined,
        deliveryMethod || undefined,
        orderBy,
        order
      );

      const data = response.data;
      const meta = response.meta;
      setReviewList((prev) => [...prev, ...data]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(currentPage + 1 < meta.total_pages);
    } catch (error) {
      console.log(error);
      addAlert('destructive', 'Failed to load more reviews', 3000);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, hasMore, addAlert, selectedProfessor, term, deliveryMethod, orderBy, order]);

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

  function updateSort() {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  }

  function clearFilters(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setTerm('');
    setDeliveryMethod('');
    setSelectedProfessor('');
  }

  const steps: StepProps<typeof newReviewForm>[] = [
    {
      title: 'Review Ratings',
      description: 'Please provide your personal details',
      content: ReviewRatingForm,
      fields: ['reviewRatingsStep'],
    },
    {
      title: 'Review Details',
      description: 'Please enter the details of your review.',
      content: () => <ReviewMetadataForm professorOptions={professorList} />,
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
      description: 'Please provide your personal details',
      content: () => <ReviewConfirmationForm />,
    },
  ];

  const handleSubmit = async (data: {
    reviewMetadataStep: {
      professorName: string;
      grade: Grade;
      deliveryMethod: Delivery;
      workload: Workload;
      textbookUse: Textbook;
      evaluationMethods: Evaluation;
      yearTaken: string;
      termTaken: Term;
    };
    reviewRatingsStep: { overallScore: number; easyScore: number; interestScore: number; usefulScore: number };
    reviewCommentsStep: { courseComments: string; professorComments: string; adviceComments: string };
  }) => {
    const reviewData: Review = {
      course_id: course?.course_id,
      professor_name: data.reviewMetadataStep.professorName,
      user_id: currentUser?.uid,
      grade: data.reviewMetadataStep.grade as Grade,
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

    await postReview(reviewData as Review);
    await window.location.reload();
  };

  const openDialog = (value: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!userLoggedIn) {
      toast({
        title: `Uh oh! You're not logged in!`,
        description: 'Please log in to perform this action.',
        action: (
          <Link href="/login">
            <ToastAction altText="Try again">Sign In</ToastAction>
          </Link>
        ),
      });
      return;
    } else if (currentUser?.emailVerified === false) {
      toast({
        title: `Uh oh! You're not verified!`,
        description: 'Please verify your email to perform this action.',
      });
      return;
    }

    value(true);
  };

  return (
    <div>
      {isInitialLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="medium" />
        </div>
      ) : university != undefined && Object.keys(university).length > 0 ? (
        <div className="flex flex-col items-center gap-4 p-8 sm:p-20">
          <UniversityHeader university={university} />
          {course ? (
            <React.Fragment>
              {showReportDialog && (
                <ReportDialog
                  id={course.course_id ?? ''}
                  type={'Course'}
                  open={showReportDialog}
                  onOpenChange={setShowReportDialog}
                />
              )}
              <div className="w-full max-w-3xl">
                <BreadCrumb links={prevLinks} />
              </div>
              <div className="w-full max-w-3xl flex flex items-center justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold">
                    {course?.course_tag}: {course?.course_name}
                  </div>

                  <p className="text-md text-muted-foreground">{course?.department_name}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-5 rounded-xl">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => openDialog(setShowReportDialog)}>Report</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="w-full max-w-3xl flex flex-col gap-4 sm:grid sm:grid-cols-2">
                <Dropdown
                  data={professorList}
                  value={selectedProfessor}
                  setValue={setSelectedProfessor}
                  placeholder="Professor"
                  initialValue=""
                  returnType={'key'}
                />
                <Dropdown
                  data={sortingOptions}
                  value={orderBy}
                  setValue={setOrderBy}
                  placeholder="Sort By"
                  initialValue={Object.keys(sortingOptions)[0] || ''}
                  returnType={'key'}
                />
                <Dropdown
                  data={termOptions}
                  value={term}
                  setValue={setTerm}
                  placeholder="Term"
                  initialValue=""
                  returnType={'key'}
                />
                <Dropdown
                  data={deliveryOptions}
                  value={deliveryMethod}
                  setValue={setDeliveryMethod}
                  placeholder="Delivery"
                  initialValue=""
                  returnType={'key'}
                />
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="w-full col-span-0.5"
                    onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => clearFilters(e)}
                  >
                    Clear
                  </Button>
                  <Button variant="outline" className="w-full" onClick={updateSort}>
                    {order === 'desc' ? (
                      <>
                        <ArrowDownWideNarrow /> Descending
                      </>
                    ) : (
                      <>
                        <ArrowUpWideNarrow />
                        Ascending
                      </>
                    )}
                  </Button>
                </div>
                <DialogForm
                  triggerButton={<Button className="w-full h-full">Add Review</Button>}
                  steps={steps}
                  onSubmit={handleSubmit}
                  schema={newReviewForm}
                />
              </div>

              <Card className="p-2 w-full max-w-3xl hover:shadow-xl flex flex-col gap-2">
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg p-2">
                  {ratingItem(
                    {
                      type: 'overall',
                      label: 'Overall',
                      value: overallScore || 0,
                    },
                    1
                  )}

                  {ratingItem(
                    {
                      type: 'easy',
                      label: 'Easiness',
                      value: easyScore || 0,
                    },
                    1
                  )}
                  {ratingItem(
                    {
                      type: 'interest',
                      label: 'Interest',
                      value: interestScore || 0,
                    },
                    1
                  )}
                  {ratingItem(
                    {
                      type: 'use',
                      label: 'Usefulness',
                      value: usefulScore || 0,
                    },
                    1
                  )}
                </CardContent>
                <Separator />
                <CardDescription className="flex items-center justify-center">{totalReviews} Reviews</CardDescription>
              </Card>

              <div className="grid md:grid-cols-1 gap-4 w-full max-w-3xl">
                {isSearchLoading ? (
                  <div className="flex justify-center py-10">
                    <Spinner size="medium" />
                  </div>
                ) : reviewList.length > 0 ? (
                  <>
                    {reviewList.map((review) => (
                      <ReviewCard
                        key={review.review_id}
                        review={review}
                        preview={false}
                        onDelete={(deletedId) => setReviewList((prev) => prev.filter((r) => r.review_id !== deletedId))}
                      />
                    ))}
                    <div className="flex justify-center py-4">
                      {hasMore && (
                        <Button onClick={loadMoreReviews} disabled={isLoadingMore} className="w-40">
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
                    <p className="text-lg text-gray-500">No reviews match your search criteria.</p>
                  </div>
                )}
              </div>
            </React.Fragment>
          ) : (
            <div className="flex flex-col gap-4 justify-center items-center">
              <div className="flex flex-col justify-center items-center">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  There are no courses in {university.university_name} that match your search criteria.
                </h3>
              </div>
              <Link href={`/${university.university_name.replaceAll(' ', '_')}`}>
                <Button>Return to {university.university_name}</Button>
              </Link>
            </div>
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
