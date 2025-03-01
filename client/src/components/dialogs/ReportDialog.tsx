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
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '../ui/toast';
import Link from 'next/link';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { postReport } from '@/requests/postRequests';

interface ReportDialogProps {
  id: string;
  type: 'Course' | 'Review';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ id, type, open, onOpenChange }: ReportDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState<string>('');

  const handleReport = async () => {
    try {
      await postReport(id, reason, type);

      onOpenChange(false);
      toast({
        title: `Successfully reported ${type.toLowerCase()}`,
        description: 'Your report has been created.',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: `Uh oh! Report could not be sent.`,
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
    onOpenChange(newOpen);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setReason(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Report {type}</DialogTitle>
          <DialogDescription>
            This {type.toLowerCase()} will be flagged for further evaluation and may be removed if it violates our
            community guidelines.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Entity ID</Label>
          <Input id="id" type="text" required value={id} disabled />
        </div>
        <div>
          <Label>Reason</Label>
          <Textarea value={reason} onChange={handleChange}></Textarea>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-end gap-4">
            <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReport} disabled={!reason}>
              Report
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
