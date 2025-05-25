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
import { toastUtils } from '@/lib/toast-utils';
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
  const { userLoggedIn, currentUser } = useAuth();

  const handleDelete = async () => {
    try {
      if (!review.review_id) {
        throw new Error('No review ID');
      }
      await deleteReview(review.review_id);
      onDelete(review.review_id);
      onOpenChange(false);
      toastUtils.crud.deleted('Review');
    } catch (error) {
      console.log(error);
      toastUtils.crud.deleteError('review', (error as Error).message);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (!userLoggedIn) {
        toastUtils.auth.notLoggedIn();
        return;
      } else if (currentUser?.emailVerified === false) {
        toastUtils.auth.notVerified();
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
