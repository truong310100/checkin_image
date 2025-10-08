"""
Utility functions
"""
import os
from datetime import datetime

def ensure_directory_exists(directory_path):
    """Ensure a directory exists, create if it doesn't"""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def format_datetime(dt):
    """Format datetime to string"""
    if dt:
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return None

def format_date(d):
    """Format date to string"""
    if d:
        return d.strftime('%Y-%m-%d')
    return None

def format_time(dt):
    """Format datetime to time string"""
    if dt:
        return dt.strftime('%H:%M:%S')
    return None

def calculate_work_duration(check_in, check_out):
    """Calculate work duration between check-in and check-out"""
    if check_in and check_out:
        duration = check_out - check_in
        hours = duration.seconds // 3600
        minutes = (duration.seconds % 3600) // 60
        return f"{hours}h {minutes}m"
    return None

def safe_float_conversion(value, default=0.0):
    """Safely convert value to float"""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None