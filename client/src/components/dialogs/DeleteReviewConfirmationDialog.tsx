import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/authContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '../ui/toast';
import Link from 'next/link';
import { Review } from '@/types/review';
import { deleteReview } from '@/requests/deleteRequests';

interface DeleteReviewConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review;
  onDelete: (deletedId: string) => void;
}

export function DeleteReviewConfirmationDialog({
  open,
  onOpenChange,
  review,
  onDelete,
}: DeleteReviewConfirmationDialogProps) {
  const { toast } = useToast();
  const { userLoggedIn, currentUser } = useAuth();

  const handleDelete = async () => {
    try {
      if (!review.review_id) {
        throw new Error('No review ID');
      }
      await deleteReview(review.review_id);
      onDelete(review.review_id);
      onOpenChange(false);
      toast({
        title: `Successfully deleted review!`,
        description: 'Review has been permanently deleted.',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: `Uh oh! Review could not be deleted.`,
        description: (error as Error).message,
        action: (
          <Link href="/login">
            <ToastAction altText="Try again">Sign In</ToastAction>
          </Link>
        ),
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
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
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex items-center justify-end gap-4">
            <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
