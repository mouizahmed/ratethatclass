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

export const getUniversitiesPaginated = `
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
WHERE
    ($3::text IS NULL OR universities.university_name ILIKE '%' || $3 || '%')
GROUP BY 
    universities.university_id
ORDER BY
    CASE WHEN $4 = 'university_name' AND $5 = 'asc' THEN universities.university_name END ASC,
    CASE WHEN $4 = 'university_name' AND $5 = 'desc' THEN universities.university_name END DESC,
    CASE WHEN $4 = 'review_num' AND $5 = 'asc' THEN COUNT(reviews.review_id) END ASC,
    CASE WHEN $4 = 'review_num' AND $5 = 'desc' THEN COUNT(reviews.review_id) END DESC,
    review_num DESC
LIMIT $1 OFFSET $2
`;

export const getUniversitiesCount = `
SELECT COUNT(*) FROM universities
WHERE ($1::text IS NULL OR universities.university_name ILIKE '%' || $1 || '%')
`;

export const getUniversityDomains = `
SELECT domain FROM universities;
`;

export const getUniversityById = `
SELECT * FROM universities WHERE university_id = $1
`;

export const getUniversityByName = `
SELECT * FROM universities WHERE university_name ILIKE $1
`;

export const getDepartments = `
SELECT * FROM departments
`;

export const getDepartmentsPaginated = `
SELECT departments.*, universities.university_name
FROM departments
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN courses ON departments.department_id = courses.department_id
LEFT JOIN reviews ON courses.course_id = reviews.course_id
WHERE
    ($3::text IS NULL OR 
     departments.department_name ILIKE '%' || $3 || '%' OR
     universities.university_name ILIKE '%' || $3 || '%')
GROUP BY departments.department_id, universities.university_id
ORDER BY
    CASE WHEN $4 = 'department_name' AND $5 = 'asc' THEN departments.department_name END ASC,
    CASE WHEN $4 = 'department_name' AND $5 = 'desc' THEN departments.department_name END DESC,
    CASE WHEN $4 = 'university_name' AND $5 = 'asc' THEN universities.university_name END ASC,
    CASE WHEN $4 = 'university_name' AND $5 = 'desc' THEN universities.university_name END DESC,
    CASE WHEN $4 = 'total_reviews' AND $5 = 'asc' THEN COUNT(reviews.review_id) END ASC,
    CASE WHEN $4 = 'total_reviews' AND $5 = 'desc' THEN COUNT(reviews.review_id) END DESC,
    COUNT(reviews.review_id) DESC, departments.department_name ASC
LIMIT $1 OFFSET $2
`;

export const getDepartmentsCount = `
SELECT COUNT(DISTINCT departments.department_id) FROM departments
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN courses ON departments.department_id = courses.department_id
LEFT JOIN reviews ON courses.course_id = reviews.course_id
WHERE
    ($1::text IS NULL OR 
     departments.department_name ILIKE '%' || $1 || '%' OR
     universities.university_name ILIKE '%' || $1 || '%')
`;

export const getDepartmentByUniversityId = `
SELECT departments.*, universities.university_name
FROM departments
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN courses ON departments.department_id = courses.department_id
LEFT JOIN reviews ON courses.course_id = reviews.course_id
WHERE departments.university_id = $1
AND ($2::text IS NULL OR departments.department_name ILIKE '%' || $2 || '%')
GROUP BY departments.department_id, universities.university_id
ORDER BY
    CASE WHEN $3 = 'department_name' AND $4 = 'asc' THEN departments.department_name END ASC,
    CASE WHEN $3 = 'department_name' AND $4 = 'desc' THEN departments.department_name END DESC,
    CASE WHEN $3 = 'total_reviews' AND $4 = 'asc' THEN COUNT(reviews.review_id) END ASC,
    CASE WHEN $3 = 'total_reviews' AND $4 = 'desc' THEN COUNT(reviews.review_id) END DESC,
    COUNT(reviews.review_id) DESC, departments.department_name ASC
`;

export const getDepartmentById = `
SELECT * FROM departments WHERE department_id = $1
`;

export const getDepartmentByUniversityIDPaginated = `
SELECT departments.*, universities.university_name
FROM departments
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN courses ON departments.department_id = courses.department_id
LEFT JOIN reviews ON courses.course_id = reviews.course_id
WHERE departments.university_id = $3
AND ($4::text IS NULL OR departments.department_name ILIKE '%' || $4 || '%')
GROUP BY departments.department_id, universities.university_id
ORDER BY
    CASE WHEN $5 = 'department_name' AND $6 = 'asc' THEN departments.department_name END ASC,
    CASE WHEN $5 = 'department_name' AND $6 = 'desc' THEN departments.department_name END DESC,
    CASE WHEN $5 = 'total_reviews' AND $6 = 'asc' THEN COUNT(reviews.review_id) END ASC,
    CASE WHEN $5 = 'total_reviews' AND $6 = 'desc' THEN COUNT(reviews.review_id) END DESC,
    COUNT(reviews.review_id) DESC, departments.department_name ASC
LIMIT $1 OFFSET $2
`;

export const getDepartmentByUniversityIDCount = `
SELECT COUNT(DISTINCT departments.department_id) FROM departments
LEFT JOIN courses ON departments.department_id = courses.department_id
LEFT JOIN reviews ON courses.course_id = reviews.course_id
WHERE university_id = $1
AND ($2::text IS NULL OR departments.department_name ILIKE '%' || $2 || '%')
`;

export const getCourses = `
SELECT 
    courses.*,
    ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) AS overall_score,
    ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) AS easy_score,
    ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) AS interest_score,
    ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) AS useful_score,
    COUNT(reviews.review_id) as review_num,
    department_name,
    universities.university_name
FROM 
    courses
LEFT JOIN
    reviews ON courses.course_id = reviews.course_id
JOIN
    departments ON departments.department_id = courses.department_id
JOIN
    universities ON universities.university_id = departments.university_id
WHERE
    ($3::text IS NULL OR 
        courses.course_name ILIKE '%' || $3 || '%' OR 
        courses.course_tag ILIKE '%' || $3 || '%')
GROUP BY
    courses.course_id, departments.department_id, universities.university_id
ORDER BY
    CASE WHEN $4 = 'course_tag' AND $5 = 'asc' THEN courses.course_tag END ASC,
    CASE WHEN $4 = 'course_tag' AND $5 = 'desc' THEN courses.course_tag END DESC,
    CASE WHEN $4 = 'course_name' AND $5 = 'asc' THEN courses.course_name END ASC,
    CASE WHEN $4 = 'course_name' AND $5 = 'desc' THEN courses.course_name END DESC,
    CASE WHEN $4 = 'review_num' AND $5 = 'asc' THEN COUNT(reviews.review_id) END ASC,
    CASE WHEN $4 = 'review_num' AND $5 = 'desc' THEN COUNT(reviews.review_id) END DESC,
    CASE WHEN $4 = 'overall_score' AND $5 = 'asc' THEN ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) END ASC,
    CASE WHEN $4 = 'overall_score' AND $5 = 'desc' THEN ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) END DESC,
    CASE WHEN $4 = 'easy_score' AND $5 = 'asc' THEN ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) END ASC,
    CASE WHEN $4 = 'easy_score' AND $5 = 'desc' THEN ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) END DESC,
    CASE WHEN $4 = 'interest_score' AND $5 = 'asc' THEN ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) END ASC,
    CASE WHEN $4 = 'interest_score' AND $5 = 'desc' THEN ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) END DESC,
    CASE WHEN $4 = 'useful_score' AND $5 = 'asc' THEN ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) END ASC,
    CASE WHEN $4 = 'useful_score' AND $5 = 'desc' THEN ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) END DESC,
    courses.course_tag ASC
LIMIT $1 OFFSET $2
`;

export const getCoursesCount = `
SELECT COUNT(DISTINCT courses.course_id) 
FROM courses
LEFT JOIN departments ON departments.department_id = courses.department_id
LEFT JOIN universities ON universities.university_id = departments.university_id
WHERE ($1::text IS NULL OR 
    courses.course_name ILIKE '%' || $1 || '%' OR 
    courses.course_tag ILIKE '%' || $1 || '%')
`;

export const getCoursesByUniversityIdCount = `
SELECT COUNT(*) FROM courses
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
WHERE universities.university_id = $1
AND ($2::text IS NULL OR 
    courses.course_name ILIKE '%' || $2 || '%' OR 
    courses.course_tag ILIKE '%' || $2 || '%')
AND ($3::text IS NULL OR departments.department_id = $3::uuid)
`;

export const getCoursesByUniversityId = `
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
    AND ($4::text IS NULL OR 
        courses.course_name ILIKE '%' || $4 || '%' OR 
        courses.course_tag ILIKE '%' || $4 || '%')
    AND ($5::text IS NULL OR departments.department_id = $5::uuid)
GROUP BY
    courses.course_id, universities.university_id, departments.department_id
ORDER BY
    CASE WHEN $6 = 'course_tag' AND $7 = 'asc' THEN courses.course_tag END ASC,
    CASE WHEN $6 = 'course_tag' AND $7 = 'desc' THEN courses.course_tag END DESC,
    CASE WHEN $6 = 'course_name' AND $7 = 'asc' THEN courses.course_name END ASC,
    CASE WHEN $6 = 'course_name' AND $7 = 'desc' THEN courses.course_name END DESC,
    CASE WHEN $6 = 'review_num' AND $7 = 'asc' THEN COUNT(reviews.review_id) END ASC,
    CASE WHEN $6 = 'review_num' AND $7 = 'desc' THEN COUNT(reviews.review_id) END DESC,
    CASE WHEN $6 = 'overall_score' AND $7 = 'asc' THEN ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) END ASC,
    CASE WHEN $6 = 'overall_score' AND $7 = 'desc' THEN ROUND(COALESCE(AVG(reviews.overall_score), 0), 1) END DESC,
    CASE WHEN $6 = 'easy_score' AND $7 = 'asc' THEN ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) END ASC,
    CASE WHEN $6 = 'easy_score' AND $7 = 'desc' THEN ROUND(COALESCE(AVG(reviews.easy_score), 0), 1) END DESC,
    CASE WHEN $6 = 'interest_score' AND $7 = 'asc' THEN ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) END ASC,
    CASE WHEN $6 = 'interest_score' AND $7 = 'desc' THEN ROUND(COALESCE(AVG(reviews.interest_score), 0), 1) END DESC,
    CASE WHEN $6 = 'useful_score' AND $7 = 'asc' THEN ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) END ASC,
    CASE WHEN $6 = 'useful_score' AND $7 = 'desc' THEN ROUND(COALESCE(AVG(reviews.useful_score), 0), 1) END DESC,
    courses.course_tag ASC
LIMIT $2 OFFSET $3
`;

export const getCoursesByDepartmentId = `
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

export const getCoursesByCourseId = `
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

export const getProfessorsPaginated = `
SELECT professors.*, courses.course_name, courses.course_tag
FROM professors
JOIN courses ON courses.course_id = professors.course_id
WHERE
    ($3::text IS NULL OR 
     professors.professor_name ILIKE '%' || $3 || '%' OR
     courses.course_name ILIKE '%' || $3 || '%' OR
     courses.course_tag ILIKE '%' || $3 || '%')
ORDER BY
    CASE WHEN $4 = 'professor_name' AND $5 = 'asc' THEN professors.professor_name END ASC,
    CASE WHEN $4 = 'professor_name' AND $5 = 'desc' THEN professors.professor_name END DESC,
    CASE WHEN $4 = 'course_name' AND $5 = 'asc' THEN courses.course_name END ASC,
    CASE WHEN $4 = 'course_name' AND $5 = 'desc' THEN courses.course_name END DESC,
    CASE WHEN $4 = 'course_tag' AND $5 = 'asc' THEN courses.course_tag END ASC,
    CASE WHEN $4 = 'course_tag' AND $5 = 'desc' THEN courses.course_tag END DESC,
    professors.professor_name ASC
LIMIT $1 OFFSET $2
`;

export const getProfessorsCount = `
SELECT COUNT(*) FROM professors
JOIN courses ON courses.course_id = professors.course_id
WHERE
    ($1::text IS NULL OR 
     professors.professor_name ILIKE '%' || $1 || '%' OR
     courses.course_name ILIKE '%' || $1 || '%' OR
     courses.course_tag ILIKE '%' || $1 || '%')
`;

export const getProfessorsByUniversityIdPaginated = `
SELECT professors.*, courses.course_name, courses.course_tag
FROM professors
JOIN courses ON courses.course_id = professors.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
WHERE universities.university_id = $3
AND ($4::text IS NULL OR professors.professor_name ILIKE '%' || $4 || '%')
ORDER BY
    CASE WHEN $5 = 'professor_name' AND $6 = 'asc' THEN professors.professor_name END ASC,
    CASE WHEN $5 = 'professor_name' AND $6 = 'desc' THEN professors.professor_name END DESC,
    CASE WHEN $5 = 'course_name' AND $6 = 'asc' THEN courses.course_name END ASC,
    CASE WHEN $5 = 'course_name' AND $6 = 'desc' THEN courses.course_name END DESC,
    CASE WHEN $5 = 'course_tag' AND $6 = 'asc' THEN courses.course_tag END ASC,
    CASE WHEN $5 = 'course_tag' AND $6 = 'desc' THEN courses.course_tag END DESC,
    professors.professor_name ASC
LIMIT $1 OFFSET $2
`;

export const getProfessorsByUniversityIdCount = `
SELECT COUNT(*) FROM professors
JOIN courses ON courses.course_id = professors.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
WHERE universities.university_id = $1
AND ($2::text IS NULL OR professors.professor_name ILIKE '%' || $2 || '%')
`;

export const getProfessorsByCourseIdPaginated = `
SELECT professors.*
FROM professors
WHERE course_id = $3
AND ($4::text IS NULL OR professors.professor_name ILIKE '%' || $4 || '%')
ORDER BY
    CASE WHEN $5 = 'professor_name' AND $6 = 'asc' THEN professors.professor_name END ASC,
    CASE WHEN $5 = 'professor_name' AND $6 = 'desc' THEN professors.professor_name END DESC,
    professors.professor_name ASC
LIMIT $1 OFFSET $2
`;

export const getProfessorsByCourseIdCount = `
SELECT COUNT(*) FROM professors
WHERE course_id = $1
AND ($2::text IS NULL OR professors.professor_name ILIKE '%' || $2 || '%')
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

export const getReviewsPaginated = `
SELECT 
    reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods,
    professors.professor_name, professors.professor_id,
    courses.course_id, courses.course_name, courses.course_tag,
    departments.department_id, departments.department_name,
    universities.university_id, universities.university_name
FROM 
    reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
WHERE
    ($3::text IS NULL OR 
     professors.professor_name ILIKE '%' || $3 || '%' OR
     courses.course_name ILIKE '%' || $3 || '%' OR
     courses.course_tag ILIKE '%' || $3 || '%')
`;

export const getReviewsCount = `
SELECT COUNT(*) FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
WHERE
    ($1::text IS NULL OR 
     professors.professor_name ILIKE '%' || $1 || '%' OR
     courses.course_name ILIKE '%' || $1 || '%' OR
     courses.course_tag ILIKE '%' || $1 || '%')
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

export const getReviewsByCourseIDPaginated = `
SELECT reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods, 
professors.professor_name, professors.professor_id,
departments.department_id, departments.department_name, 
universities.university_id, universities.university_name, 
user_votes.vote
FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN user_votes ON user_votes.review_id = reviews.review_id AND user_votes.user_id = $1
WHERE reviews.course_id = $2
`;

export const getReviewsByCourseIDWithProfessor = `
AND professors.professor_id = $PLACEHOLDER
`;

export const getReviewsByCourseIDWithTerm = `
AND reviews.term_taken = $PLACEHOLDER
`;

export const getReviewsByCourseIDWithDelivery = `
AND reviews.delivery_method = $PLACEHOLDER
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

export const getUserReviewsPaginated = `
SELECT reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods, 
professors.professor_name, departments.department_id, departments.department_name, 
universities.university_id, universities.university_name, user_votes.vote 
FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN user_votes ON user_votes.review_id = reviews.review_id AND user_votes.user_id = $1
WHERE reviews.user_id = $1
ORDER BY
    CASE WHEN $2 = 'date_uploaded' AND $3 = 'ASC' THEN reviews.date_uploaded END ASC,
    CASE WHEN $2 = 'date_uploaded' AND $3 = 'DESC' THEN reviews.date_uploaded END DESC,
    CASE WHEN $2 = 'overall_score' AND $3 = 'ASC' THEN reviews.overall_score END ASC, 
    CASE WHEN $2 = 'overall_score' AND $3 = 'DESC' THEN reviews.overall_score END DESC,
    CASE WHEN $2 = 'easy_score' AND $3 = 'ASC' THEN reviews.easy_score END ASC,
    CASE WHEN $2 = 'easy_score' AND $3 = 'DESC' THEN reviews.easy_score END DESC,
    CASE WHEN $2 = 'interest_score' AND $3 = 'ASC' THEN reviews.interest_score END ASC,
    CASE WHEN $2 = 'interest_score' AND $3 = 'DESC' THEN reviews.interest_score END DESC,
    CASE WHEN $2 = 'useful_score' AND $3 = 'ASC' THEN reviews.useful_score END ASC,
    CASE WHEN $2 = 'useful_score' AND $3 = 'DESC' THEN reviews.useful_score END DESC,
    CASE WHEN $2 = 'votes' AND $3 = 'ASC' THEN reviews.votes END ASC,
    CASE WHEN $2 = 'votes' AND $3 = 'DESC' THEN reviews.votes END DESC
LIMIT $4 OFFSET $5
`;

export const getUserReviewsCount = `
SELECT COUNT(*) FROM reviews
WHERE reviews.user_id = $1
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

export const getUserVotedReviewsPaginated = `
SELECT reviews.*, array_to_json(reviews.evaluation_methods) AS evaluation_methods, 
professors.professor_name, departments.department_id, departments.department_name, 
universities.university_id, universities.university_name, user_votes.vote 
FROM reviews
JOIN professors ON professors.professor_id = reviews.professor_id
JOIN courses ON courses.course_id = reviews.course_id
JOIN departments ON departments.department_id = courses.department_id
JOIN universities ON universities.university_id = departments.university_id
LEFT JOIN user_votes ON user_votes.review_id = reviews.review_id AND user_votes.user_id = $1
WHERE user_votes.vote = $2
ORDER BY
    CASE WHEN $3 = 'date_uploaded' AND $4 = 'ASC' THEN reviews.date_uploaded END ASC,
    CASE WHEN $3 = 'date_uploaded' AND $4 = 'DESC' THEN reviews.date_uploaded END DESC,
    CASE WHEN $3 = 'overall_score' AND $4 = 'ASC' THEN reviews.overall_score END ASC, 
    CASE WHEN $3 = 'overall_score' AND $4 = 'DESC' THEN reviews.overall_score END DESC,
    CASE WHEN $3 = 'easy_score' AND $4 = 'ASC' THEN reviews.easy_score END ASC,
    CASE WHEN $3 = 'easy_score' AND $4 = 'DESC' THEN reviews.easy_score END DESC,
    CASE WHEN $3 = 'interest_score' AND $4 = 'ASC' THEN reviews.interest_score END ASC,
    CASE WHEN $3 = 'interest_score' AND $4 = 'DESC' THEN reviews.interest_score END DESC,
    CASE WHEN $3 = 'useful_score' AND $4 = 'ASC' THEN reviews.useful_score END ASC,
    CASE WHEN $3 = 'useful_score' AND $4 = 'DESC' THEN reviews.useful_score END DESC,
    CASE WHEN $3 = 'votes' AND $4 = 'ASC' THEN reviews.votes END ASC,
    CASE WHEN $3 = 'votes' AND $4 = 'DESC' THEN reviews.votes END DESC
LIMIT $5 OFFSET $6
`;

export const getUserVotedReviewsCount = `
SELECT COUNT(*) FROM reviews
JOIN user_votes ON user_votes.review_id = reviews.review_id
WHERE user_votes.user_id = $1 AND user_votes.vote = $2
`;

export const getUserVotes = `
SELECT
    *
FROM
    user_votes
WHERE
    user_votes.user_id = $1
`;

export const addUser = `
INSERT INTO users (user_id, display_name, email) VALUES ($1, $2, $3)
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

export const getReportsPaginated = `
SELECT 
  reports.*,
  users.display_name,
  CASE 
    WHEN reports.entity_type = 'course' THEN (
      SELECT json_build_object(
        'course_name', courses.course_name,
        'course_tag', courses.course_tag,
        'department_name', departments.department_name,
        'department_id', departments.department_id,
        'university_name', universities.university_name
      )
      FROM courses
      LEFT JOIN departments ON departments.department_id = courses.department_id
      LEFT JOIN universities ON universities.university_id = departments.university_id
      WHERE courses.course_id = reports.entity_id::uuid
    )
    WHEN reports.entity_type = 'review' THEN (
      SELECT json_build_object(
        'course_name', courses.course_name,
        'course_tag', courses.course_tag,
        'department_name', departments.department_name,
        'university_name', universities.university_name,
        'professor_name', professors.professor_name,
        'professor_id', professors.professor_id,
        'course_comments', reviews.course_comments,
        'professor_comments', reviews.professor_comments,
        'advice_comments', reviews.advice_comments,
        'reviewer_display_name', review_users.display_name,
        'reviewer_email', review_users.email,
        'reviewer_id', reviews.user_id
      )
      FROM reviews
      LEFT JOIN courses ON courses.course_id = reviews.course_id
      LEFT JOIN professors ON professors.professor_id = reviews.professor_id
      LEFT JOIN departments ON departments.department_id = courses.department_id
      LEFT JOIN universities ON universities.university_id = departments.university_id
      LEFT JOIN users review_users ON review_users.user_id = reviews.user_id
      WHERE reviews.review_id = reports.entity_id::uuid
    )
  END as entity_details
FROM reports
LEFT JOIN users ON users.user_id = reports.user_id
WHERE ($3::reporttype IS NULL OR reports.entity_type = $3::reporttype)
AND ($4::reportstatus IS NULL OR reports.status = $4::reportstatus)
ORDER BY
    CASE WHEN $5 = 'date_created' AND $6 = 'asc' THEN reports.report_date END ASC,
    CASE WHEN $5 = 'date_created' AND $6 = 'desc' THEN reports.report_date END DESC,
    reports.report_date DESC
LIMIT $1 OFFSET $2
`;

export const getReportsCount = `
SELECT COUNT(*) FROM reports
WHERE ($1::reporttype IS NULL OR reports.entity_type = $1::reporttype)
AND ($2::reportstatus IS NULL OR reports.status = $2::reportstatus)
`;

export const insertBan = `
INSERT INTO bans (user_id, ban_reason, banned_by, banned_at)
VALUES ($1, $2, $3, NOW())
RETURNING *;
`;

export const getBannedUsers = `
SELECT u.user_id, u.email, u.display_name, b.ban_reason, b.banned_at, b.banned_by
FROM users u
JOIN bans b ON u.user_id = b.user_id
WHERE b.unbanned_at IS NULL
`;

export const unbanUser = `
UPDATE bans SET unbanned_at = NOW() WHERE user_id = $1 AND unbanned_at IS NULL RETURNING *;
`;
