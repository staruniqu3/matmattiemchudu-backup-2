from flask_caching import Cache

# Initialize cache
cache = Cache()

def init_cache(app):
    """Initialize cache with app"""
    cache.init_app(app)
    return cache

def get_cache_key(prefix, *args):
    """Generate cache key with prefix and arguments"""
    return f"{prefix}:{':'.join(str(arg) for arg in args)}"

def clear_cache_pattern(pattern):
    """Clear cache keys matching pattern"""
    try:
        # This works with Redis backend
        from flask import current_app
        if hasattr(cache.cache, 'delete_many'):
            keys = cache.cache.cache._write_client.keys(pattern)
            if keys:
                cache.cache.cache._write_client.delete(*keys)
        return True
    except Exception:
        return False
