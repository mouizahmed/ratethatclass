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


class OttawaUScraper(BaseScraper):
    BASE_URL = "https://catalogue.uottawa.ca/en/courses"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=5)
        self.university_name = "University of Ottawa"
        self.session = requests.Session()
    
    def get_department_options(self) -> List[Tuple[str, str]]:
        try:
            response = self.session.get(self.BASE_URL)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find links inside li elements that match the department pattern
            department_links = soup.find_all('a', href=lambda href: href and '/en/courses/' in href)
            
            result = []
            for link in department_links:
                href = link.get('href')
                name = link.text.strip()
                
                # Extract the department code from the URL - format is "/en/courses/lcm/"
                match = re.search(r'/en/courses/([^/]+)/', href)
                if match:
                    dept_code = match.group(1)
                    result.append((dept_code, name))
                
            return result
        except Exception as e:
            logger.error(f"Error getting department options: {e}")
            return []

    def scrape_department(self, department_code: str) -> None:
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                url = f"{self.BASE_URL}/{department_code}/"
                logger.info(f"Requesting URL: {url}")
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                response = self.session.get(url, headers=headers, timeout=10)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all course blocks based on the provided HTML structure
                course_blocks = soup.find_all('div', class_='courseblock')
                
                for block in course_blocks:
                    try:
                        # Find the course title element
                        title_element = block.find('p', class_='courseblocktitle')
                        
                        if title_element:
                            # Extract the full title text
                            full_text = title_element.text.strip()
                            
                            # Pattern to extract course code (e.g., "CPT 5100") and name
                            pattern = r'([A-Z]{2,4}\s\d{4})\s+(.*?)(?:\(\d+\s+units\))?$'
                            match = re.search(pattern, full_text)
                            
                            if match:
                                course_tag = match.group(1)
                                course_name = match.group(2).strip()
                                
                                if course_name and course_tag:
                                    self.add_course(department_code, course_tag, course_name)
                    except Exception as e:
                        logger.error(f"Error parsing course: {e}")
                        continue
                
            except TimeoutException:
                if attempt < max_retries - 1:
                    logger.warning(f"Timeout on attempt {attempt + 1} for department {department_code}, retrying...")
                    time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    logger.error(f"Timeout waiting for courses to load for department {department_code} after {max_retries} attempts")
            except Exception as e:
                logger.error(f"Error scraping department {department_code}: {e}")
            finally:
                try:
                    # Navigate back to the subject selection page
                    self.session.get(self.BASE_URL)
                    
                    # Wait for the Subject link to be present and clickable
                    subject_link = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Subject')]"))
                    )
                    
                    # Click the Subject link
                    subject_link.click()
                    
                    # Wait for the subject select element to be present
                    self.wait.until(
                        EC.presence_of_element_located((By.ID, "subjectSelect"))
                    )
                except Exception as e:
                    logger.error(f"Error navigating back to subject page: {e}")

    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            departments = self.get_department_options()
            logger.info(f"Found {len(departments)} departments")
            print(departments)
            
            total = len(departments)
            successful_departments = 0
            for i, (value, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    initial_course_count = len(self.department_courses.get(value, []))
                    self.scrape_department(value)
                    
                    # Check if any courses were added for this department
                    new_course_count = len(self.department_courses.get(value, []))
                    if new_course_count == 0 or new_course_count == initial_course_count:
                        logger.warning(f"No courses found for department {name} ({value})")
                    else:
                        successful_departments += 1
                        logger.info(f"Found {new_course_count} courses for department {name}")
                    
                    # Add a small delay between departments to avoid overwhelming the server
                    time.sleep(0.5)
                    
                except Exception as e:
                    logger.error(f"Error scraping department {name}: {e}")
                    continue
            
            logger.info(f"Successfully scraped {successful_departments}/{total} departments")
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
        