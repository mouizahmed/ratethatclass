import logging
from web_crawler import main as run_scrapers
from database import DatabaseManager
import os
from dotenv import load_dotenv

# Import centralized logger
from logger import setup_logger

# Get configured logger
logger = setup_logger(__name__)

def load_database_config():
    """Load database configuration from environment variables."""
    load_dotenv()
    return {
        'dbname': os.getenv('DB_NAME', 'postgres'),
        'user': os.getenv('DB_USER', 'postgres.jtfoxsubzgztlqsjpuqr'),
        'password': os.getenv('DB_PASSWORD', '***REMOVED***'),
        'host': os.getenv('DB_HOST', 'aws-0-us-west-1.pooler.supabase.com'),
        'port': os.getenv('DB_PORT', '6543')
    }

def store_scraped_data(db_manager: DatabaseManager, scraped_data: dict):
    """Store scraped data in the database."""
    for university_name, courses_data in scraped_data.items():
        # Insert courses
        db_manager.insert_courses_batch(university_name, courses_data)
        
        logger.info(f"Successfully stored data for {university_name}")

def main():
    try:
        # Load database configuration
        db_config = load_database_config()
        
        # Run scrapers to get course data
        logger.info("Starting web scrapers...")
        scraped_data = run_scrapers()
        
        if not scraped_data:
            logger.error("No data was scraped")
            return
        
        # Store data in database
        logger.info("Storing scraped data in database...")
        with DatabaseManager(**db_config) as db:
            store_scraped_data(db, scraped_data)
        
        logger.info("Data scraping and storage completed successfully")
        
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise

if __name__ == "__main__":
    main() 