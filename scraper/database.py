import psycopg2
from psycopg2 import Error
from typing import Dict, List, Optional
import logging
from datetime import datetime
from logger import setup_logger

# Get configured logger
logger = setup_logger(__name__)

class DatabaseManager:
    def __init__(self, dbname: str, user: str, password: str, host: str = "localhost", port: str = "5432"):
        """Initialize database connection parameters."""
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.connection = None
        self.cursor = None

    def connect(self) -> bool:
        """Establish connection to the PostgreSQL database."""
        try:
            self.connection = psycopg2.connect(
                dbname=self.dbname,
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port
            )
            self.cursor = self.connection.cursor()
            logger.info("Successfully connected to the database")
            return True
        except Error as e:
            logger.error(f"Error connecting to PostgreSQL: {e}")
            return False

    def disconnect(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

    def get_university_id(self, university_name: str) -> Optional[int]:
        """
        Get the university ID by name.
        Returns the university ID if found, None otherwise.
        """
        try:
            query = """
                SELECT university_id FROM universities 
                WHERE university_name = %s
            """
            self.cursor.execute(query, (university_name,))
            result = self.cursor.fetchone()
            
            if result:
                return result[0]
            else:
                logger.error(f"University '{university_name}' not found in database")
                return None
        except Error as e:
            logger.error(f"Error getting university ID: {e}")
            return None

    def insert_department(self, department_name: str, university_id: int) -> Optional[int]:
        """
        Insert a new department into the database.
        Returns the department_id regardless if it's a new insert or already exists.
        """
        try:
            # First check if the department already exists
            query = """
                SELECT department_id FROM departments
                WHERE department_name = %s AND university_id = %s
            """
            self.cursor.execute(query, (department_name, university_id))
            result = self.cursor.fetchone()
            
            if result:
                # Department already exists, return the id
                logger.info(f"Department '{department_name}' already exists with ID {result[0]}")
                return result[0]
            
            # Department doesn't exist, insert and return the new id
            query = """
                INSERT INTO departments (department_name, university_id)
                VALUES (%s, %s)
                RETURNING department_id
            """
            self.cursor.execute(query, (department_name, university_id))
            department_id = self.cursor.fetchone()[0]
            self.connection.commit()
            logger.info(f"Created new department '{department_name}' with ID {department_id}")
            return department_id
        except Error as e:
            logger.error(f"Error inserting department: {e}")
            self.connection.rollback()
            return None

    def insert_course(self, department_id: str, course_tag: str, course_name: str) -> bool:
        """Insert a new course into the database."""
        try:
            # Check if course already exists
            query = """
                SELECT course_id FROM courses 
                WHERE department_id = %s AND course_tag = %s
            """
            self.cursor.execute(query, (department_id, course_tag))
            result = self.cursor.fetchone()
            
            if result:
                logger.info(f"Course '{course_tag}' already exists with ID {result[0]}")
                return True
                
            # Insert new course
            query = """
                INSERT INTO courses (department_id, course_tag, course_name)
                VALUES (%s, %s, %s)
                RETURNING course_id
            """
            self.cursor.execute(query, (department_id, course_tag, course_name))
            course_id = self.cursor.fetchone()[0]
            self.connection.commit()
            logger.info(f"Created new course '{course_tag}: {course_name}' with ID {course_id}")
            return True
        except Error as e:
            logger.error(f"Error inserting course {course_tag}: {e}")
            self.connection.rollback()
            return False

    def insert_courses_batch(self, university_name: str, courses_data: Dict[str, List[Dict[str, str]]]) -> bool:
        """Insert multiple courses for a university in a batch."""
        try:
            # Get university ID first
            university_id = self.get_university_id(university_name)
            if university_id is None:
                logger.error(f"Cannot insert courses: University '{university_name}' not found")
                return False
            
            logger.info(f"Starting batch insert for university '{university_name}' (ID: {university_id})")
            total_departments = len(courses_data)
            total_courses = sum(len(courses) for courses in courses_data.values())
            logger.info(f"Found {total_departments} departments with {total_courses} total courses to process")
            
            departments_processed = 0
            courses_processed = 0
            courses_successful = 0
                
            for department_name, courses in courses_data.items():
                departments_processed += 1
                # First ensure department exists and get its ID
                department_id = self.insert_department(department_name, university_id)
                
                if department_id is None:
                    logger.error(f"Failed to get department ID for {department_name}")
                    continue
                
                # Then insert all courses for this department
                for course in courses:
                    courses_processed += 1
                    success = self.insert_course(
                        department_id,
                        course["courseTag"],
                        course["courseName"]
                    )
                    if success:
                        courses_successful += 1
            
            self.connection.commit()
            logger.info(f"Batch insert complete. Processed {departments_processed}/{total_departments} departments and {courses_successful}/{courses_processed} courses successfully")
            return True
        except Error as e:
            logger.error(f"Error inserting courses batch: {e}")
            self.connection.rollback()
            return False

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()