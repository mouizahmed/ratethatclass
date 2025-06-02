from typing import Dict, List, Tuple, Optional, Any
import time
import random
import re
from .base_scraper import BaseScraper, logger

# Additional imports based on what each scraper needs
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    pass

try:
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    pass


class TMUScraper(BaseScraper):
    BASE_URL = "https://www.torontomu.ca/calendar/2024-2025/courses/"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless)
        self.university_name = "Toronto Metropolitan University"
        
    def get_department_links(self, departments) -> Dict[str, str]:
        department_links = {}
        
        for department in departments:
            try:
                department_name = department.text
                department_link = department.find_element(By.TAG_NAME, "a").get_attribute("href")
                department_links[department_name] = department_link
            except Exception as e:
                logger.error(f"Error getting department link: {e}")
                
        return department_links
            
    def scrape_courses(self, department_name: str) -> None:
        try:
            courses = self.driver.find_elements(By.CSS_SELECTOR, "a.courseCode")
            for course in courses:
                course_text = course.text
                if ' - ' in course_text:
                    course_parts = course_text.split(' - ', 1)
                    course_tag = course_parts[0]
                    course_name = course_parts[1]
                    self.add_course(department_name, course_tag, course_name)
        except Exception as e:
            logger.error(f"Error scraping courses for {department_name}: {e}")
    
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            departments = self.driver.find_elements(By.CSS_SELECTOR, "td.sorting_1")

            # get links
            department_links = self.get_department_links(departments)

            total = len(department_links)
            for i, (name, link) in enumerate(department_links.items(), 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    self.driver.get(link)
                    self.scrape_courses(name)
                except Exception as e:
                    logger.error(f"Error processing department {name}: {e}")
                    continue
                
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
