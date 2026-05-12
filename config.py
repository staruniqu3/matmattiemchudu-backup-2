import os

class Config:
    """Application configuration"""
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///matmat.db'
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Deployment configuration
    SQLALCHEMY_MIGRATE_REPO = None  # Disable automatic migrations
    
    # Redis configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # Cache configuration - Use simple cache instead of Redis
    CACHE_TYPE = "simple"
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes
    
    # Google Sheets configuration
    GOOGLE_SHEETS_CACHE_TIMEOUT = 600  # 10 minutes
    
    # Shipping APIs configuration
    VIETNAM_POST_API_KEY = os.environ.get('VIETNAM_POST_API_KEY')
    GHN_API_KEY = os.environ.get('GHN_API_KEY')
    GHTK_API_KEY = os.environ.get('GHTK_API_KEY')
    
    # Performance settings
    PAGINATION_SIZE = 20
    MAX_SEARCH_RESULTS = 100
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = REDIS_URL
    RATELIMIT_DEFAULT = "100 per hour"
