export interface BannedUser {
  user_id: string;
  email: string;
  display_name: string;
  ban_reason: string;
  banned_at: string;
  banned_by: string;
}

export type AccountType = 'student' | 'user' | 'owner' | 'admin' | 'anonymous';
