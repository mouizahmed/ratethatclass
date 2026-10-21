import glob
import json
import os
from typing import Dict, List

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

from logger import setup_logger

logger = setup_logger(__name__)

class DatabaseManager:
    def __init__(self):
        load_dotenv()

        dbname = os.getenv('DB_NAME')
        user = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        if not all([dbname, user, password]):
            raise ValueError("Missing required database configuration. Check your .env file for DB_NAME, DB_USER, and DB_PASSWORD")

        self.conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            connect_timeout=10,
        )

    def import_university(self, university_name: str, departments: Dict[str, List[Dict[str, str]]]) -> bool:
        """Insert missing departments and courses for one university in a single transaction.

        Course tags are unique per university (case-insensitive): a tag that already exists anywhere in the
        university, or appears earlier in the scraped data (e.g. a cross-listed course), is skipped.
        """
        try:
            with self.conn, self.conn.cursor() as cursor:
                cursor.execute("SELECT university_id FROM universities WHERE university_name = %s", (university_name,))
                row = cursor.fetchone()
                if row is None:
                    logger.error(f"University '{university_name}' not found in database")
                    return False
                university_id = row[0]

                cursor.execute(
                    "SELECT department_name, department_id FROM departments WHERE university_id = %s",
                    (university_id,),
                )
                department_ids = dict(cursor.fetchall())

                cursor.execute(
                    """
                    SELECT LOWER(courses.course_tag) FROM courses
                    JOIN departments ON departments.department_id = courses.department_id
                    WHERE departments.university_id = %s
                    """,
                    (university_id,),
                )
                seen_tags = {tag for (tag,) in cursor.fetchall()}

                new_departments = 0
                new_courses = 0
                for department_name, courses in departments.items():
                    rows = []
                    for course in courses:
                        tag = course["course_tag"].lower()
                        if tag not in seen_tags:
                            seen_tags.add(tag)
                            rows.append((course["course_tag"], course["course_name"]))
                    if not rows:
                        continue

                    department_id = department_ids.get(department_name)
                    if department_id is None:
                        cursor.execute(
                            "INSERT INTO departments (department_name, university_id) VALUES (%s, %s) RETURNING department_id",
                            (department_name, university_id),
                        )
                        department_id = cursor.fetchone()[0]
                        department_ids[department_name] = department_id
                        new_departments += 1

                    execute_values(
                        cursor,
                        "INSERT INTO courses (department_id, course_tag, course_name) VALUES %s",
                        [(department_id, tag, name) for tag, name in rows],
                    )
                    new_courses += len(rows)

            total_courses = sum(len(courses) for courses in departments.values())
            logger.info(
                f"{university_name}: added {new_departments} departments and {new_courses} courses "
                f"({total_courses - new_courses} of {total_courses} scraped courses already existed or were duplicates)"
            )
            return True
        except psycopg2.Error as e:
            logger.error(f"Error importing {university_name}: {e}")
            return False

    def load_and_insert_from_json(self) -> bool:
        json_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraped_data")
        json_files = sorted(glob.glob(os.path.join(json_dir, "*.json")))
        if not json_files:
            logger.error(f"No JSON files found in directory: {json_dir}")
            return False

        logger.info(f"Found {len(json_files)} JSON files to process")
        successful_imports = 0
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    json_data = json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                logger.error(f"Error reading JSON file {json_file}: {e}")
                continue

            university_name = json_data.get("university_name")
            departments = json_data.get("departments")
            if not university_name or not departments:
                logger.error(f"Invalid JSON format in {json_file}. Missing university_name or departments.")
                continue

            if self.import_university(university_name, departments):
                successful_imports += 1

        logger.info(f"JSON import complete. Successfully imported {successful_imports}/{len(json_files)} files")
        return successful_imports > 0

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
