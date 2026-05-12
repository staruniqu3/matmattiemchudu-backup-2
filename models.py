from app import db
from datetime import datetime
from sqlalchemy import Index

class CustomerData(db.Model):
    """Cached customer data from Google Sheets"""
    __tablename__ = 'customer_data'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    points = db.Column(db.String(50))
    rank = db.Column(db.String(100))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'code': self.customer_code,
            'name': self.name,
            'points': self.points,
            'rank': self.rank,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

class TrackingQuery(db.Model):
    """Track package tracking queries for analytics"""
    __tablename__ = 'tracking_queries'
    
    id = db.Column(db.Integer, primary_key=True)
    tracking_number = db.Column(db.String(100), nullable=False, index=True)
    shipping_provider = db.Column(db.String(50))
    query_time = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    success = db.Column(db.Boolean, default=False)
    error_message = db.Column(db.Text)
    
    # Create indexes for performance
    __table_args__ = (
        Index('idx_tracking_queries_time', 'query_time'),
        Index('idx_tracking_queries_provider', 'shipping_provider'),
    )

class PackageStatus(db.Model):
    """Cache package status information"""
    __tablename__ = 'package_status'
    
    id = db.Column(db.Integer, primary_key=True)
    tracking_number = db.Column(db.String(100), nullable=False, index=True)
    shipping_provider = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(100))
    location = db.Column(db.String(200))
    estimated_delivery = db.Column(db.DateTime)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    status_history = db.Column(db.Text)  # JSON string
    is_delivered = db.Column(db.Boolean, default=False)
    
    # Composite index for efficient lookups
    __table_args__ = (
        Index('idx_package_status_tracking_provider', 'tracking_number', 'shipping_provider'),
    )
    
    def to_dict(self):
        return {
            'tracking_number': self.tracking_number,
            'shipping_provider': self.shipping_provider,
            'status': self.status,
            'location': self.location,
            'estimated_delivery': self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'status_history': self.status_history,
            'is_delivered': self.is_delivered
        }

class SystemMetrics(db.Model):
    """System performance metrics"""
    __tablename__ = 'system_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_system_metrics_name_time', 'metric_name', 'timestamp'),
    )
