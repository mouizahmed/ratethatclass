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


class GuelphScraper(BaseScraper):
    BASE_URL = "https://colleague-ss.uoguelph.ca/Student/Courses"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=10)
        self.university_name = "University of Guelph"
        
    def getDepartmentOptions(self) -> List[Tuple[str, str]]:
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

    def scrapeCourses(self, course_elements: List) -> List[Dict[str, str]]:
        department_courses = []
        for course in course_elements:
            try:
                span_element = course.find_element(By.TAG_NAME, "span")
                if span_element:
                    course_text = span_element.text.strip()
                    
                    if ' (' in course_text and course_text.endswith(')'):
                        course_info, credits_part = course_text.rsplit(' (', 1)
                        credits = credits_part.rstrip(')')
                        
                        parts = course_info.split(' ', 1)
                        if len(parts) >= 2:
                            course_tag = parts[0].strip()
                            course_name = parts[1].strip()
                            
                            department_courses.append({
                                "courseTag": course_tag,
                                "courseName": course_name,
                                "credits": credits
                            })
                        
            except Exception as e:
                logger.error(f"Error scraping course: {e}")
        return department_courses

    def scrapeDepartment(self, department_link: str, department_name: str, max_retries: int = 2) -> None:
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logger.info(f"Scraping department: {department_name}")
                
                course_elements = self.wait.until(
                    EC.presence_of_all_elements_located(
                        (By.CSS_SELECTOR, 'h3 span[id^="course-"]')
                    )
                )
                
                if not course_elements:
                    logger.warning(f"No courses found for {department_name}")
                    break
                
                h3_elements = [elem.find_element(By.XPATH, './..') for elem in course_elements]
                courses = self.scrapeCourses(h3_elements)
                
                if courses:
                    if department_name in self.department_courses:
                        self.department_courses[department_name].extend(courses)
                    else:
                        self.department_courses[department_name] = courses
                
                logger.info(f"Found {len(courses)} courses on current page for {department_name}")

                next_page = self.findNextPage()
                if not next_page:
                    break

                self.driver.execute_script("arguments[0].click();", next_page)
                time.sleep(2)
                
            except TimeoutException:
                retry_count += 1
                if retry_count >= max_retries:
                    logger.warning(f"Max retries reached when scraping department {department_name}")
                    break
                logger.warning(f"Timeout occurred, retrying... ({retry_count}/{max_retries})")
                time.sleep(2)
            except Exception as e:
                logger.error(f"Error in scrapeDepartment for {department_name}: {e}")
                break

    def findNextPage(self) -> Optional[Any]:
        try:
            # Check if pagination exists
            total_pages_element = self.driver.find_element(By.ID, "course-results-total-pages")
            current_page_element = self.driver.find_element(By.ID, "course-results-current-page")
            
            if total_pages_element and current_page_element:
                total_pages = int(total_pages_element.text.strip())
                current_page = int(current_page_element.get_attribute('value') or '1')
                
                logger.info(f"Pagination: Page {current_page} of {total_pages}")
                
                if current_page < total_pages:
                    # Find the next page button
                    next_button = self.driver.find_element(By.ID, "course-results-next-page")
                    
                    # Check if button is enabled (not disabled)
                    if not next_button.get_attribute('disabled'):
                        return next_button
                        
            return None
            
        except (NoSuchElementException, ValueError, TimeoutException):
            return None
        except Exception as e:
            logger.error(f"Error finding next page: {e}")
            return None
    
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            
            departments = self.getDepartmentOptions()
            
            if not departments:
                logger.warning("No departments found")
                return {}
            
            total = len(departments)
            for i, (link, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    logger.info(f"Navigating to: {link}")
                    self.driver.get(link)
                    
                    time.sleep(2)
                    
                    self.scrapeDepartment(link, name)
                    
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.error(f"Error scraping department {name}: {e}")
                    continue
            
            logger.info(f"Scraping completed. Found {len(self.department_courses)} departments")
            return self.department_courses
            
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
