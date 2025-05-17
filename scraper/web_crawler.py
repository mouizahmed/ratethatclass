from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from typing import Dict, List, Tuple, Optional, Any
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback

# Import centralized logger
from logger import setup_logger

# Get configured logger
logger = setup_logger(__name__)

class BaseScraper(ABC):
    def __init__(self, headless: bool = True, timeout: int = 10):
        self.timeout = timeout
        self.headless = headless
        self.driver = None
        self.wait = None
        self.department_courses: Dict[str, List[Dict[str, str]]] = {}
        self.university_name = "Default University"
        
    def setup_driver(self):
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-images")
        options.page_load_strategy = 'eager'
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, self.timeout)
        
    def cleanup(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logger.error(f"Error during driver cleanup: {e}")
            finally:
                self.driver = None
                self.wait = None
    
    def add_course(self, department: str, course_tag: str, course_name: str):
        if department not in self.department_courses:
            self.department_courses[department] = []
            
        self.department_courses[department].append({
            "courseTag": course_tag.strip(),
            "courseName": course_name.strip()
        })
    
    @abstractmethod
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        pass
    
    def __enter__(self):
        self.setup_driver()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()



# class CarletonUScraper(BaseScraper):
#     BASE_URL = "https://calendar.carleton.ca/undergrad/courses/"
    
#     def __init__(self, headless: bool = True):
#         super().__init__(headless=headless, timeout=5)


#     def scrapeAllDepartments(self) -> Dict[str, List[Dict[str, str]]]:
#         try:
#             self.driver.get(self.BASE_URL)
#             departments = self.getDepartmentOptions()
            
#             total = len(departments)
#             for i, (value, name) in enumerate(departments, 1):
#                 try:
#                     logger.info(f"Scraping department: {name} ({i}/{total})")
                    
#                     script = f"""
#                         document.getElementById('courseprefix').value = '{value}';
#                         document.getElementById('search-with-filters').click();
#                     """
#                     self.driver.execute_script(script)
                    
#                     self.scrapeDepartment()
                    
#                 except Exception as e:
#                     logger.error(f"Error scraping department {name}: {e}")
#                     continue
            
#             return self.department_courses
#         except Exception as e:
#             logger.error(f"Error in scrapeAllDepartments: {e}")
#             return {}

# class OttawaUScraper(BaseScraper):
#     def __init__(self, headless: bool = True):
#         super().__init__(headless=headless, timeout=5)

# class GuelphUScraper(BaseScraper):
#     def __init__(self, headless: bool = True):
#         super().__init__(headless=headless, timeout=5)

# class OntarioTechUScraper(BaseScraper):
#     def __init__(self, headless: bool = True):
#         super().__init__(headless=headless, timeout=5)

# class QueensUScraper(BaseScraper):
#     def __init__(self, headless: bool = True):
#         super().__init__(headless=headless, timeout=5)

# class YorkUScraper(BaseScraper):
#     def __init__(self, headless: bool = True):
#         super().__init__(headless=headless, timeout=5)

class McMasterScraper(BaseScraper):
    BASE_URL = "https://academiccalendars.romcmaster.ca/content.php?catoid=53&navoid=10775"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=5)
        self.university_name = "McMaster University"
        
    def getDepartmentOptions(self) -> List[Tuple[str, str]]:
        try:
            checkbox = self.driver.find_element(By.ID, "exact_match")
            checkbox.click()

            select_department = Select(self.driver.find_element(By.ID, "courseprefix"))
            return [(option.get_attribute('value'), option.text)
                    for option in select_department.options[1:]]
        except Exception as e:
            logger.error(f"Error getting department options: {e}")
            return []

    def scrapeCourses(self, course_elements: List) -> List[Dict[str, str]]:
        department_courses = []
        for course in course_elements:
            try:
                course_parts = course.text.split(' - ')
                if len(course_parts) >= 2:
                    course_tag = course_parts[0].strip()
                    course_name = course_parts[1].strip()
                    department_courses.append({
                        "courseTag": course_tag,
                        "courseName": course_name
                    })
            except Exception as e:
                logger.error(f"Error scraping course: {e}")
        return department_courses

    def scrapeDepartment(self, max_retries: int = 2) -> None:
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
                
                courses = self.scrapeCourses(course_elements)
                
                if courses:
                    current_dept = self.driver.find_element(By.ID, "courseprefix").get_attribute("value")
                    if current_dept in self.department_courses:
                        self.department_courses[current_dept].extend(courses)
                    else:
                        self.department_courses[current_dept] = courses

                next_page = self.findNextPage()
                if not next_page:
                    break

                self.driver.execute_script("arguments[0].click();", next_page)
                time.sleep(0.5)
                
            except TimeoutException:
                retry_count += 1
                if retry_count >= max_retries:
                    logger.warning(f"Max retries reached when scraping department")
                    break
                self.driver.refresh()
            except Exception as e:
                logger.error(f"Error in scrapeDepartment: {e}")
                break

    def findNextPage(self) -> Optional[Any]:
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
            departments = self.getDepartmentOptions()
            
            total = len(departments)
            for i, (value, name) in enumerate(departments, 1):
                try:
                    logger.info(f"Scraping department: {name} ({i}/{total})")
                    
                    script = f"""
                        document.getElementById('courseprefix').value = '{value}';
                        document.getElementById('search-with-filters').click();
                    """
                    self.driver.execute_script(script)
                    
                    self.scrapeDepartment()
                    
                except Exception as e:
                    logger.error(f"Error scraping department {name}: {e}")
                    continue
            
            return self.department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}

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

class TMUScraper(BaseScraper):
    BASE_URL = "https://www.torontomu.ca/calendar/2024-2025/courses/"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless)
        self.university_name = "Toronto Metropolitan University"
        
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
            courses = self.driver.find_elements(By.CSS_SELECTOR, "a.courseCode")
            for course in courses:
                course_text = course.text
                if ' - ' in course_text:
                    course_parts = course_text.split(' - ', 1)
                    courseTag = course_parts[0]
                    courseName = course_parts[1]
                    self.add_course(departmentName, courseTag, courseName)
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

class WaterlooScraper(BaseScraper):
    BASE_URL = "https://classes.uwaterloo.ca/uwpcshtm.html"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless)
        self.soup = None
        self.university_name = "University of Waterloo"
        
    def setup_driver(self):
        """Override to use requests instead of Selenium for this scraper."""
        pass
        
    def cleanup(self):
        """Override to skip Selenium cleanup."""
        pass

    def run(self) -> Dict[str, List[Dict[str, str]]]:
        try:
            source = requests.get(self.BASE_URL).text
            self.soup = BeautifulSoup(source, 'html.parser')
            
            department_courses = {}
            
            tables = self.soup.find_all('table')
            if len(tables) < 2:
                logger.error("Course table not found")
                return department_courses
                
            course_table = tables[1]
            course_rows = course_table.find_all('tr')
            
            if len(course_rows) < 2:
                logger.error("No course rows found")
                return department_courses
            
            total = len(course_rows)
            for i, course in enumerate(course_rows[1:], 1):
                try:
                    if i % 100 == 0:
                        logger.info(f"Processing course {i}/{total}")
                        
                    cells = course.find_all('td')
                    if len(cells) < 3:
                        continue
                        
                    department = cells[0].get_text(strip=True)
                    code = cells[1].get_text(strip=True)
                    title = cells[2].get_text(strip=True)
                    
                    if not department or not code or not title:
                        continue
                        
                    courseTag = f"{department} {code}"
                    
                    if department in department_courses:
                        department_courses[department].append({
                            "courseTag": courseTag,
                            "courseName": title
                        })
                    else:
                        department_courses[department] = [{
                            "courseTag": courseTag,
                            "courseName": title
                        }]
                except Exception as e:
                    logger.error(f"Error processing course row: {e}")
                    continue
                    
            return department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}


def run_scraper(scraper_class):
    scraper_name = scraper_class.__name__
    logger.info(f"Starting {scraper_name}")
    
    try:
        with scraper_class(headless=True) as scraper:
            departments = scraper.run()
            university_name = scraper.university_name
            logger.info(f"Successfully scraped {len(departments)} departments with {scraper_name}")
            return university_name, departments
    except Exception as e:
        logger.error(f"Error running {scraper_name}: {e}")
        logger.error(traceback.format_exc())
        return None, {}

def main():
    scrapers = [
        McMasterScraper,
    ]
    
    results = {}
    
    # You can use ThreadPoolExecutor to run scrapers in parallel if needed
    # with ThreadPoolExecutor(max_workers=len(scrapers)) as executor:
    #     futures = {executor.submit(run_scraper, scraper): scraper.__name__ for scraper in scrapers}
    #     for future in as_completed(futures):
    #         scraper_name = futures[future]
    #         try:
    #             result = future.result()
    #             results[scraper_name] = result
    #         except Exception as e:
    #             logger.error(f"Error with {scraper_name}: {e}")
    
    # For now, run them sequentially
    for scraper in scrapers:
        university_name, result = run_scraper(scraper)
        if university_name:
            results[university_name] = result
    
    print(list(results.keys()))
    # print(list(results["Toronto Metropolitan University"].keys()))

    logger.info(f"Completed scraping with {len(results)} scrapers")
    return results

if __name__ == "__main__":
    main()