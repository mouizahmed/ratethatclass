from typing import Dict, List, Tuple, Optional, Any
import time
import random
from .base_scraper import BaseScraper, logger

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


class UofTScraper(BaseScraper):
    BASE_URL = "https://uoftindex.ca/directory"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=10)
        self.university_name = "University of Toronto"
        
    def getDepartmentOptions(self) -> List[Tuple[str, str]]:
        try:
            logger.info("Getting department options...")
            
            # First, click the "Field of Study" dropdown to reveal department options
            try:
                field_of_study_button = self.wait.until(
                    EC.element_to_be_clickable(
                        (By.XPATH, "//span[contains(@class, 'v-btn__content') and contains(text(), 'Field of Study')]")
                    )
                )
                field_of_study_button.click()
                logger.info("Clicked Field of Study dropdown")
                time.sleep(2)
            except Exception as e:
                logger.error(f"Error clicking Field of Study dropdown: {e}")
                return []
            
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
                        # Store the clickable list item element
                        departments.append((element, department_name))
                        
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
                    logger.debug("Skipping course: No h3 course code element found")
                    continue
                    
                course_code_text = h3_element.text.strip()
                
                course_tag = course_code_text.split()[0] if course_code_text else ""
                
                if not course_tag:
                    logger.debug(f"Skipping course: Empty course tag from text: '{course_code_text}'")
                    continue
                
                h4_element = None
                for selector in ['h4.courseTitle', 'h4[class*="courseTitle"]', 'h4']:
                    try:
                        h4_element = course_container.find_element(By.CSS_SELECTOR, selector)
                        break
                    except:
                        continue
                
                if not h4_element:
                    logger.debug(f"Skipping course {course_tag}: No h4 course name element found")
                    continue
                    
                course_name = h4_element.text.strip()
                
                if course_name:
                    department_courses.append({
                        "courseTag": course_tag,
                        "courseName": course_name
                    })
                else:
                    logger.debug(f"Skipping course {course_tag}: Empty course name")
                    
            except Exception as e:
                logger.debug(f"Error scraping course: {e}")
                continue
                
        return department_courses

    def scrapeDepartment(self, department_element: Any, department_name: str, max_retries: int = 2) -> None:
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logger.info(f"Scraping department: {department_name}")
                
                # Click on the department to select it
                self.driver.execute_script("arguments[0].click();", department_element)
                time.sleep(1)  # Wait for selection
                
                # Click outside the dropdown to close it
                try:
                    # Click on the main content area to close dropdown
                    body = self.driver.find_element(By.TAG_NAME, "body")
                    self.driver.execute_script("arguments[0].click();", body)
                    time.sleep(2)
                except Exception as e:
                    logger.warning(f"Could not close dropdown: {e}")
                
                all_courses = []
                page_number = 1
                
                while True:
                    logger.info(f"Scraping page {page_number} for department: {department_name}")
                    
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
                                logger.info(f"Found {len(course_elements)} course elements with: {selector}")
                                break
                        except TimeoutException:
                            continue
                    
                    if not course_elements:
                        logger.warning(f"No courses found on page {page_number} for {department_name}")
                        break
                    
                    page_courses = self.scrapeCourses(course_elements)
                    all_courses.extend(page_courses)
                    logger.info(f"Found {len(page_courses)} courses on page {page_number}")
              
                    next_page_button = self.findNextPage()
                    if next_page_button:
                        logger.info(f"Found next page button, navigating to page {page_number + 1}")
                        try:
                            self.driver.execute_script("arguments[0].click();", next_page_button)
                            time.sleep(2)
                            page_number += 1
                        except Exception as e:
                            logger.error(f"Error clicking next page button: {e}")
                            break
                    else:
                        logger.info(f"No more pages found for department {department_name}")
                        break
                
                if all_courses:
                    if department_name in self.department_courses:
                        self.department_courses[department_name].extend(all_courses)
                    else:
                        self.department_courses[department_name] = all_courses
                
                logger.info(f"Found total of {len(all_courses)} courses across {page_number} page(s) for {department_name}")
                break  # Successfully scraped this department
                
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
            previous_department_element = None
            
            for i, (department_element, department_name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {department_name} ({i}/{total})")
                    
                    # If there was a previously selected department, unselect it first
                    if previous_department_element is not None:
                        try:
                            logger.info("Unselecting previous department")
                            self.driver.execute_script("arguments[0].click();", previous_department_element)
                            time.sleep(1)
                        except Exception as e:
                            logger.warning(f"Could not unselect previous department: {e}")
                    
                    self.scrapeDepartment(department_element, department_name)
                    
                    # Store this department as the previous one for next iteration
                    previous_department_element = department_element
                    
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.error(f"Error scraping department {department_name}: {e}")
                    continue
            
            total_courses = sum(len(courses) for courses in self.department_courses.values())
            logger.info(f"Scraping completed. Found {len(self.department_courses)} departments with {total_courses} total courses")
            return self.department_courses
            
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {} 