import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from config import Config

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-for-development")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
    
    # Initialize extensions
    db.init_app(app)
    
    # Initialize cache
    from cache import cache
    cache.init_app(app)
    
    # Register blueprints
    from blueprints.customer import customer_bp
    from blueprints.tracking import tracking_bp
    from blueprints.booking import booking_bp
    
    app.register_blueprint(customer_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(booking_bp)
    
    # Create database tables
    with app.app_context():
        import models
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Database creation warning: {e}")
            # Continue without failing if tables already exist
    
    return app

# Create app instance
app = create_app()

# Main routes
@app.route('/')
def welcome():
    """Main welcome page with service options"""
    from flask import render_template, make_response
    resp = make_response(render_template('welcome.html'))
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp

@app.route('/sw.js')
def service_worker():
    """Serve the service worker file"""
    from flask import send_from_directory
    return send_from_directory('.', 'sw.js', mimetype='application/javascript')

@app.route('/debug')
def debug_sheet():
    """Debug endpoint to see sheet structure"""
    from flask import jsonify
    from services.google_sheets_service import GoogleSheetsService
    
    try:
        sheets_service = GoogleSheetsService()
        debug_info = sheets_service.debug_sheet_structure()
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({'error': str(e)})

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    from flask import render_template
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    from flask import render_template
    db.session.rollback()
    return render_template('base.html', error_message="Đã có lỗi xảy ra, vui lòng thử lại"), 500
