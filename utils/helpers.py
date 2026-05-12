"""
Helper functions for the Mát Mát system
"""

import re
import hashlib
import secrets
from datetime import datetime, timedelta
from urllib.parse import urlencode
from flask import request
import logging

def format_datetime(dt, format_type='full'):
    """
    Format datetime for Vietnamese locale
    
    Args:
        dt: datetime object or ISO string
        format_type: 'full', 'date', 'time', 'relative'
    """
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except:
            return dt
    
    if not isinstance(dt, datetime):
        return str(dt)
    
    if format_type == 'full':
        return dt.strftime('%d/%m/%Y %H:%M:%S')
    elif format_type == 'date':
        return dt.strftime('%d/%m/%Y')
    elif format_type == 'time':
        return dt.strftime('%H:%M:%S')
    elif format_type == 'relative':
        return format_relative_time(dt)
    else:
        return dt.strftime('%d/%m/%Y %H:%M:%S')

def format_relative_time(dt):
    """Format datetime as relative time in Vietnamese"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days} ngày trước"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} giờ trước"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} phút trước"
    else:
        return "Vừa xong"

def validate_input(input_type, value):
    """
    Validate input based on type
    
    Args:
        input_type: 'customer_code', 'tracking_number', 'email', 'phone'
        value: input value to validate
    
    Returns:
        dict: {'valid': bool, 'message': str, 'cleaned': str}
    """
    if not value or not isinstance(value, str):
        return {'valid': False, 'message': 'Giá trị không hợp lệ', 'cleaned': ''}
    
    cleaned = value.strip()
    
    if input_type == 'customer_code':
        return validate_customer_code(cleaned)
    elif input_type == 'tracking_number':
        return validate_tracking_number(cleaned)
    elif input_type == 'email':
        return validate_email(cleaned)
    elif input_type == 'phone':
        return validate_phone(cleaned)
    else:
        return {'valid': False, 'message': 'Loại dữ liệu không được hỗ trợ', 'cleaned': cleaned}

def validate_customer_code(code):
    """Validate customer code"""
    if len(code) < 3:
        return {'valid': False, 'message': 'Mã khách hàng phải có ít nhất 3 ký tự', 'cleaned': code}
    
    if len(code) > 50:
        return {'valid': False, 'message': 'Mã khách hàng không được vượt quá 50 ký tự', 'cleaned': code}
    
    # Allow alphanumeric and common special characters
    if not re.match(r'^[A-Za-z0-9\-_\.]+$', code):
        return {'valid': False, 'message': 'Mã khách hàng chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới', 'cleaned': code}
    
    return {'valid': True, 'message': '', 'cleaned': code.upper()}

def validate_tracking_number(number):
    """Validate tracking number"""
    if len(number) < 8:
        return {'valid': False, 'message': 'Mã vận đơn phải có ít nhất 8 ký tự', 'cleaned': number}
    
    if len(number) > 50:
        return {'valid': False, 'message': 'Mã vận đơn không được vượt quá 50 ký tự', 'cleaned': number}
    
    # Allow alphanumeric and common special characters
    if not re.match(r'^[A-Za-z0-9\-_\.]+$', number):
        return {'valid': False, 'message': 'Mã vận đơn chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới', 'cleaned': number}
    
    return {'valid': True, 'message': '', 'cleaned': number.upper()}

def validate_email(email):
    """Validate email address"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return {'valid': False, 'message': 'Địa chỉ email không hợp lệ', 'cleaned': email}
    
    return {'valid': True, 'message': '', 'cleaned': email.lower()}

def validate_phone(phone):
    """Validate Vietnamese phone number"""
    # Remove all non-digit characters
    cleaned = re.sub(r'\D', '', phone)
    
    # Vietnamese phone patterns
    patterns = [
        r'^84[0-9]{8,9}$',  # +84 format
        r'^0[0-9]{8,9}$',   # 0 format
        r'^[0-9]{8,9}$'     # without prefix
    ]
    
    if not any(re.match(pattern, cleaned) for pattern in patterns):
        return {'valid': False, 'message': 'Số điện thoại không hợp lệ', 'cleaned': phone}
    
    return {'valid': True, 'message': '', 'cleaned': cleaned}

def generate_tracking_url(tracking_number, provider):
    """Generate tracking URL for shipping provider"""
    base_urls = {
        'vietnampost': 'https://www.vnpost.vn/vi-vn/dinh-vi/buu-pham',
        'ghn': 'https://ghn.vn/tra-cuu-van-don',
        'ghtk': 'https://ghtk.vn/tra-cuu-van-don',
        'jnt': 'https://www.jtexpress.vn/track',
        'shopee': 'https://shopee.vn/buyer/orders'
    }
    
    base_url = base_urls.get(provider)
    if not base_url:
        return None
    
    # Add tracking number as query parameter
    params = {'tracking_number': tracking_number}
    return f"{base_url}?{urlencode(params)}"

def get_client_ip():
    """Get client IP address"""
    # Check for forwarded IP first
    forwarded_ip = request.environ.get('HTTP_X_FORWARDED_FOR')
    if forwarded_ip:
        # Take the first IP in case of multiple
        return forwarded_ip.split(',')[0].strip()
    
    # Check for real IP
    real_ip = request.environ.get('HTTP_X_REAL_IP')
    if real_ip:
        return real_ip
    
    # Fall back to remote address
    return request.remote_addr

def sanitize_string(text, max_length=None):
    """Sanitize string for safe display"""
    if not text:
        return ''
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', str(text))
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Truncate if needed
    if max_length and len(text) > max_length:
        text = text[:max_length - 3] + '...'
    
    return text

def generate_api_key(length=32):
    """Generate a secure API key"""
    return secrets.token_urlsafe(length)

def hash_sensitive_data(data):
    """Hash sensitive data for logging"""
    if not data:
        return ''
    
    # Use SHA-256 for hashing
    return hashlib.sha256(str(data).encode()).hexdigest()[:8]

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def detect_shipping_provider(tracking_number):
    """Detect shipping provider from tracking number format"""
    number = tracking_number.upper().strip()
    
    # Shopee Express patterns (check first for specific SPXVN pattern)
    if number.startswith('SPXVN'):
        return 'shopee'
    
    # ViettelPost patterns
    if number.startswith(('ĐVVC', 'VTP')):
        return 'viettelpost'
    
    # Vietnam Post patterns
    if re.match(r'^(RC|RG|RA|CC|CP|CD)[0-9A-Z]+$', number):
        return 'vietnampost'
    
    # GHN patterns
    if number.startswith('GHN') or (len(number) == 13 and number.isdigit()):
        return 'ghn'
    
    # GHTK patterns
    if number.startswith('GHTK') or (len(number) == 12 and number.isdigit()):
        return 'ghtk'
    
    # J&T patterns
    if number.startswith('JT') or (len(number) == 14 and number.isdigit()):
        return 'jnt'
    
    # Default to Vietnam Post
    return 'vietnampost'

def log_user_action(action, details=None):
    """Log user action for analytics"""
    try:
        client_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', 'Unknown')
        
        log_data = {
            'action': action,
            'ip': client_ip,
            'user_agent': user_agent[:500],  # Truncate long user agents
            'timestamp': datetime.utcnow().isoformat(),
            'details': details or {}
        }
        
        logging.info(f"User action: {action} - IP: {client_ip}")
        
        # Store in database for analytics
        from models import TrackingQuery
        from app import db
        
        if action == 'tracking_query':
            query = TrackingQuery(
                tracking_number=details.get('tracking_number', ''),
                shipping_provider=details.get('provider', ''),
                ip_address=client_ip,
                user_agent=user_agent[:500],
                success=details.get('success', False),
                error_message=details.get('error', None)
            )
            db.session.add(query)
            db.session.commit()
    
    except Exception as e:
        logging.error(f"Error logging user action: {str(e)}")

def create_pagination_info(page, per_page, total_items):
    """Create pagination information"""
    total_pages = (total_items + per_page - 1) // per_page
    
    return {
        'page': page,
        'per_page': per_page,
        'total_items': total_items,
        'total_pages': total_pages,
        'has_prev': page > 1,
        'has_next': page < total_pages,
        'prev_page': page - 1 if page > 1 else None,
        'next_page': page + 1 if page < total_pages else None
    }

def mask_sensitive_info(text, mask_char='*', visible_start=2, visible_end=2):
    """Mask sensitive information for logging"""
    if not text or len(text) <= visible_start + visible_end:
        return text
    
    visible_part = text[:visible_start] + mask_char * (len(text) - visible_start - visible_end) + text[-visible_end:]
    return visible_part
