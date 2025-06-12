import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AdminCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedAdmin: { email: string; password: string } | null;
  onClose: () => void;
}

export const AdminCreateDialog: React.FC<AdminCreateDialogProps> = ({
  open,
  onOpenChange,
  generatedAdmin,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Admin Account Created</DialogTitle>
        <DialogDescription>
          Please copy the credentials below and share them securely with the new admin. This is the only time the
          password will be shown.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Email:</span> {generatedAdmin?.email}
        </div>
        <div>
          <span className="font-semibold">Password:</span>{' '}
          <span className="font-mono bg-muted px-2 py-1 rounded">{generatedAdmin?.password}</span>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
