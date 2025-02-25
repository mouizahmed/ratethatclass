import { SQLDate } from '@/types';

export interface Review {
  review_id?: string;
  course_id?: string;
  professor_id?: string;
  professor_name: string;
  department_id?: string;
  department_name?: string;
  university_id?: string;
  university_name?: string;
  user_id?: string;
  grade: Grade | null;
  delivery_method?: Delivery;
  workload?: Workload;
  textbook_use?: Textbook;
  evaluation_methods: string[];
  overall_score: number;
  easy_score: number;
  interest_score: number;
  useful_score: number;
  votes?: number;
  vote: Vote;
  term_taken?: Term;
  year_taken: string;
  date_uploaded: SQLDate;
  course_comments: string;
  professor_comments: string;
  advice_comments: string;
}

export enum Vote {
  up = 'up',
  down = 'down',
  noVote = '',
}

export enum Workload {
  VeryLight = 'Very Light',
  Light = 'Light',
  Moderate = 'Moderate',
  Heavy = 'Heavy',
  VeryHeavy = 'Very Heavy',
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

export enum Term {
  Fall = 'Fall',
  Winter = 'Winter',
  Spring = 'Spring',
  Summer = 'Summer',
  Year = 'Year',
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

export interface Rating {
  type: string;
  label: string;
  value: number;
}

// export interface Votes {
//   vote_id: string;
//   user_id: string;
//   review_id: string;
//   vote: Vote;
// }
