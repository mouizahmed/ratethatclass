--
-- PostgreSQL database dump
--
--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.2

-- Started on 2025-04-24 05:25:02

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMENT ON SCHEMA public IS 'standard public schema';

COMMENT ON SCHEMA public IS 'standard public schema';

CREATE TYPE public.deliverymethod AS ENUM (
    'In-Person',
    'Hybrid',
    'Online'
);

ALTER TYPE public.deliverymethod OWNER TO postgres;

CREATE TYPE public.evaluationmethods AS ENUM (
    'Attendance Heavy',
    'Participation Heavy',
    'Assignment Heavy',
    'Quiz Heavy',
    'Essay Heavy',
    'Project Heavy',
    'Lab Heavy',
    'Exam Heavy'
);

ALTER TYPE public.evaluationmethods OWNER TO postgres;

CREATE TYPE public.grade AS ENUM (
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

ALTER TYPE public.grade OWNER TO postgres;

CREATE TYPE public.reportstatus AS ENUM (
    'pending',
    'resolved',
    'dismissed'
);

ALTER TYPE public.reportstatus OWNER TO postgres;

CREATE TYPE public.reporttype AS ENUM (
    'department',
    'course',
    'professor',
    'review'
);

ALTER TYPE public.reporttype OWNER TO postgres;

CREATE TYPE public.termtaken AS ENUM (
    'Fall',
    'Winter',
    'Spring',
    'Summer',
    'Year'
);

ALTER TYPE public.termtaken OWNER TO postgres;

CREATE TYPE public.textbookuse AS ENUM (
    'Yes',
    'No',
    'Optional'
);

ALTER TYPE public.textbookuse OWNER TO postgres;

CREATE TYPE public.vote AS ENUM (
    'up',
    'down'
);

ALTER TYPE public.vote OWNER TO postgres;

CREATE TYPE public.workload AS ENUM (
    'Very Light',
    'Light',
    'Moderate',
    'Heavy',
    'Very Heavy'
);

ALTER TYPE public.workload OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.courses (
    course_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    department_id uuid NOT NULL,
    course_tag character varying(50) NOT NULL,
    course_name character varying(100) NOT NULL
);

ALTER TABLE public.courses OWNER TO postgres;

CREATE TABLE public.departments (
    department_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    department_name character varying(50) NOT NULL,
    university_id uuid NOT NULL
);

ALTER TABLE public.departments OWNER TO postgres;

CREATE TABLE public.professors (
    professor_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    professor_name character varying(50) NOT NULL
);

ALTER TABLE public.professors OWNER TO postgres;

CREATE TABLE public.reports (
    report_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id character varying(40) NOT NULL,
    entity_type public.reporttype,
    entity_id uuid NOT NULL,
    report_reason text,
    report_date date DEFAULT CURRENT_DATE,
    status public.reportstatus DEFAULT 'pending'::public.reportstatus
);

ALTER TABLE public.reports OWNER TO postgres;

CREATE TABLE public.reviews (
    review_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    professor_id uuid NOT NULL,
    user_id character varying(40) NOT NULL,
    grade public.grade,
    delivery_method public.deliverymethod,
    workload public.workload,
    textbook_use public.textbookuse,
    evaluation_methods public.evaluationmethods[],
    overall_score integer DEFAULT 0,
    easy_score integer DEFAULT 0,
    interest_score integer DEFAULT 0,
    useful_score integer DEFAULT 0,
    votes integer DEFAULT 0,
    term_taken public.termtaken,
    year_taken integer,
    date_uploaded date DEFAULT CURRENT_DATE,
    course_comments text,
    professor_comments text,
    advice_comments text,
    CONSTRAINT reviews_easy_score_check CHECK (((easy_score >= 0) AND (easy_score <= 5))),
    CONSTRAINT reviews_interest_score_check CHECK (((interest_score >= 0) AND (interest_score <= 5))),
    CONSTRAINT reviews_overall_score_check CHECK (((overall_score >= 0) AND (overall_score <= 5))),
    CONSTRAINT reviews_useful_score_check CHECK (((useful_score >= 0) AND (useful_score <= 5))),
    CONSTRAINT reviews_year_taken_check CHECK (((year_taken >= 2010) AND ((year_taken)::numeric <= EXTRACT(year FROM CURRENT_DATE))))
);

ALTER TABLE public.reviews OWNER TO postgres;

CREATE TABLE public.universities (
    university_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    university_name character varying(50) NOT NULL,
    university_logo character varying(255) NOT NULL,
    domain character varying(20) NOT NULL
);

ALTER TABLE public.universities OWNER TO postgres;

CREATE TABLE public.university_requests (
    university_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    university_name character varying(50) NOT NULL,
    total_votes integer DEFAULT 1
);

ALTER TABLE public.university_requests OWNER TO postgres;

CREATE TABLE public.user_university_requests (
    university_id uuid NOT NULL,
    user_token character varying(32) NOT NULL
);

ALTER TABLE public.user_university_requests OWNER TO postgres;

CREATE TABLE public.user_votes (
    vote_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id character varying(40) NOT NULL,
    review_id uuid NOT NULL,
    vote public.vote
);

ALTER TABLE public.user_votes OWNER TO postgres;

CREATE TABLE public.users (
    user_id character varying(40) NOT NULL,
    display_name character varying(20),
    email character varying(50),
    registration_date date DEFAULT CURRENT_DATE,
    verified boolean DEFAULT false
);

ALTER TABLE public.users OWNER TO postgres;

INSERT INTO public.courses VALUES ('a2ef75af-d1a7-45ac-965d-810f89e8c058', '7e214c91-c49d-420b-80b3-8025ef054fa9', 'EECS 2200', 'Electrical Circuits');
INSERT INTO public.courses VALUES ('f45c97ae-be93-452a-afc7-501c4b3d383b', '8d548a24-238b-41ca-881f-b9143a7ccdd6', 'HRM 2420', 'Human Capital Data and Analytics');

INSERT INTO public.departments VALUES ('7e214c91-c49d-420b-80b3-8025ef054fa9', 'EECS', '78548e35-3785-45e5-9c7c-23352bafc59a');
INSERT INTO public.departments VALUES ('8d548a24-238b-41ca-881f-b9143a7ccdd6', 'School of Human Resources Management', '78548e35-3785-45e5-9c7c-23352bafc59a');

INSERT INTO public.professors VALUES ('9167904f-1fab-42a8-b0cc-95f8cc64c4d4', 'a2ef75af-d1a7-45ac-965d-810f89e8c058', 'Gerd Grau');
INSERT INTO public.professors VALUES ('eecfecc9-8733-4ea7-9789-68b536c5aecf', 'f45c97ae-be93-452a-afc7-501c4b3d383b', 'Qi Wang');

INSERT INTO public.reviews VALUES ('f7eb498b-d479-4c6d-9556-16fd39d9eba8', 'a2ef75af-d1a7-45ac-965d-810f89e8c058', '9167904f-1fab-42a8-b0cc-95f8cc64c4d4', 'bw8kceHcrYYUIGxaMx5DOkkGbhl2', 'Incomplete', 'In-Person', 'Moderate', 'No', '{"Quiz Heavy","Exam Heavy"}', 4, 2, 2, 3, 1, 'Winter', 2025, '2025-03-03', 'It goes over basic electrical circuit concepts and is math-heavy. This class is mostly based on practice and little on theory.', 'Only lectures on the whiteboard, great lecturer and explains things very clearly.', 'To succeed in this class, you have to attend all of his lectures and keep up on the homework assignments.');

INSERT INTO public.universities VALUES ('347aaace-4585-49be-b5e6-19501f78e717', 'University of Toronto', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740965345/aocju9ll9xyptvcpo3kr.png', 'utoronto');
INSERT INTO public.universities VALUES ('9bbee4f2-85ce-4aca-987f-36308a9e41b9', 'Toronto Metropolitan University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740965957/l2yfdnukfdblsmst13hy.png', 'torontomu');
INSERT INTO public.universities VALUES ('47c5c8c8-8f4e-4eba-9999-f992dd982abe', 'McMaster University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740966186/htbu8y7eemnuoi6s1lnf.png', 'mcmaster');
INSERT INTO public.universities VALUES ('35d15a27-0f04-4177-bd76-43801c7888f1', 'Western University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740967682/o4jvr4yqlcx3s9ascglq.png', 'uwo');
INSERT INTO public.universities VALUES ('e1829564-6343-4c5e-acf7-734c74f3f50e', 'University of Waterloo', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740969248/i5doxxrg7skpyacxlajp.png', 'uwaterloo');
INSERT INTO public.universities VALUES ('1c22b8b3-b932-49b5-9339-370c44791760', 'University of Guelph', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740969315/uxraqjoqhr3bqctdqlvx.png', 'uoguelph');
INSERT INTO public.universities VALUES ('e7c97569-4fce-487e-abb3-b0dc0b4ceade', 'Queens University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1671172061/QueensLogo_colour_1_y5vdbi.png', 'queensu');
INSERT INTO public.universities VALUES ('88aae34c-c9f8-4ebf-8ad6-330d139a2872', 'Wilfrid Laurier University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740970690/wih5mb4u0nm7puw3jqgy.png', 'mylaurier');
INSERT INTO public.universities VALUES ('f77b8327-ef57-4c03-80a3-3407c1bdc53b', 'Ontario Tech University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740971437/pjyac4pz2ueom14iuszq.png', 'ontariotech');
INSERT INTO public.universities VALUES ('b33d87a5-79b9-46f5-9c73-e27e4aa7c756', 'University of Ottawa', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740972866/g4qfsodsmou0rheg7qau.png', 'ottawa');
INSERT INTO public.universities VALUES ('78548e35-3785-45e5-9c7c-23352bafc59a', 'York University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1734073238/i9dtrixg8d98bv5lgqnx.png', 'yorku');
INSERT INTO public.universities VALUES ('1442d8c2-87ac-4bf9-94ff-f83c37ef63d1', 'Carleton University', 'https://res.cloudinary.com/dlinparjd/image/upload/v1740969652/rd0nwm0beoltyklyhyez.png', 'carleton');

INSERT INTO public.university_requests VALUES ('e09c0c14-ffd3-4379-84ce-41ce14672511', 'University of British Columbia', 1);
INSERT INTO public.university_requests VALUES ('08b0e36e-fbc2-4d0d-9449-588f07ced218', 'McGill University', 1);

INSERT INTO public.user_university_requests VALUES ('e09c0c14-ffd3-4379-84ce-41ce14672511', 'd57df76be11b05f5c83863e222a3d987');
INSERT INTO public.user_university_requests VALUES ('08b0e36e-fbc2-4d0d-9449-588f07ced218', 'd57df76be11b05f5c83863e222a3d987');

INSERT INTO public.user_votes VALUES ('e519dbc7-80d2-4713-bf9e-979e09e11136', 'bw8kceHcrYYUIGxaMx5DOkkGbhl2', 'f7eb498b-d479-4c6d-9556-16fd39d9eba8', 'up');

INSERT INTO public.users VALUES ('bw8kceHcrYYUIGxaMx5DOkkGbhl2', 'mouiz', 'mouiza@my.yorku.ca', '2025-03-03', false);
INSERT INTO public.users VALUES ('OPjYqykenQga1CHfVmurw8ju37r2', 'DR', 'daania@my.yorku.ca', '2025-03-03', false);

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_tag_department_id_key UNIQUE (course_tag, department_id);

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_name_university_id_key UNIQUE (department_name, university_id);

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_pkey PRIMARY KEY (professor_id);

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_professor_id_course_id_key UNIQUE (professor_id, course_id);

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_domain_key UNIQUE (domain);

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_pkey PRIMARY KEY (university_id);

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_university_name_key UNIQUE (university_name);

ALTER TABLE ONLY public.university_requests
    ADD CONSTRAINT university_requests_pkey PRIMARY KEY (university_id);

ALTER TABLE ONLY public.university_requests
    ADD CONSTRAINT university_requests_university_name_key UNIQUE (university_name);

ALTER TABLE ONLY public.user_university_requests
    ADD CONSTRAINT user_university_requests_pkey PRIMARY KEY (university_id, user_token);

ALTER TABLE ONLY public.user_votes
    ADD CONSTRAINT user_votes_pkey PRIMARY KEY (vote_id);

ALTER TABLE ONLY public.user_votes
    ADD CONSTRAINT user_votes_user_id_review_id_key UNIQUE (user_id, review_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(professor_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_university_requests
    ADD CONSTRAINT user_university_requests_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.university_requests(university_id);

ALTER TABLE ONLY public.user_votes
    ADD CONSTRAINT user_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(review_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_votes
    ADD CONSTRAINT user_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;