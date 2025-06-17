import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { BannedUserCardProps } from '@/types/components';

export function BannedUserCard({ user, onUnban }: BannedUserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{user.email || 'Anonymous User'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <div className="text-sm">
          <span className="font-medium">Ban Reason:</span> {user.ban_reason}
        </div>
        <div className="text-sm">
          <span className="font-medium">Banned:</span>{' '}
          {formatDistanceToNow(new Date(user.banned_at), { addSuffix: true })}
        </div>
        <div className="text-sm">
          <span className="font-medium">User ID:</span> <span className="text-muted-foreground">{user.user_id}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onUnban}>
          Unban User
        </Button>
      </CardFooter>
    </Card>
  );
}
