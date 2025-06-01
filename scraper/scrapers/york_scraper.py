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


class YorkUScraper(BaseScraper):
    BASE_URL = "https://w2prod.sis.yorku.ca/Apps/WebObjects/cdm"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=30)
        self.university_name = "York University"
        self.min_delay = 1
        self.max_delay = 3
        self.session = requests.Session()

    def setup_driver(self):
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        
        # Performance optimizations
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-images")
        options.add_argument("--disable-javascript")
        options.add_argument("--blink-settings=imagesEnabled=false")
        options.add_argument("--disk-cache-size=1")
        options.add_argument("--media-cache-size=1")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--start-maximized")
        
        # User agent
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
        
        # Additional preferences to make automation less detectable
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, self.timeout)
        
        # Headers to look more like a real browser
        self.driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", {
            "headers": {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "DNT": "1"
            }
        })
        
        # Random mouse movements and scrolling to appear more human-like
        self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """
        })

    def random_delay(self):
        delay = random.uniform(self.min_delay, self.max_delay)
        time.sleep(delay)

    def getDepartmentOptions(self) -> List[Tuple[str, str]]:
        try:
            self.driver.get(self.BASE_URL)
            self.random_delay()
            
            subject_link = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Subject')]"))
            )
            
            subject_link.click()
            self.random_delay()
            
            self.wait.until(
                EC.presence_of_element_located((By.ID, "subjectSelect"))
            )
            
            self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#subjectSelect option"))
            )
            
            self.wait.until(
                EC.element_to_be_clickable((By.ID, "subjectSelect"))
            )
            
            # # Additional wait to ensure all options are loaded
            # self.random_delay()
            
            select = self.driver.find_element(By.ID, "subjectSelect")
            
            options = select.find_elements(By.TAG_NAME, "option")
            
            if not options:
                logger.error("No options found in select element")
                return []
                
            result = []
            for option in options:
                value = option.get_attribute('value')
                text = option.text.strip()
                if value and text:
                    # Extract department code from text (e.g., "ACTG - Accounting - ( SB, ED )" -> "ACTG")
                    dept_code = text.split(' - ')[0].strip()
                    result.append((value, dept_code))
            
            if not result:
                logger.error("No valid department options found")
            else:
                logger.info(f"Found {len(result)} department options")
            
            return result
                   
        except TimeoutException:
            logger.error("Timeout waiting for subject select element or options")
            try:
                logger.error(f"Page source: {self.driver.page_source[:500]}...")  # Log first 500 chars
            except:
                pass
            return []
        except Exception as e:
            logger.error(f"Error getting department options: {e}")
            return []

    def scrapeDepartment(self, department_code: str) -> None:
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                select = self.wait.until(
                    EC.presence_of_element_located((By.ID, "subjectSelect"))
                )
                Select(select).select_by_value(department_code)
                self.random_delay()
                
                search_button = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "input[value='Search Courses']"))
                )
                search_button.click()
                self.random_delay()
                
                # Check if "No courses were found" message exists
                try:
                    no_courses = self.driver.find_element(By.XPATH, "//*[contains(text(), 'No courses were found.')]")
                    if no_courses:
                        logger.info(f"No courses found for department {department_code}, skipping...")
                        return
                except NoSuchElementException:
                    pass
                
                try:
                    self.wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "table tr[bgcolor='#ffffff'], table tr[bgcolor='#e6e6e6']"))
                    )
                except TimeoutException:
                    if "No courses found" in self.driver.page_source:
                        logger.info(f"No courses found for department {department_code}, skipping...")
                        return
                    raise
                
                # # Additional wait to ensure all content is loaded
                # self.random_delay()
                
                course_rows = self.driver.find_elements(By.CSS_SELECTOR, "table tr[bgcolor='#ffffff'], table tr[bgcolor='#e6e6e6']")
                
                if not course_rows:
                    logger.warning(f"No course rows found for department {department_code}, skipping...")
                    return
                
                # Process rows in batches for better performance
                batch_size = 10
                for i in range(0, len(course_rows), batch_size):
                    batch = course_rows[i:i + batch_size]
                    for row in batch:
                        try:
                            # Get the cells from the row
                            cells = row.find_elements(By.TAG_NAME, "td")
                            if len(cells) >= 2:
                                # First cell contains course code and credits
                                course_info = cells[0].text.strip()
                                
                                # Second cell contains course title
                                course_title = cells[1].text.strip()
                                
                                # Extract course code from the first cell (e.g., "SB/ACTG 2010   3.00" -> "ACTG 2010")
                                parts = course_info.split()
                                if len(parts) >= 3:
                                    # Get the department code and number (e.g., "ACTG 2010")
                                    course_code = f"{parts[0].split('/')[-1]} {parts[1]}"  # Take last part after / and the number
                                else:
                                    course_code = ""
                                
                                print(course_code)
                                if course_code and course_title:
                                    self.add_course(department_code, course_code, course_title)
                        except Exception as e:
                            logger.error(f"Error parsing course row: {e}")
                            continue
                    
                    # Small delay between batches
                    if i + batch_size < len(course_rows):
                        time.sleep(0.1)
                
                break
                
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
                    self.driver.get(self.BASE_URL)
                    self.random_delay()
                    
                    subject_link = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Subject')]"))
                    )
                    
                    subject_link.click()
                    self.random_delay()
                    
                    self.wait.until(
                        EC.presence_of_element_located((By.ID, "subjectSelect"))
                    )
                except Exception as e:
                    logger.error(f"Error navigating back to subject page: {e}")

    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            self.driver.get(self.BASE_URL)
            self.random_delay()
            
            # # Wait for initial page load
            # time.sleep(2)  # Reduced initial wait time
            
            departments = self.getDepartmentOptions()
            logger.info(f"Found {len(departments)} departments")
            
            total = len(departments)
            successful_departments = 0
            for i, (value, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    self.scrapeDepartment(value)
                    
                    if value in self.department_courses:
                        successful_departments += 1
                        logger.info(f"Found {len(self.department_courses[value])} courses for department {name}")
                    else:
                        logger.warning(f"No courses found for department {name}")
                    
                    self.random_delay()
                    
                except Exception as e:
                    logger.error(f"Error processing department {name}: {e}")
                    continue
            
            logger.info(f"Successfully scraped {successful_departments}/{total} departments")
            return self.department_courses
            
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}
