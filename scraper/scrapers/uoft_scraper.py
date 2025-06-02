from typing import Dict, List, Tuple, Optional, Any
import time
import random
from .base_scraper import BaseScraper, logger

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class UofTScraper(BaseScraper):
    BASE_URL = "https://uoftindex.ca/directory"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=10)
        self.university_name = "University of Toronto"
        
    def get_department_options(self) -> List[Tuple[str, str]]:
        try:
            logger.info("Fetching departments...")
            
            # First, click the "Field of Study" dropdown to reveal department options
            field_of_study_button = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//span[contains(@class, 'v-btn__content') and contains(text(), 'Field of Study')]")
                )
            )
            field_of_study_button.click()
            time.sleep(2)
            
            department_elements = self.wait.until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, '.v-list-item.v-list-item--link')
                )
            )
            
            departments = []
            for element in department_elements:
                try:
                    title_element = element.find_element(By.CSS_SELECTOR, '.v-list-item__title.pr-2')
                    department_name = title_element.text.strip()
                    
                    if department_name:
                        departments.append((element, department_name))
                        
                except Exception as e:
                    logger.error(f"Failed to parse department: {e}")
                    continue
            
            logger.info(f"Found {len(departments)} departments")
            return departments
            
        except Exception as e:
            logger.error(f"Failed to get departments: {e}")
            return []

    def scrape_courses(self, course_elements: List) -> List[Dict[str, str]]:
        department_courses = []
        for course_container in course_elements:
            try:
                # Try multiple selectors for course code
                h3_element = None
                for selector in ['h3.courseTitle.courseCode', 'h3[class*="courseCode"]', 'h3']:
                    try:
                        h3_element = course_container.find_element(By.CSS_SELECTOR, selector)
                        break
                    except:
                        continue
                
                if not h3_element:
                    continue
                    
                course_code_text = h3_element.text.strip()
                course_tag = course_code_text.split()[0] if course_code_text else ""
                
                if not course_tag:
                    continue
                
                h4_element = None
                for selector in ['h4.courseTitle', 'h4[class*="courseTitle"]', 'h4']:
                    try:
                        h4_element = course_container.find_element(By.CSS_SELECTOR, selector)
                        break
                    except:
                        continue
                
                if not h4_element:
                    continue
                    
                course_name = h4_element.text.strip()
                
                if course_name:
                    department_courses.append({
                        "course_tag": course_tag,
                        "course_name": course_name
                    })
                    
            except Exception as e:
                logger.error(f"Failed to scrape course: {e}")
                continue
                
        return department_courses

    def scrape_department(self, department_element: Any, department_name: str, max_retries: int = 2) -> None:
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logger.info(f"Scraping {department_name}")
                
                # Click on the department to select it
                self.driver.execute_script("arguments[0].click();", department_element)
                time.sleep(1)  # Wait for selection
                
                # Click outside the dropdown to close it
                body = self.driver.find_element(By.TAG_NAME, "body")
                self.driver.execute_script("arguments[0].click();", body)
                time.sleep(2)
                
                all_courses = []
                page_number = 1
                
                while True:
                    # Try multiple selectors for course containers
                    course_elements = []
                    selectors = [
                        'div.col.hover.py-2.pl-0',
                        '.course-container', 
                        '.course-item',
                        'div[data-v-e58d897e]',
                        'div.col'
                    ]
                    
                    for selector in selectors:
                        try:
                            course_elements = self.wait.until(
                                EC.presence_of_all_elements_located((By.CSS_SELECTOR, selector))
                            )
                            if course_elements:
                                break
                        except TimeoutException:
                            continue
                    
                    if not course_elements:
                        break
                    
                    courses = self.scrape_courses(course_elements)
                    all_courses.extend(courses)
              
                    next_page = self.find_next_page()
                    if next_page:
                        self.driver.execute_script("arguments[0].click();", next_page)
                        time.sleep(2)
                        page_number += 1
                    else:
                        break
                
                if all_courses:
                    if department_name in self.department_courses:
                        self.department_courses[department_name].extend(all_courses)
                    else:
                        self.department_courses[department_name] = all_courses
                
                logger.info(f"Found {len(all_courses)} courses in {department_name}")
                break  # Successfully scraped this department
                
            except TimeoutException:
                retry_count += 1
                if retry_count >= max_retries:
                    logger.error(f"Failed to scrape {department_name} after {max_retries} retries")
                    break
                logger.warning(f"Timeout, retrying {department_name} ({retry_count}/{max_retries})")
                time.sleep(2)
            except Exception as e:
                logger.error(f"Failed to scrape {department_name}: {e}")
                break

    def find_next_page(self) -> Optional[Any]:
        try:
            # Try multiple pagination selectors
            selectors = [
                'button[aria-label="Next page"]:not([disabled]):not(.v-btn--disabled)',
                'button[aria-label*="next"]:not([disabled])',
                '.pagination .next:not([disabled])',
                'a[aria-label*="next"]:not([disabled])'
            ]
            
            for selector in selectors:
                try:
                    next_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if next_button and next_button.is_enabled():
                        return next_button
                except NoSuchElementException:
                    continue
            
            # Try XPath fallback
            try:
                next_button = self.driver.find_element(By.XPATH, '//button[@aria-label="Next page" and not(@disabled)]')
                if next_button and next_button.is_enabled():
                    return next_button
            except NoSuchElementException:
                pass
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to find next page: {e}")
            return None
    
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            departments = self.get_department_options()
            
            if not departments:
                logger.warning("No departments found")
                return {}
            
            previous_department_element = None
            
            for i, (department_element, department_name) in enumerate(departments, 1):
                try:
                    if previous_department_element is not None:
                        self.driver.execute_script("arguments[0].click();", previous_department_element)
                        time.sleep(1)
                    
                    self.scrape_department(department_element, department_name)
                    previous_department_element = department_element
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.error(f"Failed to process {department_name}: {e}")
                    continue
            
            total_courses = sum(len(courses) for courses in self.department_courses.values())
            logger.info(f"Completed: {len(self.department_courses)} departments, {total_courses} courses")
            return self.department_courses
            
        except Exception as e:
            logger.error(f"Failed to run scraper: {e}")
            return {} 