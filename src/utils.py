import logging
import sys

def setup_logger(name: str) -> logging.Logger:
    """
    Sets up and configures a logger with standard formatting.
    
    Args:
        name (str): The name of the logger (typically __name__).
        
    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    
    # Prevent adding multiple handlers if the logger is requested again
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Define the formatting for logs
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
    return logger
