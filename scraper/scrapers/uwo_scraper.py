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


class UWOScraper(BaseScraper):
    BASE_URL = "https://www.westerncalendar.uwo.ca/Courses.cfm"
    
    def __init__(self, headless: bool = True):
        super().__init__(headless=headless)
        self.university_name = "University of Western Ontario"

    def getDepartmentLinks(self, departments) -> Dict[str, str]:
        departmentLinks = {}
        
        for department in departments:
            try:
                departmentName = department.text
                departmentLink = department.find_element(By.TAG_NAME, "a").get_attribute("href")
                departmentLinks[departmentName] = departmentLink
            except Exception as e:
                logger.error(f"Error getting department link: {e}")
                
        return departmentLinks
    
    def scrapeCourses(self, departmentName: str) -> None:
        try:
            courses = self.driver.find_elements(By.CSS_SELECTOR, "h4.courseTitleNoBlueLink")

            for course in courses:
                courseHeading = course.text
                pattern = rf"({departmentName}\s+\d{{4}}(?:[A-Z](?:\/[A-Z])*)?)\s+(.+)"
                match = re.search(pattern, courseHeading)
                if match:
                    courseTag = match.group(1)
                    courseName = match.group(2)
                    self.add_course(departmentName, courseTag, courseName)
                else:
                    logger.error(f"Failed to parse course: {courseHeading}")
        except Exception as e:
            logger.error(f"Error scraping courses for {departmentName}: {e}")
    
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            departments = self.driver.find_elements(By.CSS_SELECTOR, "td.sorting_1")

            # get links
            departmentLinks = self.getDepartmentLinks(departments)
            
            total = len(departmentLinks)
            for i, (name, link) in enumerate(departmentLinks.items(), 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    self.driver.get(link)
                    self.scrapeCourses(name)
                except Exception as e:
                    logger.error(f"Error processing department {name}: {e}")
                    continue
            
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
