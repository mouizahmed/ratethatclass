from typing import Tuple
from typing import Dict, List
from .base_scraper import BaseScraper, logger

import requests
from bs4 import BeautifulSoup

class QueensScraper(BaseScraper):
    BASE_URL = "https://www.queensu.ca/academic-calendar/course-search/"
    API_URL = "https://www.queensu.ca/academic-calendar/course-search/api/"
    
    def __init__(self, headless: bool = True):
        super().__init__(headless=headless, timeout=5)
        self.university_name = "Queens University"
        self.session = requests.Session()
        
    def setup_driver(self):
        pass
        
    def cleanup(self):
        pass
        
    def get_department_options(self) -> List[Tuple[str, str]]:
        try:
            response = self.session.get(self.BASE_URL, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            subject_select = soup.find('select', {'id': 'crit-subject'})
            
            subjects = []
            if subject_select:
                for option in subject_select.find_all('option'):
                    value = option.get('value', '').strip()
                    text = option.get_text().strip()
                    if value and value != '':
                        subjects.append((value, text))
            
            logger.info(f"Found {len(subjects)} subjects to scrape")
            return subjects
            
        except Exception as e:
            logger.error(f"Error getting subjects: {e}")
            return []
    
    def search_courses_for_subject(self, subject_code: str) -> List[Dict[str, str]]:
        try:
            # Make API request to search for courses
            params = {
                'page': 'fose',
                'route': 'search'
            }
            
            data = {
                'other': {
                    'srcdb': '2024',  # Current academic year
                    'keyword': '',
                    'subject': subject_code
                },
                'criteria': [
                    {
                        'field': 'subject',
                        'value': subject_code
                    }
                ]
            }
            
            response = self.session.post(
                self.API_URL,
                params=params,
                json=data,
                timeout=self.timeout,
                headers={
                    'Content-Type': 'application/json',
                    'Referer': self.BASE_URL
                }
            )
            
            if response.status_code == 200:
                try:
                    json_data = response.json()
                    courses = []
                    
                    # Extract courses from API response
                    if 'results' in json_data:
                        for result in json_data['results']:
                            course_code = result.get('code', '')
                            course_title = result.get('title', '')
                            
                            if course_code and course_title:
                                courses.append({
                                    'course_tag': course_code.strip(),
                                    'course_name': course_title.strip()
                                })
                    
                    return courses
                    
                except ValueError:
                    logger.warning(f"Invalid JSON response for subject {subject_code}")
                    return []
            else:
                logger.warning(f"API request failed for subject {subject_code}: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching courses for subject {subject_code}: {e}")
            return []
    
    def run(self) -> Dict[str, List[Dict[str, str]]]:
        """Main method to scrape all courses from Queen's University"""
        logger.info(f"Starting scraping for {self.university_name}")
        
        try:
            departments = self.get_department_options()
            
            if not departments:
                logger.error("No subjects found, cannot proceed with scraping")
                return {}
            
            for subject_code, subject_name in departments:
                logger.info(f"Processing subject: {subject_name} ({subject_code})")
                
                # Use API to get courses
                courses = self.search_courses_for_subject(subject_code)
                
                if courses:
                    self.department_courses[subject_name] = courses
                    logger.info(f"Found {len(courses)} courses for {subject_name}")
                else:
                    logger.warning(f"No courses found for {subject_name}")
            
            logger.info(f"Scraping completed. Found courses for {len(self.department_courses)} departments")
            return self.department_courses
            
        except Exception as e:
            logger.error(f"Error during scraping: {e}")
            return self.department_courses
        
        finally:
            if hasattr(self.session, 'close'):
                self.session.close()
            
            
