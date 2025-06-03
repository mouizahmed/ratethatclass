import psycopg2
from psycopg2 import Error
from typing import Dict, List, Optional
from logger import setup_logger
import json
import os
import glob
from dotenv import load_dotenv

logger = setup_logger(__name__)

class DatabaseManager:
    def __init__(self):
        load_dotenv()
        
        self.dbname = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        
        if not all([self.dbname, self.user, self.password]):
            raise ValueError("Missing required database configuration. Check your .env file for DB_NAME, DB_USER, and DB_PASSWORD")
            
        self.connection = None
        self.cursor = None

    def connect(self) -> bool:
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
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

    def get_university_id(self, university_name: str) -> Optional[str]:
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

    def insert_department(self, department_name: str, university_id: str) -> Optional[str]:
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
                        course["course_tag"],
                        course["course_name"]
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

    def load_and_insert_from_json(self) -> bool:
        try:
            # Always use the scraper's directory as base path
            base_dir = os.path.dirname(os.path.abspath(__file__))
            json_dir = os.path.join(base_dir, "scraped_data")
            
            json_pattern = os.path.join(json_dir, "*.json")
            json_files = glob.glob(json_pattern)
            
            if not json_files:
                logger.error(f"No JSON files found in directory: {json_dir}")
                return False
                
            logger.info(f"Found {len(json_files)} JSON files to process")
            successful_imports = 0
            
            for json_file in json_files:
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        json_data = json.load(f)
                    
                    university_name = json_data.get("university_name")
                    departments = json_data.get("departments")
                    
                    if not university_name or not departments:
                        logger.error(f"Invalid JSON format in {json_file}. Missing university_name or departments.")
                        continue
                    
                    logger.info(f"Processing {university_name} from {json_file}")
                    
                    if self.insert_courses_batch(university_name, departments):
                        successful_imports += 1
                        logger.info(f"Successfully imported data for {university_name}")
                    else:
                        logger.error(f"Failed to import data for {university_name}")
                        
                except (json.JSONDecodeError, FileNotFoundError) as e:
                    logger.error(f"Error reading JSON file {json_file}: {e}")
                    continue
            
            logger.info(f"JSON import complete. Successfully imported {successful_imports}/{len(json_files)} files")
            return successful_imports > 0
            
        except Exception as e:
            logger.error(f"Error in load_and_insert_from_json: {e}")
            return False

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()