import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

export interface RequestedUniversity {
  university_id: string;
  university_name: string;
  total_votes: number;
  user_token: string | null;
}

export interface University {
  university_id: string;
  university_name: string;
  university_logo: string;
  domain: string;
}

export interface Department {
  department_id: string;
  university_id: string;
  department_name: string;
}

export interface Course {
  course_id: string;
  department_id: string;
  course_tag: string;
  course_name: string;
  overall_score: number;
  easy_score: number;
  interest_score: number;
  useful_score: number;
  review_num: number;
  university_id: string;
  university_name: string;
  department_name: string;
}

interface CourseReportDetails {
  course_name: string;
  course_tag: string;
  department_name: string;
  department_id: string;
  university_name: string;
}

interface ReviewReportDetails {
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

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  report_id: string;
  user_id: string;
  entity_type: ValidReportEntityType;
  entity_id: string;
  report_reason: string;
  report_date: Date;
  status: ReportStatus;
  entity_details: CourseReportDetails | ReviewReportDetails | null;
}

export interface Professor {
  professor_id: string;
  university_id: string;
  professor_name: string;
}

export interface Review {
  review_id?: string;
  course_id: string;
  professor_id?: string;
  professor_name: string;
  department_id?: string;
  department_name: string;
  university_id?: string;
  university_name: string;
  user_id: string | null;
  account_type?: AccountType;
  grade?: Grade;
  delivery_method?: Delivery;
  workload?: Workload;
  textbook_use?: Textbook;
  evaluation_methods: Evaluation[];
  overall_score: number;
  easy_score: number;
  interest_score: number;
  useful_score: number;
  votes?: number;
  term_taken: Term;
  year_taken: number;
  date_uploaded?: SQLDate;
  course_comments: string;
  professor_comments?: string;
  advice_comments?: string;
}

export type SQLDate = `${number}-${number}-${number}`;

export enum Term {
  Fall = 'Fall',
  Winter = 'Winter',
  Spring = 'Spring',
  Summer = 'Summer',
  Year = 'Year',
}

export enum Evaluation {
  AttendanceHeavy = 'Attendance Heavy',
  ParticipationHeavy = 'Participation Heavy',
  AssignmentHeavy = 'Assignment Heavy',
  QuizHeavy = 'Quiz Heavy',
  EssayHeavy = 'Essay Heavy',
  ProjectHeavy = 'Project Heavy',
  LabHeavy = 'Lab Heavy',
  ExamHeavy = 'Exam Heavy',
}

export enum Textbook {
  Yes = 'Yes',
  No = 'No',
  Optional = 'Optional',
}

export enum Workload {
  VeryLight = 'Very Light',
  Light = 'Light',
  Moderate = 'Moderate',
  Heavy = 'Heavy',
  VeryHeavy = 'Very Heavy',
}

export enum Delivery {
  InPerson = 'In-Person',
  Online = 'Online',
  Hybrid = 'Hybrid',
}

export enum Grade {
  APlus = 'A+',
  A = 'A',
  AMinus = 'A-',
  BPlus = 'B+',
  B = 'B',
  BMinus = 'B-',
  CPlus = 'C+',
  C = 'C',
  CMinus = 'C-',
  DPlus = 'D+',
  D = 'D',
  DMinus = 'D-',
  F = 'F',
  DropWithdrawal = 'Drop/Withrawal',
  Incomplete = 'Incomplete',
  NotSureYet = 'Not sure yet',
  RatherNotSay = 'Rather not say',
  AuditNoGrade = 'Audit/No Grade',
  Pass = 'Pass',
  Fail = 'Fail',
}

export enum Vote {
  up = 'up',
  down = 'down',
  noVote = 'no-vote',
}

export interface VoteItem {
  vote_id: string;
  user_id: string;
  review_id: string;
  vote: Vote;
}

export const VALID_REPORT_ENTITY_TYPES = ['course', 'review'] as const;
export type ValidReportEntityType = (typeof VALID_REPORT_ENTITY_TYPES)[number];

export type AccountType = 'anonymous' | 'student' | 'user' | 'owner' | 'admin';
