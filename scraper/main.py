#!/usr/bin/env python3

import argparse
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
from database import DatabaseManager

def run_scraping():
    scrapers = [
        WaterlooScraper,
        CarletonUScraper,
        OttawaScraper,
        YorkScraper,
        OntarioTechScraper,
        McMasterScraper,
        UWOScraper,
        TMUScraper,
        QueensScraper, 
        GuelphScraper,
        UofTScraper
    ]
    
    results = {}
    
    logger.info(f"Starting scraping process with {len(scrapers)} scrapers")
    logger.info("JSON files will be saved to 'scraped_data' directory after each scraper completes")
    
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

def run_database_import():
    try:
        with DatabaseManager() as db:
            logger.info("Starting database import from JSON files")
            success = db.load_and_insert_from_json()
            if success:
                logger.info("Database import completed successfully")
            else:
                logger.error("Database import failed")
            return success
    except ValueError as e:
        logger.error(str(e))
        return False

def main():
    parser = argparse.ArgumentParser(description='Course Reviews Data Collection CLI')
    parser.add_argument('command', choices=['scrape-and-store', 'scrape-only', 'store-json'], 
                      help='Command to execute:\n'
                           'scrape-and-store: Run scrapers and store data in database\n'
                           'scrape-only: Run scrapers and save to JSON files\n'
                           'store-json: Import existing JSON files into database')
    
    args = parser.parse_args()
    success = True
    
    # Execute requested operations
    if args.command in ['scrape-and-store', 'scrape-only']:
        logger.info("Starting scraping process")
        results = run_scraping()
        success = success and bool(results)
    
    if args.command in ['scrape-and-store', 'store-json']:
        logger.info("Starting database import")
        success = success and run_database_import()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main()) 