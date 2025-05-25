'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Course } from '@/types/university';
import { Review } from '@/types/review';
import { Dropdown } from '@/components/common/Dropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow, EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from '@/components/display/ReviewCard';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { ratingItem } from '@/lib/display';
import { deliveryOptions, sortingOptions, termOptions } from '@/lib/constants';
import { Spinner } from '@/components/ui/Spinner';
import { getReviewsByCourseID } from '@/requests/getRequests';
import { DialogForm, StepProps } from '@/components/forms/DialogForm';
import { newReviewForm } from '@/components/forms/schema';
import { ReviewRatingForm } from '@/components/forms/steps/ReviewRatingForm';
import { ReviewMetadataForm } from '@/components/forms/steps/ReviewMetadataForm';
import { ReviewCommentsForm } from '@/components/forms/steps/ReviewCommentsForm';
import ReviewConfirmationForm from '@/components/forms/steps/ReviewConfirmationForm';
import { getCurrentSQLDate } from '@/lib/utils';
import { postReview } from '@/requests/postRequests';
import { useAuth } from '@/contexts/authContext';
import { Delivery, Evaluation, Grade, Term, Textbook, Vote, Workload } from '@/types/review';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportDialog } from '@/components/dialogs/ReportDialog';
import { getVoteStates } from '@/requests/getAuthenticatedRequests';
import { AuthProvider } from '@/contexts/authContext';
import { useDebounce } from '@/hooks/useDebounce';
import { toastUtils } from '@/lib/toast-utils';

interface CourseReviewsProps {
  course: Course;
  initialReviews: Review[];
  initialHasMore: boolean;
  professorList: Record<string, string>;
}

export function CourseReviews({ course, initialReviews, initialHasMore, professorList }: CourseReviewsProps) {
  if (!course.course_id) {
    throw new Error('Course ID is required');
  }

  return (
    <AuthProvider>
      <CourseReviewsContent
        course={course}
        initialReviews={initialReviews}
        initialHasMore={initialHasMore}
        professorList={professorList}
      />
    </AuthProvider>
  );
}

function CourseReviewsContent({ course, initialReviews, initialHasMore, professorList }: CourseReviewsProps) {
  const courseId = course.course_id as string;
  const [reviewList, setReviewList] = useState<Review[]>(initialReviews);
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof typeof sortingOptions>('');
  const [term, setTerm] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');
  const [totalReviews] = useState<number>(course.review_num ?? 0);
  const [overallScore] = useState<number>(course.overall_score ?? 0);
  const [easyScore] = useState<number>(course.easy_score ?? 0);
  const [interestScore] = useState<number>(course.interest_score ?? 0);
  const [usefulScore] = useState<number>(course.useful_score ?? 0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [voteStates, setVoteStates] = useState<Record<string, 'up' | 'down' | undefined>>({});

  // Debounced filter states
  const debouncedProfessor = useDebounce(selectedProfessor, 300);
  const debouncedTerm = useDebounce(term, 300);
  const debouncedDeliveryMethod = useDebounce(deliveryMethod, 300);
  const debouncedOrder = useDebounce(order, 300);
  const debouncedOrderBy = useDebounce(orderBy, 300);

  const { userLoggedIn, currentUser, loading } = useAuth();

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
      course_id: courseId,
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
      toastUtils.auth.notLoggedIn();
      return;
    } else if (currentUser?.emailVerified === false) {
      toastUtils.auth.notVerified();
      return;
    }

    value(true);
  };

  // Function to fetch reviews with current filter settings
  const fetchReviews = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setIsFilterLoading(true);
        const response = await getReviewsByCourseID(
          courseId,
          page,
          10,
          debouncedProfessor || undefined,
          debouncedTerm || undefined,
          debouncedDeliveryMethod || undefined,
          debouncedOrderBy || 'date_uploaded',
          debouncedOrder
        );

        if (append) {
          setReviewList((prev) => [...prev, ...response.data]);
        } else {
          setReviewList(response.data);
        }
        setHasMore(page < response.meta.total_pages);
        setCurrentPage(page);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toastUtils.loadError('reviews');
      } finally {
        setIsFilterLoading(false);
      }
    },
    [courseId, debouncedProfessor, debouncedTerm, debouncedDeliveryMethod, debouncedOrderBy, debouncedOrder]
  );

  // Effect to fetch reviews when filters change
  useEffect(() => {
    const isInitialState =
      debouncedProfessor === '' &&
      debouncedTerm === '' &&
      debouncedDeliveryMethod === '' &&
      debouncedOrder === 'desc' &&
      debouncedOrderBy === '';

    if (isInitialState) {
      setReviewList(initialReviews);
      setHasMore(initialHasMore);
      setCurrentPage(1);
      return;
    }

    fetchReviews(1, false);
  }, [
    debouncedProfessor,
    debouncedTerm,
    debouncedDeliveryMethod,
    debouncedOrder,
    debouncedOrderBy,
    fetchReviews,
    initialReviews,
    initialHasMore,
  ]);

  // Fetch vote states for current reviews
  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    if (!userLoggedIn) return; // Only fetch votes if user is logged in
    const fetchVotes = async () => {
      const reviewIds = reviewList.map((r) => r.review_id).filter((id): id is string => typeof id === 'string');
      if (reviewIds.length === 0) return;
      try {
        const voteStatesArr = await getVoteStates(reviewIds);
        const voteMap: Record<string, 'up' | 'down'> = {};
        voteStatesArr.forEach((v) => {
          voteMap[v.review_id] = v.vote;
        });
        setVoteStates(voteMap);
      } catch (e) {
        // Optionally handle error
        console.log(e);
      }
    };
    fetchVotes();
  }, [reviewList, loading, userLoggedIn]);

  const loadMoreReviews = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const response = await getReviewsByCourseID(
        courseId,
        currentPage + 1,
        10,
        debouncedProfessor || undefined,
        debouncedTerm || undefined,
        debouncedDeliveryMethod || undefined,
        debouncedOrderBy || 'date_uploaded',
        debouncedOrder
      );

      const data = response.data;
      const meta = response.meta;
      setReviewList((prev) => [...prev, ...data]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(currentPage + 1 < meta.total_pages);
    } catch (error) {
      console.log(error);
      toastUtils.loadError('more reviews');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    courseId,
    currentPage,
    isLoadingMore,
    hasMore,
    debouncedProfessor,
    debouncedTerm,
    debouncedDeliveryMethod,
    debouncedOrderBy,
    debouncedOrder,
  ]);

  function updateSort() {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  }

  function clearFilters(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setTerm('');
    setDeliveryMethod('');
    setSelectedProfessor('');
    setCurrentPage(1);
  }

  return (
    <React.Fragment>
      {showReportDialog && (
        <ReportDialog id={courseId} type={'Course'} open={showReportDialog} onOpenChange={setShowReportDialog} />
      )}
      <div className="w-full max-w-3xl flex flex items-center justify-between gap-2">
        <div>
          <div className="text-lg font-semibold">
            {course.course_tag}: {course.course_name} Reviews
          </div>
          <p className="text-md text-muted-foreground">{course.department_name}</p>
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
          initialValue=""
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
                <ArrowUpWideNarrow /> Ascending
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
        {isFilterLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="medium" />
          </div>
        ) : reviewList.length > 0 ? (
          <>
            {reviewList.map((review) => (
              <ReviewCard
                key={review.review_id}
                review={{
                  ...review,
                  vote:
                    review.review_id && voteStates && voteStates[review.review_id]
                      ? (voteStates[review.review_id] as Vote)
                      : review.vote,
                }}
                preview={false}
                onDelete={(deletedId) => setReviewList((prev) => prev.filter((r) => r.review_id !== deletedId))}
              />
            ))}
            <div className="flex justify-center py-4">
              {hasMore && (
                <Button onClick={loadMoreReviews} disabled={isLoadingMore} className="w-40" data-noindex="true">
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
  );
}
