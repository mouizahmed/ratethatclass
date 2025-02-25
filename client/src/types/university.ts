export type University = {
  university_id: string;
  university_name: string;
  university_logo: string;
  domain: string;
  review_num: number;
};

export interface RequestedUniversity {
  university_id: string;
  university_name: string;
  total_votes: number;
  user_token: string | null;
}

export interface Department {
  department_id: string;
  university_id: string;
  department_name: string;
}

export type Faculty = {
  facultyName: string;
  universityTag: string;
};

export type Course = {
  university_id: string;
  university_name: string;
  department_name?: string;
  course_id?: string;
  department_id?: string;
  course_tag: string;
  course_name: string;
  overall_score?: number;
  easy_score?: number;
  interest_score?: number;
  useful_score?: number;
  review_num?: number;
};

export type Professor = {
  professor_id: string;
  university_id: string;
  professor_name: string;
};
