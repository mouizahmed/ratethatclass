'use client';

import React, { useCallback, useState } from 'react';
import { Course } from '@/types/university';
import { Review } from '@/types/review';
import { Dropdown } from '@/components/common/Dropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow, EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from '@/components/display/ReviewCard';
import { useAlert } from '@/contexts/alertContext';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { ratingItem } from '@/lib/display';
import { deliveryOptions, sortingOptions, termOptions } from '@/lib/constants';
import { Spinner } from '@/components/ui/Spinner';
import { getReviewsByCourseID } from '@/requests/getAuthenticatedRequests';
import { DialogForm, StepProps } from '@/components/forms/DialogForm';
import { newReviewForm } from '@/components/forms/schema';
import { ReviewRatingForm } from '@/components/forms/steps/ReviewRatingForm';
import { ReviewMetadataForm } from '@/components/forms/steps/ReviewMetadataForm';
import { ReviewCommentsForm } from '@/components/forms/steps/ReviewCommentsForm';
import ReviewConfirmationForm from '@/components/forms/steps/ReviewConfirmationForm';
import { getCurrentSQLDate } from '@/lib/utils';
import { postReview } from '@/requests/postRequests';
import { useAuth } from '@/contexts/authContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import Link from 'next/link';
import { Delivery, Evaluation, Grade, Term, Textbook, Vote, Workload } from '@/types/review';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportDialog } from '@/components/dialogs/ReportDialog';

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);

  const { addAlert } = useAlert();
  const { userLoggedIn, currentUser } = useAuth();
  const { toast } = useToast();

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

  const loadMoreReviews = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const response = await getReviewsByCourseID(
        courseId,
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
  }, [
    courseId,
    currentPage,
    isLoadingMore,
    hasMore,
    addAlert,
    selectedProfessor,
    term,
    deliveryMethod,
    orderBy,
    order,
  ]);

  function updateSort() {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  }

  function clearFilters(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setTerm('');
    setDeliveryMethod('');
    setSelectedProfessor('');
  }

  return (
    <React.Fragment>
      {showReportDialog && (
        <ReportDialog id={courseId} type={'Course'} open={showReportDialog} onOpenChange={setShowReportDialog} />
      )}
      <div className="w-full max-w-3xl flex flex items-center justify-between gap-2">
        <div>
          <div className="text-lg font-semibold">
            {course.course_tag}: {course.course_name}
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
          initialValue="date_uploaded"
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
        {reviewList.length > 0 ? (
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
  );
}
