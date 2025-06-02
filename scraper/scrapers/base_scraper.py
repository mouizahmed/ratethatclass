from abc import ABC, abstractmethod
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.options import Options
from typing import Dict, List

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
            "course_tag": course_tag.strip(),
            "course_name": course_name.strip()
        })
    
    @abstractmethod
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        pass
    
    def __enter__(self):
        self.setup_driver()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup() 