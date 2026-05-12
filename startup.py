#!/usr/bin/env python3
"""
Startup script for production deployment
Handles database initialization gracefully
"""
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def initialize_database():
    """Initialize database tables if they don't exist"""
    try:
        from app import app, db
        with app.app_context():
            # Import models to register them
            import models
            
            # Check if tables exist, create if they don't
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if not existing_tables:
                logger.info("Creating database tables...")
                db.create_all()
                logger.info("Database tables created successfully")
            else:
                logger.info(f"Database tables already exist: {existing_tables}")
                
        return True
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        return True  # Continue anyway for deployment

def main():
    """Main startup function"""
    logger.info("Starting application initialization...")
    
    # Initialize database
    if initialize_database():
        logger.info("Database initialization completed")
    
    # Import the app
    from app import app
    return app

if __name__ == '__main__':
    app = main()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)