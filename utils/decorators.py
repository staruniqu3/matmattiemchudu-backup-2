"""
Decorators for rate limiting, caching, and performance monitoring
"""

import time
import functools
import logging
from datetime import datetime, timedelta
from flask import request, jsonify, g
from werkzeug.exceptions import TooManyRequests
from cache import cache, get_cache_key

def rate_limit(limit_string):
    """
    Rate limiting decorator
    Usage: @rate_limit("10 per minute")
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Parse limit string (e.g., "10 per minute")
            parts = limit_string.split()
            if len(parts) != 3:
                raise ValueError("Invalid rate limit format")
            
            limit = int(parts[0])
            period = parts[2]
            
            # Convert period to seconds
            period_seconds = {
                'second': 1,
                'minute': 60,
                'hour': 3600,
                'day': 86400
            }.get(period, 60)
            
            # Get client identifier
            client_id = get_client_identifier()
            
            # Create cache key
            cache_key = get_cache_key('rate_limit', f.__name__, client_id)
            
            # Get current count
            current_count = cache.get(cache_key) or 0
            
            if current_count >= limit:
                raise TooManyRequests(f"Rate limit exceeded. Try again in {period_seconds} seconds.")
            
            # Increment count
            cache.set(cache_key, current_count + 1, timeout=period_seconds)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def cache_result(timeout=300, key_prefix=None):
    """
    Cache function results
    Usage: @cache_result(timeout=600, key_prefix="customer_data")
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate cache key
            if key_prefix:
                cache_key = get_cache_key(key_prefix, *args, **kwargs)
            else:
                cache_key = get_cache_key(f.__name__, *args, **kwargs)
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = f(*args, **kwargs)
            cache.set(cache_key, result, timeout=timeout)
            
            return result
        return decorated_function
    return decorator

def performance_monitor(threshold_ms=1000):
    """
    Monitor function performance and log slow executions
    Usage: @performance_monitor(threshold_ms=500)
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = f(*args, **kwargs)
                return result
            finally:
                end_time = time.time()
                execution_time = (end_time - start_time) * 1000  # Convert to ms
                
                # Log slow executions
                if execution_time > threshold_ms:
                    logging.warning(
                        f"Slow execution detected: {f.__name__} took {execution_time:.2f}ms "
                        f"(threshold: {threshold_ms}ms)"
                    )
                
                # Store performance metric
                store_performance_metric(f.__name__, execution_time)
                
        return decorated_function
    return decorator

def require_admin():
    """
    Require admin access
    Usage: @require_admin()
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user is admin (implement your own logic)
            if not is_admin_user():
                from flask import abort
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def log_access(action=None):
    """
    Log function access
    Usage: @log_access(action="customer_lookup")
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = get_client_identifier()
            action_name = action or f.__name__
            
            logging.info(
                f"Access log: {action_name} - IP: {client_ip} - "
                f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
            )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def handle_errors(default_response=None):
    """
    Handle errors gracefully
    Usage: @handle_errors(default_response={'error': 'Service unavailable'})
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except Exception as e:
                logging.error(f"Error in {f.__name__}: {str(e)}")
                
                if default_response:
                    return jsonify(default_response), 500
                else:
                    from flask import render_template
                    return render_template('base.html', 
                                         error_message="Có lỗi xảy ra. Vui lòng thử lại sau."), 500
        return decorated_function
    return decorator

# Helper functions
def get_client_identifier():
    """Get client identifier for rate limiting"""
    # Use IP address and User-Agent as identifier
    ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    user_agent = request.headers.get('User-Agent', '')
    return f"{ip}:{hash(user_agent)}"

def is_admin_user():
    """Check if current user is admin"""
    # Implement your own admin check logic
    # For now, check if request is from localhost
    return request.remote_addr in ['127.0.0.1', '::1', 'localhost']

def store_performance_metric(function_name, execution_time):
    """Store performance metric in database"""
    try:
        from models import SystemMetrics
        from app import db
        
        metric = SystemMetrics(
            metric_name=f"execution_time_{function_name}",
            metric_value=execution_time,
            timestamp=datetime.utcnow()
        )
        db.session.add(metric)
        db.session.commit()
    except Exception as e:
        logging.error(f"Error storing performance metric: {str(e)}")
