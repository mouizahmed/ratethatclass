'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Review, Vote } from '@/types/review';
import { Label } from '@/components/ui/label';
import { BadgeCheck, ChevronDown, ChevronUp, EllipsisVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { postUpVote, postDownVote } from '@/requests/postRequests';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '../ui/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/authContext';
import Link from 'next/link';
import { ratingItem } from '@/lib/display';
import { DeleteReviewConfirmationDialog } from '../dialogs/DeleteReviewConfirmationDialog';
import { ReportDialog } from '../dialogs/ReportDialog';

interface PreviewReviewCardProps {
  review: Review;
  preview: true;
  onDelete?: never;
}

interface FullReviewCardProps {
  review: Review;
  preview: false;
  onDelete: (deletedId: string) => void;
}

type ReviewCardProps = PreviewReviewCardProps | FullReviewCardProps;

export function ReviewCard({ review, preview, onDelete }: ReviewCardProps) {
  const [vote, setVote] = useState<Vote>(review.vote || Vote.noVote);
  const [totalVotes, setTotalVotes] = useState<number>(review.votes || 0);
  const { userLoggedIn, currentUser } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Sync vote state with prop
  useEffect(() => {
    setVote(review.vote || Vote.noVote);
  }, [review.vote]);

  const downVote = () => {
    if (!currentUser) {
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
    }
    postDownVote(review);
    if (vote === 'down') {
      setVote(Vote.noVote);
      setTotalVotes((prev) => prev + 1);
    } else if (vote === 'up') {
      setVote(Vote.down);
      setTotalVotes((prev) => prev - 2);
    } else {
      setVote(Vote.down);
      setTotalVotes((prev) => prev - 1);
    }
  };

  const upVote = () => {
    if (!currentUser) {
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
    }
    postUpVote(review);
    if (vote === 'up') {
      setVote(Vote.noVote);
      setTotalVotes((prev) => prev - 1);
    } else if (vote === 'down') {
      setVote(Vote.up);
      setTotalVotes((prev) => prev + 2);
    } else {
      setVote(Vote.up);
      setTotalVotes((prev) => prev + 1);
    }
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
    <div className="flex items-center justify-center gap-4">
      {/* {!preview && (
        <div className="flex items-center justify-center flex-col">
          <div className={`hover:bg-zinc-200 ${vote === 'up' ? 'text-red-600' : ''} rounded-2xl p-1`} onClick={upVote}>
            <ChevronUp />
          </div>
          {totalVotes}
          <div
            className={`hover:bg-zinc-200 ${vote === 'down' ? 'text-red-600' : ''} rounded-2xl p-1`}
            onClick={downVote}
          >
            <ChevronDown />
          </div>
        </div>
      )} */}
      <Card className="p-2 w-full hover:shadow-xl grid md:grid-cols-4 md:grid-rows-[auto auto min-content] gap-2">
        <CardContent className="border rounded-lg p-2 md:row-span-2 md:col-span-1">
          {ratingItem(
            {
              type: 'overall',
              label: 'Overall',
              value: review?.overall_score || 0,
            },
            0
          )}
          {ratingItem(
            {
              type: 'easy',
              label: 'Easiness',
              value: review?.easy_score || 0,
            },
            0
          )}
          {ratingItem(
            {
              type: 'interest',
              label: 'Interest',
              value: review?.interest_score || 0,
            },
            0
          )}
          {ratingItem(
            {
              type: 'use',
              label: 'Usefulness',
              value: review?.useful_score || 0,
            },
            0
          )}
        </CardContent>
        <CardHeader className="border rounded-lg md:col-span-3 md:row-span-2">
          <CardDescription className="flex gap-2 flex-col justify-between h-full">
            <div className="grid">
              <Label htmlFor="courseID">Comments on the Course:</Label>
              <p id="courseID" className="leading-7 break-words overflow-auto">
                {review?.course_comments}
              </p>
            </div>
            {review?.professor_comments && (
              <div className="grid">
                <Label htmlFor="courseID">Comments on the Professor:</Label>
                <p id="courseID" className="leading-7 break-words overflow-auto">
                  {review?.professor_comments}
                </p>
              </div>
            )}
            {review?.advice_comments && (
              <div className="grid">
                <Label htmlFor="courseID">Advice:</Label>
                <p id="courseID" className="leading-7 break-words overflow-auto">
                  {review?.advice_comments}
                </p>
              </div>
            )}
            <Separator orientation="horizontal" />
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <p>Grade: </p>
                <Label id="courseID" className="leading-7 break-words overflow-auto">
                  {review?.grade}
                </Label>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p>Delivery: </p>
                <Label id="courseID" className="leading-7 break-words overflow-auto">
                  {review?.delivery_method}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <p>Workload: </p>
                <Label id="courseID" className="leading-7 break-words overflow-auto">
                  {review?.workload}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <p>Textbook Use: </p>
                <Label id="courseID" className="leading-7 break-words overflow-auto">
                  {review?.textbook_use}
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p>Evaluation Methods: </p>
              <Label id="courseID" className="leading-7 flex flex-wrap gap-1">
                {Object.values(review.evaluation_methods).map((item, index) => (
                  <div key={index}>
                    {item}
                    {index < review.evaluation_methods.length - 1 && ', '}
                  </div>
                ))}
              </Label>
            </div>
            <div className="flex">
              <div className="flex items-center gap-2 border p-2 rounded-lg z-5 shadow-sm">
                Verified Student <BadgeCheck className="text-blue-500" />
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardHeader className="border rounded-lg md:col-span-4 md:row-span-1">
          <CardDescription>
            <div className="flex flex-wrap items-center justify-between gap-2 gap-y-4 sm:gap-y-2 h-full">
              <span className="flex items-center gap-2">
                <Label htmlFor="professor">Professor:</Label>
                <p id="professor" className="leading-7 break-words overflow-auto">
                  {review?.professor_name}
                </p>
              </span>
              <Separator orientation="vertical" className="hidden sm:block min-h-full" />
              <p id="termTaken" className="leading-7 break-words overflow-auto">
                {review?.term_taken} {review?.year_taken}
              </p>
              <Separator orientation="vertical" className="hidden sm:block min-h-full" />
              <p id="dateUploaded" className="leading-7 break-words overflow-auto">
                {review?.date_uploaded.slice(0, 10)}
              </p>
            </div>
          </CardDescription>
        </CardHeader>

        {!preview && (
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-full rounded-lg">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  {currentUser && currentUser.uid === review.user_id ? (
                    <DropdownMenuItem onClick={() => openDialog(setShowDeleteDialog)}>Delete</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => openDialog(setShowReportDialog)}>Report</DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border rounded-lg p-2 gap-2">
              <div
                className={`hover:bg-zinc-200 ${vote === 'up' ? 'text-red-600' : ''} rounded-2xl p-1`}
                onClick={upVote}
              >
                <ChevronUp />
              </div>
              {totalVotes}
              <div
                className={`hover:bg-zinc-200 ${vote === 'down' ? 'text-red-600' : ''} rounded-2xl p-1`}
                onClick={downVote}
              >
                <ChevronDown />
              </div>
            </div>
          </div>
        )}
      </Card>

      {!preview && showDeleteDialog && (
        <DeleteReviewConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          review={review}
          onDelete={onDelete}
        />
      )}
      {showReportDialog && (
        <ReportDialog
          id={review.review_id ?? ''}
          type={'Review'}
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
        />
      )}
    </div>
  );
}
