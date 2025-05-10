export const getUniversities = `
SELECT
    universities.*, 
    COUNT(reviews.review_id) AS review_num
FROM 
    universities
LEFT JOIN 
    departments ON universities.university_id = departments.university_id
LEFT JOIN 
    courses ON departments.department_id = courses.department_id
LEFT JOIN 
    reviews ON courses.course_id = reviews.course_id
GROUP BY 
    universities.university_id
ORDER BY 
    review_num DESC;`;

export const getUniversityDomains = `
SELECT domain FROM universities;
`;

export const getUniversityByID = `
SELECT * FROM universities WHERE university_id = $1
`;

export const getUniversityByName = `
SELECT * FROM universities WHERE university_name ILIKE $1
`;

export const getDepartments = `
SELECT * FROM departments
`;

export const getDepartmentByUniversityID = `
SELECT * FROM departments WHERE university_id = $1
`;

export const getDepartmentByID = `
SELECT * FROM departments WHERE department_id = $1
`;

export const getCourses = `
SELECT 
    courses.*,
    ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) AS overall_score,
    ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) AS easy_score,
    ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) AS interest_score,
    ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) AS useful_score,
    COUNT(reviews.review_id) as review_num
FROM 
    courses
LEFT JOIN
    reviews ON courses.course_id = reviews.course_id
GROUP BY
    courses.course_id
`;

export const getCoursesByUniversityIDCount = `
SELECT COUNT(*) FROM courses
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
WHERE universities.university_id = $1
`;

export const getCoursesByUniversityID = `
SELECT
    courses.*,
    ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) AS overall_score,
    ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) AS easy_score,
    ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) AS interest_score,
    ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) AS useful_score,
    COUNT(reviews.review_id) as review_num,
    university_name,
    department_name
FROM
    courses
LEFT JOIN
    reviews ON courses.course_id = reviews.course_id
JOIN
    departments ON departments.department_id = courses.department_id
JOIN
    universities ON universities.university_id = departments.university_id
WHERE
    universities.university_id = $1
GROUP BY
    courses.course_id, universities.university_id, departments.department_id
ORDER BY
    courses.course_tag ASC,
    courses.course_name ASC
LIMIT $2 OFFSET $3
`;

export const getCoursesByDepartmentID = `
SELECT
    courses.*,
    ROUND(COALESCE(AVG(reviews.overall_score), 0), 0) AS overall_score,
    ROUND(COALESCE(AVG(reviews.easy_score), 0), 0) AS easy_score,
    ROUND(COALESCE(AVG(reviews.interest_score), 0), 0) AS interest_score,
    ROUND(COALESCE(AVG(reviews.useful_score), 0), 0) AS useful_score,
    COUNT(reviews.review_id) as review_num
FROM
    courses
LEFT JOIN
    reviews ON courses.course_id = reviews.course_id
JOIN
    departments ON departments.department_id = courses.department_id
WHERE
    departments.department_id = $1
GROUP BY
    courses.course_id
`;

export const getCoursesByCourseID = `
SELECT
    courses.*,
    ROUND(COALESCE(AVG(reviews.overall_score), 0), 0) AS overall_score,
    ROUND(COALESCE(AVG(reviews.easy_score), 0), 0) AS easy_score,
    ROUND(COALESCE(AVG(reviews.interest_score), 0), 0) AS interest_score,
    ROUND(COALESCE(AVG(reviews.useful_score), 0), 0) AS useful_score,
    COUNT(reviews.review_id) as review_num
FROM
    courses
LEFT JOIN
    reviews ON courses.course_id = reviews.course_id
WHERE
    courses.course_id = $1
GROUP BY
    courses.course_id
`;

export const getCoursesByCourseTag = `
SELECT
    courses.*,
    ROUND(COALESCE(AVG(reviews.overall_score), 0), 0) AS overall_score,
    ROUND(COALESCE(AVG(reviews.easy_score), 0), 0) AS easy_score,
    ROUND(COALESCE(AVG(reviews.interest_score), 0), 0) AS interest_score,
    ROUND(COALESCE(AVG(reviews.useful_score), 0), 0) AS useful_score,
    COUNT(reviews.review_id) as review_num,
    departments.department_id,
    departments.department_name,
    departments.university_id,
    universities.university_name
FROM
    courses
JOIN
    departments ON departments.department_id = courses.department_id
JOIN
    universities ON universities.university_id = departments.university_id
LEFT JOIN
    reviews ON courses.course_id = reviews.course_id
WHERE
    courses.course_tag ILIKE $1 AND universities.university_id = $2
GROUP BY
    courses.course_id, departments.department_id, universities.university_id
`;

export const getProfessors = `
SELECT * FROM professors
`;

export const getProfessorsByUniversityID = `
SELECT * FROM professors
WHERE
    professors.university_id = $1
`;

export const getProfessorsByCourseID = `
SELECT 
    *
FROM 
    professors
WHERE 
    course_id = $1;
`;

export const getReviews = `
SELECT 
    reviews.*, professors.professor_name
FROM 
    reviews
JOIN professors ON professors.professor_id = reviews.professor_id
GROUP BY
    reviews.review_id
`;

export const getReviewsByUniversityID = `
SELECT * FROM reviews
JOIN 
    courses on courses.course_id = reviews.course_id
JOIN
    departments on departments.department_id = courses.department_id
JOIN
    universities on universities.course_id = departments.university_id
WHERE
    universities.university_id = $1
`;

export const getReviewsByDepartmentID = `
SELECT * FROM reviews
JOIN
    courses on courses.course_id = reviews.course_id
JOIN
    departments on departments.department_id = courses.department_id
WHERE
    departments.department_id = $1
`;

export const getReviewsByCourseID = `
SELECT reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods, professors.professor_name, departments.department_id, departments.department_name, universities.university_id, universities.university_name, user_votes.vote
FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN user_votes ON user_votes.review_id = reviews.review_id AND user_votes.user_id = $1
WHERE reviews.course_id = $2;
`;

export const getExistingVote = `
SELECT * FROM user_votes
WHERE
    user_id = $1 AND review_id = $2
`;

export const addVote = `
INSERT INTO 
    user_votes (user_id, review_id, vote)
VALUES
    ($1, $2, $3)
`;

export const deleteVote = `
DELETE FROM user_votes
WHERE review_id = $1 AND user_id = $2
`;

export const updateVote = `
UPDATE
    user_votes
SET vote = $1
WHERE review_id = $2 AND user_id = $3
`;

export const updateTotalVotes = `
UPDATE reviews
    SET votes = votes + $1
WHERE review_id = $2
`;

export const getUserReviews = `
SELECT reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods, professors.professor_name, departments.department_id, departments.department_name, universities.university_id, universities.university_name, user_votes.vote FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN user_votes ON user_votes.review_id = reviews.review_id AND user_votes.user_id = $1
WHERE
    reviews.user_id = $1
`;

export const getUserVotedReviews = `
SELECT reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods, professors.professor_name, departments.department_id, departments.department_name, universities.university_id, universities.university_name, user_votes.vote FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN user_votes ON user_votes.review_id = reviews.review_id AND user_votes.user_id = $1
WHERE user_votes.vote = $2
`;

export const addUser = `
INSERT INTO users (user_id, display_name, email) VALUES ($1, $2, $3)
`;

export const getUserVotes = `
SELECT
    *
FROM
    user_votes
WHERE
    user_votes.user_id = $1
`;

export const getDepartmentID = `SELECT * from departments WHERE department_name = $1 AND university_id = $2`;

export const getProfessorID = `select * from professors where professor_name = $1 and course_id = $2`;

export const addProfessor = `INSERT INTO professors (professor_name, course_id) VALUES ($1, $2) RETURNING *`;

export const addDepartment = `INSERT INTO departments (department_name, university_id) VALUES ($1, $2) RETURNING *`;

export const addReview = `
INSERT INTO
    reviews (course_id, professor_id, user_id, grade, delivery_method, workload, textbook_use, evaluation_methods, overall_score, easy_score, interest_score, useful_score, term_taken, year_taken, course_comments, professor_comments, advice_comments, votes)
VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 1) RETURNING *
`;

export const addUpvote = `
INSERT INTO
    user_votes (user_id, review_id, vote)
VALUES
    ($1, $2, 'up')
`;

export const addCourse = `
INSERT INTO
    courses (department_id, course_tag, course_name)
VALUES
    ($1, $2, $3)
RETURNING *
`;

export const requestUniversity = `
INSERT INTO university_requests (university_name) VALUES ($1) RETURNING *
`;

export const getRequestedUniversities = `
SELECT
    ur.university_id,
    ur.university_name,
    ur.total_votes,
    uur.user_token
FROM university_requests ur
LEFT JOIN user_university_requests uur
       ON ur.university_id = uur.university_id
      AND uur.user_token = $1;
`;

export const upvoteRequestedUniversity = `
insert into user_university_requests (university_id, user_token)
    values ($1, $2);
`;

export const updateTotalVotesRequestedUniversity = `
update university_requests
    set total_votes = total_votes + 1
    where university_id = $1;
`;

export const deleteUserReview = `
DELETE FROM reviews
WHERE review_id = $1
  AND user_id = $2;
`;

export const createReport = `
INSERT INTO reports (user_id, entity_type, entity_id, report_reason) VALUES ($1, $2, $3, $4) RETURNING *
`;
