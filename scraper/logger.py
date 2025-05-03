import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger(name=None, level=logging.INFO):
    """
    Configure and return a logger with consistent formatting.
    
    Args:
        name: Logger name (default: None, returns root logger)
        level: Logging level (default: INFO)
        
    Returns:
        Logger instance
    """
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    # Set up log file path
    log_file = os.path.join(log_dir, "scraper.log")
    
    # Configure logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Clear existing handlers to avoid duplicate logs when importing multiple times
    if logger.hasHandlers():
        logger.handlers.clear()
    
    # Create handlers
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    
    # File handler with rotation (5 MB per file, max 3 backup files)
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5*1024*1024, backupCount=3
    )
    file_handler.setLevel(level)
    
    # Create formatter and add it to handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger 