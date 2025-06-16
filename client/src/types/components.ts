import { Review } from './review';
import { Course, University } from './university';
import { BannedUser } from './user';

// Display Component Props
export interface PreviewReviewCardProps {
  review: Review;
  preview: true;
  onDelete?: never;
}

export interface FullReviewCardProps {
  review: Review;
  preview: false;
  onDelete: (deletedId: string) => void;
}

export type ReviewCardProps = PreviewReviewCardProps | FullReviewCardProps;

export interface CourseReviewsProps {
  course: Course;
  initialReviews: Review[];
  initialHasMore: boolean;
  professorList: Record<string, string>;
}

export interface CourseListProps {
  courses: Course[];
  isLoading?: boolean;
}

export interface UniversityCarouselProps {
  universities: University[];
}

export interface RatingIndicatorProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface ClientSearchProps {
  data: University[];
  valueKey: keyof University;
  labelKey: keyof University;
  placeholder: string;
  emptyMessage: string;
}

// Dialog Component Props
export interface ReportDialogProps {
  id: string;
  type: 'Course' | 'Review';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface BanUserDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export interface DeleteReviewConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review;
  onDelete: (deletedId: string) => void;
}

// Form Component Props
export interface DialogFormStepProps {
  title: string;
  description: string;
  StepContent: React.ComponentType<{ stepData: Record<string, unknown> }>;
}

// AdSense Component Props
export interface AdsenseProps {
  pId: string;
}

export interface BannedUserCardProps {
  user: BannedUser;
  onUnban: () => void;
}
