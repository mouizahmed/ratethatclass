-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Delivery method options
CREATE TYPE deliverymethod AS ENUM (
    'In-Person',
    'Hybrid', 
    'Online'
);

-- Evaluation methods for courses
CREATE TYPE evaluationmethods AS ENUM (
    'Attendance Heavy',
    'Participation Heavy',
    'Assignment Heavy',
    'Quiz Heavy',
    'Essay Heavy',
    'Project Heavy',
    'Lab Heavy',
    'Exam Heavy'
);

-- Grade values
CREATE TYPE grade AS ENUM (
    'A+',
    'A',
    'A-',
    'B+',
    'B',
    'B-',
    'C+',
    'C',
    'C-',
    'D+',
    'D',
    'D-',
    'F',
    'Drop/Withdrawal',
    'Incomplete',
    'Not sure yet',
    'Rather not say'
);

-- Report status tracking
CREATE TYPE reportstatus AS ENUM (
    'pending',
    'resolved',
    'dismissed'
);

-- Report type categories
CREATE TYPE reporttype AS ENUM (
    'department',
    'course',
    'professor',
    'review'
);

-- Academic terms
CREATE TYPE termtaken AS ENUM (
    'Fall',
    'Winter',
    'Spring',
    'Summer',
    'Year'
);

-- Textbook requirement status
CREATE TYPE textbookuse AS ENUM (
    'Yes',
    'No',
    'Optional'
);

-- Voting options
CREATE TYPE vote AS ENUM (
    'up',
    'down'
);

-- Course workload levels
CREATE TYPE workload AS ENUM (
    'Very Light',
    'Light',
    'Moderate',
    'Heavy',
    'Very Heavy'
);

-- Account type permissions
CREATE TYPE accounttype AS ENUM (
    'anonymous',
    'user',
    'student',
    'admin',
    'owner'
);

-- Base tables with no dependencies
CREATE TABLE public.users (
  user_id character varying NOT NULL DEFAULT ''::character varying,
  display_name text,
  email text UNIQUE,
  registration_date date DEFAULT CURRENT_DATE,
  account_type accounttype NOT NULL DEFAULT 'anonymous'::accounttype,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

CREATE TABLE public.universities (
  university_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  university_name character varying NOT NULL UNIQUE,
  university_logo character varying NOT NULL,
  domain character varying NOT NULL UNIQUE,
  CONSTRAINT universities_pkey PRIMARY KEY (university_id)
);

CREATE TABLE public.university_requests (
  university_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  university_name text NOT NULL UNIQUE,
  total_votes integer DEFAULT 0,
  CONSTRAINT university_requests_pkey PRIMARY KEY (university_id)
);

-- Tables with single-level dependencies
CREATE TABLE public.departments (
  department_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  department_name text NOT NULL,
  university_id uuid NOT NULL,
  CONSTRAINT departments_pkey PRIMARY KEY (department_id),
  CONSTRAINT departments_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id)
);

CREATE TABLE public.user_university_requests (
  university_id uuid NOT NULL,
  user_token character varying NOT NULL,
  CONSTRAINT user_university_requests_pkey PRIMARY KEY (university_id, user_token),
  CONSTRAINT user_university_requests_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.university_requests(university_id)
);

CREATE TABLE public.bans (
  ban_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  banned_at timestamp with time zone NOT NULL DEFAULT now(),
  unbanned_at timestamp without time zone,
  user_id character varying NOT NULL,
  ban_reason text,
  banned_by character varying NOT NULL,
  CONSTRAINT bans_pkey PRIMARY KEY (ban_id),
  CONSTRAINT bans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT bans_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES public.users(user_id)
);

CREATE TABLE public.reports (
  report_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id character varying NOT NULL,
  entity_type reporttype,
  entity_id uuid NOT NULL,
  report_reason text,
  report_date date DEFAULT CURRENT_DATE,
  status reportstatus DEFAULT 'pending'::reportstatus,
  CONSTRAINT reports_pkey PRIMARY KEY (report_id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Tables with multi-level dependencies
CREATE TABLE public.courses (
  course_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  department_id uuid NOT NULL,
  course_tag text NOT NULL,
  course_name text NOT NULL,
  CONSTRAINT courses_pkey PRIMARY KEY (course_id),
  CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id)
);

CREATE TABLE public.professors (
  professor_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL,
  professor_name text NOT NULL,
  CONSTRAINT professors_pkey PRIMARY KEY (professor_id),
  CONSTRAINT professors_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id)
);

-- Tables with the most dependencies (created last)
CREATE TABLE public.reviews (
  review_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL,
  professor_id uuid NOT NULL,
  user_id character varying NOT NULL,
  grade grade,
  delivery_method deliverymethod,
  workload workload,
  textbook_use textbookuse,
  evaluation_methods evaluationmethods[],
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 5),
  easy_score integer DEFAULT 0 CHECK (easy_score >= 0 AND easy_score <= 5),
  interest_score integer DEFAULT 0 CHECK (interest_score >= 0 AND interest_score <= 5),
  useful_score integer DEFAULT 0 CHECK (useful_score >= 0 AND useful_score <= 5),
  votes integer DEFAULT 0,
  term_taken termtaken,
  year_taken integer CHECK (year_taken >= 2010 AND year_taken::numeric <= EXTRACT(year FROM CURRENT_DATE)),
  date_uploaded date DEFAULT CURRENT_DATE,
  course_comments text,
  professor_comments text,
  advice_comments text,
  CONSTRAINT reviews_pkey PRIMARY KEY (review_id),
  CONSTRAINT reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT reviews_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(professor_id)
);

CREATE TABLE public.user_votes (
  vote_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id character varying NOT NULL,
  review_id uuid NOT NULL,
  vote vote,
  CONSTRAINT user_votes_pkey PRIMARY KEY (vote_id),
  CONSTRAINT user_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT user_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(review_id)
);