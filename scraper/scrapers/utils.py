import json
import os
import time
import traceback
from typing import Dict, List, Any
from .base_scraper import logger
from unidecode import unidecode

def save_to_json(university_name: str, departments: Dict[str, List[Dict[str, str]]], scraper_name: str) -> None:
    """Save scraped data to a JSON file."""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        scraper_dir = os.path.dirname(current_dir)
        data_dir = os.path.join(scraper_dir, "scraped_data")
        
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        safe_university_name = "".join(c for c in university_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_university_name = safe_university_name.replace(' ', '_')
        filename = f"{safe_university_name}_data.json"
        filepath = os.path.join(data_dir, filename)
        
        data = {
            "university_name": university_name,
            "scraper_used": scraper_name,
            "scrape_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_departments": len(departments),
            "total_courses": sum(len(courses) for courses in departments.values()),
            "departments": departments
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Data saved to {filepath}")
        logger.info(f"Saved {data['total_departments']} departments with {data['total_courses']} total courses")
        
    except Exception as e:
        logger.error(f"Error saving data to JSON: {e}")

def run_scraper(scraper_class: Any, headless: bool = True) -> tuple[str | None, Dict[str, List[Dict[str, str]]]]:
    """Run a single scraper and return the results."""
    scraper_name = scraper_class.__name__
    logger.info(f"Starting {scraper_name}")
    
    try:
        with scraper_class(headless=headless) as scraper:
            departments = scraper.run()
            university_name = scraper.university_name
            logger.info(f"Successfully scraped {len(departments)} departments with {scraper_name}")
            
            save_to_json(university_name, departments, scraper_name)
            
            return university_name, departments
    except Exception as e:
        logger.error(f"Error running {scraper_name}: {e}")
        logger.error(traceback.format_exc())
        return None, {}

def clean_text(text: str) -> str:
    # Convert accented characters to their ASCII equivalents
    cleaned_text = unidecode(text)
    # Normalize spaces
    cleaned_text = ' '.join(cleaned_text.split())
    return cleaned_text.strip() 