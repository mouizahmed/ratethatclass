import React from 'react';
import { AdminUser } from '@/types/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminCardListProps {
  adminUsers: AdminUser[];
  onDelete: (adminId: string) => void;
}

export const AdminCardList: React.FC<AdminCardListProps> = ({ adminUsers, onDelete }) => {
  return (
    <div className="space-y-4">
      {adminUsers.map((admin) => (
        <Card key={admin.user_id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium">{admin.email}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(admin.registration_date).toLocaleDateString()}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => onDelete(admin.user_id)}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
