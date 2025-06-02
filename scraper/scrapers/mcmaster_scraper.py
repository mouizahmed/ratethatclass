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


class McMasterScraper(BaseScraper):
    BASE_URL = "https://academiccalendars.romcmaster.ca/content.php?catoid=53&navoid=10775"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=5)
        self.university_name = "McMaster University"
        
    def get_department_options(self) -> List[Tuple[str, str]]:
        try:
            checkbox = self.driver.find_element(By.ID, "exact_match")
            checkbox.click()

            select_department = Select(self.driver.find_element(By.ID, "courseprefix"))
            return [(option.get_attribute('value'), option.text)
                    for option in select_department.options[1:]]
        except Exception as e:
            logger.error(f"Error getting department options: {e}")
            return []

    def scrape_courses(self, course_elements: List) -> List[Dict[str, str]]:
        department_courses = []
        for course in course_elements:
            try:
                course_parts = course.text.split(' - ')
                if len(course_parts) >= 2:
                    course_tag = course_parts[0].strip()
                    course_name = course_parts[1].strip()
                    department_courses.append({
                        "course_tag": course_tag,
                        "course_name": course_name
                    })
            except Exception as e:
                logger.error(f"Error scraping course: {e}")
        return department_courses

    def scrape_department(self, max_retries: int = 2) -> None:
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                course_elements = self.wait.until(
                    EC.presence_of_all_elements_located(
                        (By.CSS_SELECTOR, 'a[onclick*="showCourse"]')
                    )
                )
                
                if not course_elements:
                    break
                
                courses = self.scrape_courses(course_elements)
                
                if courses:
                    current_dept = self.driver.find_element(By.ID, "courseprefix").get_attribute("value")
                    if current_dept in self.department_courses:
                        self.department_courses[current_dept].extend(courses)
                    else:
                        self.department_courses[current_dept] = courses

                next_page_element = self.find_next_page()
                if not next_page_element:
                    break

                self.driver.execute_script("arguments[0].click();", next_page_element)
                time.sleep(0.5)
                
            except TimeoutException:
                retry_count += 1
                if retry_count >= max_retries:
                    logger.warning(f"Max retries reached when scraping department")
                    break
                self.driver.refresh()
            except Exception as e:
                logger.error(f"Error in scrape_department: {e}")
                break

    def find_next_page(self) -> Optional[Any]:
        try:
            current_page_element = self.driver.find_element(
                By.XPATH, '//td[contains(., "Page:")]//span[@aria-current="page"]//strong'
            )
            
            next_page = int(current_page_element.text) + 1
            
            next_page_link = self.driver.find_element(
                By.XPATH, f'//td[contains(., "Page:")]//a[text()="{next_page}"]'
            )
           
            return next_page_link if next_page_link else None
        except (NoSuchElementException, TimeoutException):
            return None
        except Exception as e:
            logger.error(f"Error finding next page: {e}")
            return None
    
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            departments = self.get_department_options()
            
            total = len(departments)
            for i, (value, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    script = f"""
                        document.getElementById('courseprefix').value = '{value}';
                        document.getElementById('search-with-filters').click();
                    """
                    self.driver.execute_script(script)
                    
                    self.scrape_department()
                    
                except Exception as e:
                    logger.error(f"Error scraping department {name}: {e}")
                    continue
            
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
