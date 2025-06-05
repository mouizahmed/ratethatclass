import logging
import os
from logging.handlers import RotatingFileHandler
import threading
from datetime import datetime

def setup_logger(name):
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Create a logger
    logger = logging.getLogger(name)
    
    # Only add handlers if the logger doesn't have any
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create handlers
        # Console handler
        c_handler = logging.StreamHandler()
        c_handler.setLevel(logging.INFO)
        
        # Generate timestamp for log file name
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_filename = f'scraper_{timestamp}.log'
        
        # File handler - using RotatingFileHandler for thread safety
        log_file = os.path.join(log_dir, log_filename)
        f_handler = RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            delay=True
        )
        f_handler.setLevel(logging.INFO)
        
        # Create formatters and add it to handlers
        log_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        c_handler.setFormatter(log_format)
        f_handler.setFormatter(log_format)
        
        # Add handlers to the logger
        logger.addHandler(c_handler)
        logger.addHandler(f_handler)
        
        # Make logger thread-safe
        logger.lock = threading.Lock()
    
    return logger 