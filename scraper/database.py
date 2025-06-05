import psycopg2
from psycopg2 import Error
from typing import Dict, List, Optional, Tuple
from logger import setup_logger
import json
import os
import glob
from dotenv import load_dotenv
import concurrent.futures
from threading import Lock
from psycopg2.pool import ThreadedConnectionPool
from contextlib import contextmanager

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
            with logger.lock:
                raise ValueError("Missing required database configuration. Check your .env file for DB_NAME, DB_USER, and DB_PASSWORD")
        
        # Initialize connection pool with min=2 and max=20 connections
        self.pool = ThreadedConnectionPool(
            minconn=2,
            maxconn=20,
            dbname=self.dbname,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port
        )
        self.lock = Lock()  # Add thread lock for synchronization

    @contextmanager
    def get_db_cursor(self):
        """Context manager for getting a database connection and cursor"""
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Could not get database connection")
        
        cursor = conn.cursor()
        try:
            yield cursor, conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            self.return_connection(conn)

    def get_connection(self):
        """Get a connection from the pool"""
        try:
            return self.pool.getconn()
        except Exception as e:
            with logger.lock:
                logger.error(f"Error getting connection from pool: {e}")
            return None

    def return_connection(self, conn):
        """Return a connection to the pool"""
        self.pool.putconn(conn)

    def disconnect(self):
        """Close the connection pool"""
        if hasattr(self, 'pool'):
            self.pool.closeall()
            with logger.lock:
                logger.info("Connection pool closed")

    def get_university_id(self, university_name: str) -> Optional[str]:
        try:
            with self.get_db_cursor() as (cursor, _):
                query = """
                    SELECT university_id FROM universities 
                    WHERE university_name = %s
                """
                cursor.execute(query, (university_name,))
                result = cursor.fetchone()
                
                if result:
                    return result[0]
                else:
                    with logger.lock:
                        logger.error(f"University '{university_name}' not found in database")
                    return None
        except Error as e:
            with logger.lock:
                logger.error(f"Error getting university ID: {e}")
            return None

    def insert_department(self, department_name: str, university_id: str) -> Optional[str]:
        try:
            with self.get_db_cursor() as (cursor, _):
                # First check if the department already exists
                query = """
                    SELECT department_id FROM departments
                    WHERE department_name = %s AND university_id = %s
                """
                cursor.execute(query, (department_name, university_id))
                result = cursor.fetchone()
                
                if result:
                    # Department already exists, return the id
                    with logger.lock:
                        logger.info(f"Department '{department_name}' already exists with ID {result[0]}")
                    return result[0]
                
                # Department doesn't exist, insert and return the new id
                query = """
                    INSERT INTO departments (department_name, university_id)
                    VALUES (%s, %s)
                    RETURNING department_id
                """
                cursor.execute(query, (department_name, university_id))
                department_id = cursor.fetchone()[0]
                with logger.lock:
                    logger.info(f"Created new department '{department_name}' with ID {department_id}")
                return department_id
        except Error as e:
            with logger.lock:
                logger.error(f"Error inserting department: {e}")
            return None

    def insert_course(self, department_id: str, course_tag: str, course_name: str) -> bool:
        try:
            with self.get_db_cursor() as (cursor, _):
                # Check if course already exists
                query = """
                    SELECT course_id FROM courses 
                    WHERE department_id = %s AND course_tag = %s
                """
                cursor.execute(query, (department_id, course_tag))
                result = cursor.fetchone()
                
                if result:
                    with logger.lock:
                        logger.info(f"Course '{course_tag}' already exists with ID {result[0]}")
                    return True
                    
                # Insert new course
                query = """
                    INSERT INTO courses (department_id, course_tag, course_name)
                    VALUES (%s, %s, %s)
                    RETURNING course_id
                """
                cursor.execute(query, (department_id, course_tag, course_name))
                course_id = cursor.fetchone()[0]
                with logger.lock:
                    logger.info(f"Created new course '{course_tag}: {course_name}' with ID {course_id}")
                return True
        except Error as e:
            with logger.lock:
                logger.error(f"Error inserting course {course_tag}: {e}")
            return False

    def process_department_courses(self, args: Tuple[str, str, List[Dict[str, str]]]) -> Tuple[int, int]:
        """Process courses for a single department"""
        department_name, university_id, courses = args
        courses_processed = 0
        courses_successful = 0
        
        try:
            department_id = self.insert_department(department_name, university_id)
            if department_id is None:
                with logger.lock:
                    logger.error(f"Failed to get department ID for {department_name}")
                return courses_processed, courses_successful

            for course in courses:
                courses_processed += 1
                success = self.insert_course(
                    department_id,
                    course["course_tag"],
                    course["course_name"]
                )
                if success:
                    courses_successful += 1
            
            return courses_processed, courses_successful
        except Exception as e:
            with logger.lock:
                logger.error(f"Error processing department {department_name}: {e}")
            return courses_processed, courses_successful

    def insert_courses_batch(self, university_name: str, courses_data: Dict[str, List[Dict[str, str]]]) -> bool:
        """Insert multiple courses for a university in a batch using parallel processing."""
        try:
            # Get university ID first
            university_id = self.get_university_id(university_name)
            if university_id is None:
                with logger.lock:
                    logger.error(f"Cannot insert courses: University '{university_name}' not found")
                return False
            
            total_departments = len(courses_data)
            total_courses = sum(len(courses) for courses in courses_data.values())
            with logger.lock:
                logger.info(f"Starting parallel batch insert for university '{university_name}' (ID: {university_id})")
                logger.info(f"Found {total_departments} departments with {total_courses} total courses to process")
            
            # Prepare arguments for parallel processing
            process_args = [(department_name, university_id, courses) 
                          for department_name, courses in courses_data.items()]
            
            courses_processed = 0
            courses_successful = 0
            
            # Process departments in parallel, limiting workers to avoid connection pool exhaustion
            max_workers = min(5, total_departments)  # Limit to 5 concurrent workers
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [executor.submit(self.process_department_courses, args) for args in process_args]
                
                for future in concurrent.futures.as_completed(futures):
                    processed, successful = future.result()
                    courses_processed += processed
                    courses_successful += successful
            
            with logger.lock:
                logger.info(f"Parallel batch insert complete. Processed {total_departments} departments and {courses_successful}/{courses_processed} courses successfully")
            return True
        except Error as e:
            with logger.lock:
                logger.error(f"Error in parallel batch insert: {e}")
            return False

    def process_json_file(self, json_file: str) -> bool:
        """Process a single JSON file"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            university_name = json_data.get("university_name")
            departments = json_data.get("departments")
            
            if not university_name or not departments:
                with logger.lock:
                    logger.error(f"Invalid JSON format in {json_file}. Missing university_name or departments.")
                return False
            
            with logger.lock:
                logger.info(f"Processing {university_name} from {json_file}")
            
            if self.insert_courses_batch(university_name, departments):
                with logger.lock:
                    logger.info(f"Successfully imported data for {university_name}")
                return True
            else:
                with logger.lock:
                    logger.error(f"Failed to import data for {university_name}")
                return False
                
        except (json.JSONDecodeError, FileNotFoundError) as e:
            with logger.lock:
                logger.error(f"Error reading JSON file {json_file}: {e}")
            return False

    def load_and_insert_from_json(self) -> bool:
        try:
            # Always use the scraper's directory as base path
            base_dir = os.path.dirname(os.path.abspath(__file__))
            json_dir = os.path.join(base_dir, "scraped_data")
            
            json_pattern = os.path.join(json_dir, "*.json")
            json_files = glob.glob(json_pattern)
            
            if not json_files:
                with logger.lock:
                    logger.error(f"No JSON files found in directory: {json_dir}")
                return False
                
            with logger.lock:
                logger.info(f"Found {len(json_files)} JSON files to process")
            
            # Process JSON files sequentially to avoid connection pool exhaustion
            successful_imports = 0
            for json_file in json_files:
                if self.process_json_file(json_file):
                    successful_imports += 1
            
            with logger.lock:
                logger.info(f"JSON import complete. Successfully imported {successful_imports}/{len(json_files)} files")
            return successful_imports > 0
            
        except Exception as e:
            with logger.lock:
                logger.error(f"Error in load_and_insert_from_json: {e}")
            return False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()