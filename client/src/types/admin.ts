export interface AdminUser {
  user_id: string;
  email: string;
  registration_date: Date;
  password?: string; // Optional password field, only present during creation or first login
}
