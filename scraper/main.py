#!/usr/bin/env python3

from scrapers import (
    CarletonUScraper,
    OttawaScraper,
    YorkScraper,
    OntarioTechScraper,
    McMasterScraper,
    UWOScraper,
    TMUScraper,
    WaterlooScraper,
    QueensScraper,
    GuelphScraper,
    UofTScraper
)
from scrapers.utils import run_scraper
from scrapers.base_scraper import logger

def main():
    scrapers = [
        # WaterlooScraper,
        # CarletonUScraper,
        # OttawaScraper,
        # YorkScraper,
        # OntarioTechScraper,
        # McMasterScraper,
        # UWOScraper,
        # TMUScraper,
        # QueensScraper, 
        # GuelphScraper,
        UofTScraper
    ]
    
    results = {}
    
    logger.info(f"Starting scraping process with {len(scrapers)} scrapers")
    logger.info("JSON files will be saved to 'scraped_data' directory after each scraper completes")
    
    # Run scrapers sequentially (you can use ThreadPoolExecutor for parallel execution)
    for i, scraper in enumerate(scrapers, 1):
        logger.info(f"Running scraper {i}/{len(scrapers)}: {scraper.__name__}")
        university_name, result = run_scraper(scraper, headless=False)
        if university_name:
            results[university_name] = result
            logger.info(f"[SUCCESS] Completed {scraper.__name__} - Data saved to JSON")
        else:
            logger.error(f"[FAILED] {scraper.__name__}")
    
    logger.info(f"Scraping process completed!")
    logger.info(f"Successfully scraped {len(results)} universities: {list(results.keys())}")
    logger.info("Check the 'scraped_data' directory for individual JSON files")

    return results

if __name__ == "__main__":
    main() 