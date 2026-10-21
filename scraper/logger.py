import logging
import os
from datetime import datetime

_configured = False

def setup_logger(name):
    """Return a logger, configuring console + one log file per run on first use."""
    global _configured
    if not _configured:
        log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[logging.StreamHandler(), logging.FileHandler(log_file, delay=True)],
        )
        _configured = True

    return logging.getLogger(name)
