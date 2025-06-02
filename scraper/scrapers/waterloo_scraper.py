from typing import Dict, List
from .base_scraper import BaseScraper, logger

import requests
from bs4 import BeautifulSoup

class WaterlooScraper(BaseScraper):
    BASE_URL = "https://classes.uwaterloo.ca/uwpcshtm.html"

    def __init__(self, headless: bool = True):
        super().__init__(headless=headless)
        self.soup = None
        self.university_name = "University of Waterloo"
        
    def setup_driver(self):
        pass
        
    def cleanup(self):
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
                        
                    course_tag = f"{department} {code}"
                    
                    if department in department_courses:
                        department_courses[department].append({
                            "course_tag": course_tag,
                            "course_name": title
                        })
                    else:
                        department_courses[department] = [{
                            "course_tag": course_tag,
                            "course_name": title
                        }]
                except Exception as e:
                    logger.error(f"Error processing course row: {e}")
                    continue
                    
            return department_courses
        except Exception as e:
            logger.error(f"Error in run: {e}")
            return {}


