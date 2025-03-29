from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.options import Options  # Updated import
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging
from typing import Dict, List, Tuple, Optional
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class McMasterScraper:
    BASE_URL = "https://academiccalendars.romcmaster.ca/content.php?catoid=53&navoid=10775"

    def __init__(self):
        options = Options()
        options.add_argument("--headless=new")
        # Add performance-improving options
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-images")  # Disable image loading
        options.page_load_strategy = 'eager'  # Don't wait for all resources to load
        
        self.driver = webdriver.Chrome(options=options)
        # Reduce wait time since we're using better selectors
        self.wait = WebDriverWait(self.driver, 5)
        self.driver.get(self.BASE_URL)
        self.department_courses = {}

    def getDepartmentOptions(self):
        checkbox = self.driver.find_element(By.ID, "exact_match")
        checkbox.click()

        select_department = Select(self.driver.find_element(By.ID, "courseprefix"))
        return [(option.get_attribute('value'), option.text)
                for option in select_department.options[1:]]

    def scrapeCourses(self, courseElements):
        department_courses = []
        for course in courseElements:
            try:
                course_parts = course.text.split(' - ')
                if len(course_parts) >= 2:
                    courseTag = course_parts[0].strip()
                    courseName = course_parts[1].strip()
                    department_courses.append({
                        "courseTag": courseTag,
                        "courseName": courseName
                    })
            except Exception as e:
                logging.error(f"Error scraping course: {e}")
        return department_courses

    def scrapeDepartment(self):
        max_retries = 2  # Reduced retries
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Use a faster selector
                courseElements = self.wait.until(
                    EC.presence_of_all_elements_located(
                        (By.CSS_SELECTOR, 'a[onclick*="showCourse"]')
                    )
                )
                
                if not courseElements:
                    break
                
                courses = self.scrapeCourses(courseElements)
                
                if courses:
                    current_dept = self.driver.find_element(By.ID, "courseprefix").get_attribute("value")
                    if current_dept in self.department_courses:
                        self.department_courses[current_dept].extend(courses)
                    else:
                        self.department_courses[current_dept] = courses

                next_page = self.findNextPage()
                if not next_page:
                    break
                    
                # Use JavaScript click instead of Selenium click
                self.driver.execute_script("arguments[0].click();", next_page)
                
            except TimeoutException:
                retry_count += 1
                if retry_count >= max_retries:
                    break
                self.driver.refresh()
            except Exception as e:
                logging.error(f"Error in scrapeDepartment: {e}")
                break

    def findNextPage(self):
        try:
            current_page_element = self.driver.find_element(By.XPATH, '//td[contains(., "Page:")]//span[@aria-current="page"]//strong')
            
            next_page = int(current_page_element.text) + 1
            
            next_page_link = self.driver.find_element(
                By.XPATH, f'//td[contains(., "Page:")]//a[text()="{next_page}"]'
            )
           
            if next_page_link: return next_page_link
            else: return None
        except:
            return None
    
    def scrapeAllDepartments(self):
        departments = self.getDepartmentOptions()
        
        for value, name in departments:
            try:
                logging.info(f"Scraping department: {name}")
                
                # Combine operations using JavaScript
                script = f"""
                    document.getElementById('courseprefix').value = '{value}';
                    document.getElementById('search-with-filters').click();
                """
                self.driver.execute_script(script)
                
                self.scrapeDepartment()
                
            except Exception as e:
                logging.error(f"Error scraping department {name}: {e}")
                continue
        
        return self.department_courses

class UWOScraper:
    BASE_URL = "https://www.westerncalendar.uwo.ca/Courses.cfm"

    def __init__(self):
        fetchURL = requests.get(self.BASE_URL).text
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
        self.driver.get(self.BASE_URL)
        self.department_courses={}

    def getDepartmentLinks(self, departments):
        departmentLinks = {}
        
        for department in departments:
            departmentName = department.text
            departmentLink = department.find_element(By.TAG_NAME, "a").get_attribute("href")
            departmentLinks[departmentName] = departmentLink

        return departmentLinks
    
    def scrapeCourses(self, departmentName):
        courses = self.driver.find_elements(By.CSS_SELECTOR, "h4.courseTitleNoBlueLink")

        for course in courses:
            courseHeading = course.text
            pattern = rf"({departmentName}\s+\d{{4}}(?:[A-Z](?:\/[A-Z])*)?)\s+(.+)"
            match = re.search(pattern, courseHeading)
            if match:
                courseTag = match.group(1)
                courseName = match.group(2)
                print(courseTag + " - " + courseName)
                
                if departmentName in self.department_courses:
                    self.department_courses[departmentName].append({
                        "courseTag": courseTag.strip(),
                        "courseName": courseName.strip()
                    })
                else:
                    self.department_courses[departmentName] = [{
                        "courseTag": courseTag,
                        "courseName": courseName
                    }]
            else:
                print("ERROR")

            

    
    def scrapeAllDepartments(self):
        departments = self.driver.find_elements(By.CSS_SELECTOR, "td.sorting_1")

        # get links
        departmentLinks = self.getDepartmentLinks(departments)
        
        for name, link in departmentLinks.items():
            self.driver.get(link)

            # get courses
            self.scrapeCourses(name)
            
   
        return self.department_courses





class TMUScraper():
    BASE_URL = "https://www.torontomu.ca/calendar/2024-2025/courses/"

    def __init__(self):   
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
        self.driver.get(self.BASE_URL)
        self.department_courses = {}

    def getDepartmentLinks(self, departments):
        departmentLinks = {}
        
        for department in departments:
            departmentName = department.text
            departmentLink = department.find_element(By.TAG_NAME, "a").get_attribute("href")
            departmentLinks[departmentName] = departmentLink

        return departmentLinks
            
    def scrapeCourses(self, departmentName):
        courses = self.driver.find_elements(By.CSS_SELECTOR, "a.courseCode")
        for course in courses:
            courseTag = (course.text).split(' - ')[0]
            courseName = (course.text).split(' - ')[1]

            if departmentName in self.department_courses:
                self.department_courses[departmentName].append({
                    "courseTag": courseTag,
                    "courseName": courseName
                })
            else:
                self.department_courses[departmentName] = [{
                    "courseTag": courseTag,
                    "courseName": courseName
                }]
    
    def scrapeAllDepartments(self):
        departments = self.driver.find_elements(By.CSS_SELECTOR, "td.sorting_1")

        # get links
        departmentLinks = self.getDepartmentLinks(departments)

        for name, link in departmentLinks.items():
            self.driver.get(link)
            print(name)
    
            # get courses
            self.scrapeCourses(name)
   
        return self.department_courses

class WaterlooScrapper():
    BASE_URL = "https://classes.uwaterloo.ca/uwpcshtm.html"

    def __init__(self):
        source = requests.get(self.BASE_URL).text
        soup = BeautifulSoup(source, 'html.parser')
        self.soup = soup

    def scrapeAllDepartments(self):
        department_courses = {}

        tables = self.soup.find_all('table')
        if (len(tables) < 1): return department_courses
        courseTable = tables[1]
        courseRows = courseTable.contents
        if (len(courseRows) < 1): return department_courses
        # print(len(courseRows[2]))
        # print(courseRows[3].find_all('td'))


        for course in courseRows[1:]:
            text = course.get_text(strip=True)
            if not text: continue

            courseCells = course.contents
            if (len(courseCells) < 2): continue
            department = courseCells[0].get_text(strip=True)
            code = courseCells[1].get_text(strip=True)
            title = courseCells[2].get_text(strip=True)
            courseTag = department + " " + code

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

        return department_courses

class UofTScrapper():
    BASE_URL = "https://artsci.calendar.utoronto.ca/search-courses"
    DEPARTMENT_SELECT_ID = "edit-field-section-value"
    SUBMIT_BUTTON_ID = "edit-submit-course-search"
    
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
    
    def getDepartmentOptions(self) -> List[Tuple[str, str]]:
        try:
            select_element = Select(self.driver.find_element(By.ID, self.DEPARTMENT_SELECT_ID))
            return [(option.get_attribute('value'), option.text) 
                   for option in select_element.options[1:]]
        except NoSuchElementException as e:
            logging.error(f"Failed to find department select element: {e}")
            return []
        
    def scrapeDepartment(self, department_value: str) -> List[Dict[str, str]]:
        courses = []
        try:
            # Select department and submit
            select_element = Select(self.driver.find_element(By.ID, self.DEPARTMENT_SELECT_ID))
            select_element.select_by_value(department_value)
            submit_button = self.driver.find_element(By.ID, self.SUBMIT_BUTTON_ID)
            submit_button.click()

            while True:
                
                # Process current page
                soup = BeautifulSoup(self.driver.page_source, 'html.parser')


                # if courses empty
                emptyMessage = soup.find_all('div', class_="view-empty")
                if (len(emptyMessage) > 1): break
                
                # Wait for course elements to load
                self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h3[role='tab']")))
                
                course_rows = soup.find_all('h3', role="tab")
                
                courses.extend(self.fetchCourses(course_rows))

                # Handle pagination
                next_page = self.findNextPage(soup)
                if not next_page:
                    break
                    
                self.driver.get(next_page)

        except TimeoutException:
            logging.error(f"Timeout while scraping department {department_value}")
        except Exception as e:
            logging.error(f"Error scraping department {department_value}: {e}")
            
        return courses
    
    def scrapeAllDepartments(self) -> Dict[str, List[Dict[str, str]]]:
        department_courses = {}
        
        try:
            self.driver.get(self.BASE_URL)
            departments = self.getDepartmentOptions()
            
            for value, name in departments:
                logging.info(f"Scraping department: {name}")
                department_courses[value] = self.scrapeDepartment(value)
                
        finally:
            self.driver.quit()
            
        return department_courses
    
    def fetchCourses(self, course_rows) -> List[Dict[str, str]]:
        courses = []
        for course in course_rows:
            course_div = course.find('div')
            if course_div:
                course_title = course_div.text.strip().split(' - ')
                if len(course_title) == 2:
                    courses.append({
                        "courseTag": course_title[0],
                        "courseName": course_title[1]
                    })
        return courses
    
    def findNextPage(self, soup) -> Optional[str]:
        nav = soup.find('a', title="Go to next page")
        if nav and 'href' in nav.attrs:
            return f"{self.BASE_URL}{nav['href']}"
        return None


def main():
    scrapers = [
        # UofTScrapper(),
        # WaterlooScrapper(),
        # TMUScraper(),
        # UWOScraper(),
        McMasterScraper()
    ]
    
    for scraper in scrapers:
        print(f"\nRunning {scraper.__class__.__name__}...")
        try:
            departments = scraper.scrapeAllDepartments()
            print(f"Successfully scraped {len(departments)} departments")
        except Exception as e:
            print(f"Error running {scraper.__class__.__name__}: {str(e)}")

if __name__ == "__main__":
    main()