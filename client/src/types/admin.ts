export interface AdminUser {
  admin_id: string;
  email: string;
  created_at: Date;
  password?: string; // Optional password field, only present during creation or first login
}
