export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  report_id: string;
  user_id: string;
  entity_type: 'course' | 'review';
  entity_id: string;
  report_reason: string;
  report_date: string;
  status: ReportStatus;
  entity_details: CourseReportDetails | ReviewReportDetails;
}

export interface CourseReportDetails {
  course_name: string;
  course_tag: string;
  department_name: string;
  department_id: string;
  university_name: string;
}

export interface ReviewReportDetails {
  course_name: string;
  course_tag: string;
  department_name: string;
  university_name: string;
  professor_name: string;
  professor_id: string;
  course_comments: string;
  professor_comments: string;
  advice_comments: string;
  reviewer_email: string;
  reviewer_id: string;
}
