import React, { useEffect } from 'react';
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
import { deleteReview } from '@/requests/deleteRequests';
import { DeleteReviewConfirmationDialogProps } from '@/types/components';
import { checkUserActionAllowed } from '@/lib/auth-guards';

export function DeleteReviewConfirmationDialog({
  open,
  onOpenChange,
  review,
  onDelete,
}: DeleteReviewConfirmationDialogProps) {
  const { userLoggedIn, currentUser, banned, banReason, isAdmin, isOwner } = useAuth();

  useEffect(() => {
    if (open) {
      const authorized = checkUserActionAllowed({ userLoggedIn, currentUser, banned, banReason, isAdmin, isOwner });
      if (!authorized) {
        onOpenChange(false);
      }
    }
  }, [open, userLoggedIn, currentUser, banned, banReason, onOpenChange, isAdmin, isOwner]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
