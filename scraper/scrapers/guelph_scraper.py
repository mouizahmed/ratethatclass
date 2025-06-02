from typing import Dict, List, Tuple, Optional, Any
import time
import random
from .base_scraper import BaseScraper, logger

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class GuelphScraper(BaseScraper):
    BASE_URL = "https://colleague-ss.uoguelph.ca/Student/Courses"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=10)
        self.university_name = "University of Guelph"
        
    def get_department_options(self) -> List[Tuple[str, str]]:
        try:
            logger.info("Getting department options...")
            
            # Wait for department links to load
            department_elements = self.wait.until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, 'a.esg-list-group__item[id^="catalog-subject-"]')
                )
            )
            
            departments = []
            for element in department_elements:
                try:
                    href = element.get_attribute('href')
                    department_name = element.get_attribute('title') or element.text.strip()
                    
                    if href and department_name:
                        departments.append((href, department_name))
                        
                except Exception as e:
                    logger.error(f"Error parsing department element: {e}")
                    continue
            
            logger.info(f"Found {len(departments)} departments")
            return departments
            
        except Exception as e:
            logger.error(f"Error getting department options: {e}")
            return []

    def scrape_courses(self, course_elements: List) -> List[Dict[str, str]]:
        department_courses = []
        for course in course_elements:
            try:
                span_element = course.find_element(By.TAG_NAME, "span")
                if span_element:
                    course_text = span_element.text.strip()
                    
                    # Remove credits part if it exists (text in parentheses at the end)
                    if ' (' in course_text and course_text.endswith(')'):
                        course_info = course_text.rsplit(' (', 1)[0]
                    else:
                        course_info = course_text
                    
                    # Split to get course tag and course name
                    parts = course_info.split(' ', 1)
                    if len(parts) >= 2:
                        course_tag = parts[0].strip()
                        course_name = parts[1].strip()
                        
                        department_courses.append({
                            "course_tag": course_tag,
                            "course_name": course_name
                        })
                        
            except Exception as e:
                logger.error(f"Error scraping course: {e}")
        return department_courses

    def find_next_page(self) -> Optional[Any]:
        try:
            # Look for the next page button directly
            next_button = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[id='course-results-next-page'], .next-page, [aria-label='Next page']"))
            )
            
            # Check if button is enabled and clickable
            if next_button and not next_button.get_attribute('disabled'):
                return next_button
            return None
            
        except TimeoutException:
            return None
        except Exception as e:
            logger.error(f"Error finding next page: {e}")
            return None

    def scrape_department(self, department_link: str, department_name: str, max_retries: int = 2) -> None:
        retry_count = 0
        page_number = 1
        
        while retry_count < max_retries:
            try:
                logger.info(f"Scraping department: {department_name} - Page {page_number}")
                
                # Navigate to department page only on first page
                if page_number == 1:
                    logger.info(f"Navigating to: {department_link}")
                    self.driver.get(department_link)
                    time.sleep(2)
                
                # Wait for course elements
                course_elements = self.wait.until(
                    EC.presence_of_all_elements_located(
                        (By.CSS_SELECTOR, 'h3 span[id^="course-"]')
                    )
                )
                
                if not course_elements:
                    logger.warning(f"No courses found for {department_name} on page {page_number}")
                    break
                
                h3_elements = [elem.find_element(By.XPATH, './..') for elem in course_elements]
                courses = self.scrape_courses(h3_elements)
                
                if courses:
                    if department_name in self.department_courses:
                        self.department_courses[department_name].extend(courses)
                    else:
                        self.department_courses[department_name] = courses
                
                logger.info(f"Found {len(courses)} courses on page {page_number} for {department_name}")

                # Try to find and click next page
                next_page = self.find_next_page()
                if not next_page:
                    break

                self.driver.execute_script("arguments[0].click();", next_page)
                page_number += 1
                time.sleep(2)
                
            except TimeoutException:
                retry_count += 1
                if retry_count >= max_retries:
                    logger.warning(f"Max retries reached when scraping department {department_name}")
                    break
                logger.warning(f"Timeout occurred, retrying... ({retry_count}/{max_retries})")
                time.sleep(2)
            except Exception as e:
                logger.error(f"Error in scrape_department for {department_name}: {e}")
                break

    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            
            departments = self.get_department_options()
            
            if not departments:
                logger.warning("No departments found")
                return {}
            
            total = len(departments)
            for i, (link, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    self.scrape_department(link, name)
                    
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.error(f"Error scraping department {name}: {e}")
                    continue
            
            logger.info(f"Scraping completed. Found {len(self.department_courses)} departments")
            return self.department_courses
            
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
