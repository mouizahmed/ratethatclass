import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple
import time
from .base_scraper import BaseScraper, logger

class CarletonUScraper(BaseScraper):
    BASE_URL = "https://calendar.carleton.ca/undergrad/courses/"
    
    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=5)
        self.soup = None
        self.university_name = "Carleton University"
        self.session = requests.Session()
    
    def setup_driver(self):
        """Override to use requests instead of Selenium for this scraper."""
        pass
        
    def cleanup(self):
        """Override to skip Selenium cleanup."""
        pass

    def getDepartmentOptions(self) -> List[Tuple[str, str]]:
        try:
            response = self.session.get(self.BASE_URL)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            department_div = soup.find('div', {'id': 'textcontainer'})
            if not department_div:
                logger.error("Department div element not found")
                return []
            
            department_links = department_div.find_all('a')
            
            filtered_links = [link for link in department_links if link.get('href') and "central.carleton.ca" not in link.get('href')]
            
            result = []
            for link in filtered_links:
                href = link.get('href')
                name = link.text.strip().replace(')', '')
                
                # Clean up the href - remove /undergrad/courses/ prefix if it exists
                if href.startswith('/undergrad/courses/'):
                    href = href[len('/undergrad/courses/'):]
                
                result.append((href, name))
                
            return result
        except Exception as e:
            logger.error(f"Error getting department options: {e}")
            return []
    
    def scrapeDepartment(self, department_code: str) -> None:
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                # Ensure department_code doesn't start with a slash
                if department_code.startswith('/'):
                    department_code = department_code[1:]
                
                url = f"{self.BASE_URL}{department_code}"
                logger.info(f"Requesting URL: {url} (Attempt {attempt+1}/{max_retries})")
                
                # Add a user agent to look more like a browser
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                response = self.session.get(url, headers=headers, timeout=10)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all course blocks
                course_blocks = soup.find_all('div', class_='courseblock')
                
                for block in course_blocks:
                    try:
                        tag_span = block.find('span', class_='courseblockcode')
                        title_span = block.find('span', class_='courseblocktitle')
                        
                        if tag_span and title_span:
                            course_tag = tag_span.text.strip()
                            
                            br_tag = title_span.find('br')
                            course_name = ""
                            
                            if br_tag and br_tag.next_sibling:
                                course_name = br_tag.next_sibling.strip()
                            
                            if course_name and course_tag:
                                self.add_course(department_code, course_tag, course_name)
                            else:
                                logger.warning(f"Skipping course: couldn't extract name from {title_span.text}")
                        else:
                            logger.warning(f"Missing code or title for course in block: {block.text}")
                    except Exception as e:
                        logger.error(f"Error parsing course: {e}")
                        continue
                
                # If we got here without an exception, we're done
                return
                    
            except (requests.ConnectionError, requests.Timeout) as e:
                logger.warning(f"Connection error on attempt {attempt+1}: {e}")
                if attempt < max_retries - 1:
                    # Exponential backoff
                    sleep_time = retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                else:
                    logger.error(f"Failed to scrape department {department_code} after {max_retries} attempts: {e}")
            except Exception as e:
                logger.error(f"Error scraping department {department_code}: {e}")
                return

    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            departments = self.getDepartmentOptions()
            logger.info(f"Found {len(departments)} departments")
            
            total = len(departments)
            successful_departments = 0
            for i, (value, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    # Fix malformed URLs - ensure proper path format
                    if "//" in value:
                        logger.warning(f"Fixing malformed URL for department {name}: {value}")
                        value = value.replace("//undergrad/courses/", "/")
                    
                    initial_course_count = len(self.department_courses.get(value, []))
                    self.scrapeDepartment(value)
                    
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
            print(len(self.department_courses))
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {} 