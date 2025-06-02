from typing import Dict, List
import re
from .base_scraper import BaseScraper, logger

from selenium.webdriver.common.by import By

class UWOScraper(BaseScraper):
    BASE_URL = "https://www.westerncalendar.uwo.ca/Courses.cfm"
    
    def __init__(self, headless: bool = True):
        super().__init__(headless=headless)
        self.university_name = "University of Western"

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
            courses = self.driver.find_elements(By.CSS_SELECTOR, "h4.courseTitleNoBlueLink")

            for course in courses:
                course_heading = course.text
                pattern = rf"({department_name}\s+\d{{4}}(?:[A-Z](?:\/[A-Z])*)?)\s+(.+)"
                match = re.search(pattern, course_heading)
                if match:
                    course_tag = match.group(1)
                    course_name = match.group(2)
                    self.add_course(department_name, course_tag, course_name)
                else:
                    logger.error(f"Failed to parse course: {course_heading}")
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
                    
                    courses_count = len(self.department_courses.get(name, []))
                    logger.info(f"Scraped {courses_count} courses for {name}")
                    
                except Exception as e:
                    logger.error(f"Error processing department {name}: {e}")
                    continue
            
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
