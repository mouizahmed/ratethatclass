import { pool } from '../../src/db/db';

export { pool };

export async function resetDb() {
  const { rows } = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  await pool.query(`TRUNCATE ${rows.map((row) => `"${row.tablename}"`).join(', ')} CASCADE`);
}

/** One university (UofT, domain utoronto.ca) with one department and one course. */
export async function seedCourse() {
  const university = await pool.query(
    "INSERT INTO universities (university_name, university_logo, domain) VALUES ('University of Toronto', 'logo.png', 'utoronto.ca') RETURNING university_id"
  );
  const universityId: string = university.rows[0].university_id;
  const department = await pool.query(
    "INSERT INTO departments (department_name, university_id) VALUES ('Computer Science', $1) RETURNING department_id",
    [universityId]
  );
  const course = await pool.query(
    "INSERT INTO courses (department_id, course_tag, course_name) VALUES ($1, 'CSC108', 'Intro to Programming') RETURNING course_id",
    [department.rows[0].department_id]
  );
  return { universityId, departmentId: department.rows[0].department_id as string, courseId: course.rows[0].course_id as string };
}

export async function insertUser(userId: string, accountType = 'anonymous', email: string | null = null) {
  await pool.query('INSERT INTO users (user_id, account_type, email) VALUES ($1, $2, $3)', [userId, accountType, email]);
}

/** Inserts a review directly (bypassing the API) and returns its id. */
export async function insertReview(courseId: string, userId: string, votes = 1) {
  await pool.query('INSERT INTO users (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
  const professor = await pool.query(
    "INSERT INTO professors (professor_name, course_id) VALUES ('Jane Doe', $1) RETURNING professor_id",
    [courseId]
  );
  const review = await pool.query(
    `INSERT INTO reviews (course_id, professor_id, user_id, overall_score, easy_score, interest_score, useful_score, votes, course_comments)
     VALUES ($1, $2, $3, 4, 3, 5, 4, $4, 'Seeded review') RETURNING review_id`,
    [courseId, professor.rows[0].professor_id, userId, votes]
  );
  return review.rows[0].review_id as string;
}

export async function count(table: string) {
  const { rows } = await pool.query(`SELECT count(*)::int AS n FROM ${table}`);
  return rows[0].n as number;
}

/** A review body that passes the server's validation. */
export function reviewPayload(overrides: Record<string, unknown> = {}) {
  return {
    professor_name: 'Jane Doe',
    grade: 'A',
    delivery_method: 'In-Person',
    workload: 'Moderate',
    textbook_use: 'No',
    evaluation_methods: ['Assignment Heavy'],
    overall_score: 4,
    easy_score: 3,
    interest_score: 5,
    useful_score: 4,
    term_taken: 'Fall',
    year_taken: 2024,
    course_comments: 'Great course',
    professor_comments: 'Clear lectures',
    advice_comments: 'Start early',
    ...overrides,
  };
}
