import logging
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from cache import cache, get_cache_key
from models import CustomerData, PackageStatus
from app import db

class CacheService:
    """Service for caching data with Redis and database fallback"""
    
    def __init__(self):
        self.customer_cache_timeout = 600  # 10 minutes
        self.tracking_cache_timeout = 300  # 5 minutes
    
    def get_customer_data(self, customer_code: str) -> Optional[Dict]:
        """Get customer data from cache or database"""
        try:
            # Try Redis cache first
            cache_key = get_cache_key('customer', customer_code)
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return cached_data
            
            # Try database cache
            db_customer = CustomerData.query.filter_by(
                customer_code=customer_code,
                is_active=True
            ).first()
            
            if db_customer:
                # Check if data is not too old (1 hour)
                if datetime.utcnow() - db_customer.last_updated < timedelta(hours=1):
                    customer_data = db_customer.to_dict()
                    
                    # Cache in Redis
                    cache.set(cache_key, customer_data, timeout=self.customer_cache_timeout)
                    
                    return customer_data
            
            return None
            
        except Exception as e:
            logging.error(f"Error getting customer data from cache: {str(e)}")
            return None
    
    def set_customer_data(self, customer_code: str, data: Dict) -> bool:
        """Set customer data in cache and database"""
        try:
            # Cache in Redis
            cache_key = get_cache_key('customer', customer_code)
            cache.set(cache_key, data, timeout=self.customer_cache_timeout)
            
            # Update or create in database
            db_customer = CustomerData.query.filter_by(
                customer_code=customer_code
            ).first()
            
            if db_customer:
                db_customer.name = data.get('name', '')
                db_customer.points = data.get('points', '')
                db_customer.rank = data.get('rank', '')
                db_customer.last_updated = datetime.utcnow()
                db_customer.is_active = True
            else:
                db_customer = CustomerData(
                    customer_code=customer_code,
                    name=data.get('name', ''),
                    points=data.get('points', ''),
                    rank=data.get('rank', ''),
                    last_updated=datetime.utcnow(),
                    is_active=True
                )
                db.session.add(db_customer)
            
            db.session.commit()
            return True
            
        except Exception as e:
            logging.error(f"Error setting customer data in cache: {str(e)}")
            db.session.rollback()
            return False
    
    def get_tracking_data(self, tracking_number: str, provider: str) -> Optional[Dict]:
        """Get tracking data from cache or database"""
        try:
            # Try Redis cache first
            cache_key = get_cache_key('tracking', tracking_number, provider)
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return cached_data
            
            # Try database cache
            db_tracking = PackageStatus.query.filter_by(
                tracking_number=tracking_number,
                shipping_provider=provider
            ).first()
            
            if db_tracking:
                # Check if data is not too old (5 minutes)
                if datetime.utcnow() - db_tracking.last_updated < timedelta(minutes=5):
                    tracking_data = db_tracking.to_dict()
                    
                    # Parse history JSON
                    if db_tracking.status_history:
                        tracking_data['history'] = json.loads(db_tracking.status_history)
                    
                    # Cache in Redis
                    cache.set(cache_key, tracking_data, timeout=self.tracking_cache_timeout)
                    
                    return tracking_data
            
            return None
            
        except Exception as e:
            logging.error(f"Error getting tracking data from cache: {str(e)}")
            return None
    
    def set_tracking_data(self, tracking_number: str, provider: str, data: Dict) -> bool:
        """Set tracking data in cache and database"""
        try:
            # Cache in Redis
            cache_key = get_cache_key('tracking', tracking_number, provider)
            cache.set(cache_key, data, timeout=self.tracking_cache_timeout)
            
            # Update or create in database
            db_tracking = PackageStatus.query.filter_by(
                tracking_number=tracking_number,
                shipping_provider=provider
            ).first()
            
            history_json = json.dumps(data.get('history', []))
            estimated_delivery = None
            
            if data.get('estimated_delivery'):
                try:
                    estimated_delivery = datetime.fromisoformat(data['estimated_delivery'].replace('Z', '+00:00'))
                except:
                    pass
            
            if db_tracking:
                db_tracking.status = data.get('status', '')
                db_tracking.location = data.get('location', '')
                db_tracking.estimated_delivery = estimated_delivery
                db_tracking.last_updated = datetime.utcnow()
                db_tracking.status_history = history_json
                db_tracking.is_delivered = data.get('is_delivered', False)
            else:
                db_tracking = PackageStatus(
                    tracking_number=tracking_number,
                    shipping_provider=provider,
                    status=data.get('status', ''),
                    location=data.get('location', ''),
                    estimated_delivery=estimated_delivery,
                    last_updated=datetime.utcnow(),
                    status_history=history_json,
                    is_delivered=data.get('is_delivered', False)
                )
                db.session.add(db_tracking)
            
            db.session.commit()
            return True
            
        except Exception as e:
            logging.error(f"Error setting tracking data in cache: {str(e)}")
            db.session.rollback()
            return False
    
    def clear_expired_cache(self):
        """Clear expired cache entries from database"""
        try:
            # Clear old customer data (24 hours)
            cutoff_customer = datetime.utcnow() - timedelta(hours=24)
            CustomerData.query.filter(
                CustomerData.last_updated < cutoff_customer
            ).delete()
            
            # Clear old tracking data (1 hour)
            cutoff_tracking = datetime.utcnow() - timedelta(hours=1)
            PackageStatus.query.filter(
                PackageStatus.last_updated < cutoff_tracking
            ).delete()
            
            db.session.commit()
            logging.info("Expired cache entries cleared")
            
        except Exception as e:
            logging.error(f"Error clearing expired cache: {str(e)}")
            db.session.rollback()
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            stats = {
                'customers_cached': CustomerData.query.count(),
                'packages_cached': PackageStatus.query.count(),
                'active_customers': CustomerData.query.filter_by(is_active=True).count(),
                'delivered_packages': PackageStatus.query.filter_by(is_delivered=True).count()
            }
            return stats
            
        except Exception as e:
            logging.error(f"Error getting cache stats: {str(e)}")
            return {}
