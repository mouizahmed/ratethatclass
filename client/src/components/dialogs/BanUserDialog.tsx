import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { BanUserDialogProps } from '@/types/components';

export function BanUserDialog({ userId, open, onOpenChange, onConfirm }: BanUserDialogProps) {
  const [reason, setReason] = useState<string>('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setReason('');
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Please provide a reason for banning this user. This action can be reversed by unbanning the user later.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>User ID</Label>
          <div className="mb-2 p-2 bg-muted rounded text-muted-foreground text-xs">{userId}</div>
        </div>
        <div>
          <Label>Ban Reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter ban reason..." />
        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-4">
            <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={!reason}>
              Confirm Ban
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
