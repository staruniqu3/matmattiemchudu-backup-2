from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from services.shipping_service import ShippingService
from services.cache_service import CacheService
from services.google_sheets_service import GoogleSheetsService
from utils.decorators import rate_limit
from models import TrackingQuery
from app import db
import logging

tracking_bp = Blueprint('tracking', __name__, url_prefix='/tracking')

@tracking_bp.route('/')
def index():
    """Package tracking form"""
    return render_template('tracking/index.html')

@tracking_bp.route('/search', methods=['POST'])
@rate_limit("15 per minute")
def search_package():
    """Handle package tracking search"""
    tracking_number = request.form.get('tracking_number', '').strip()
    provider = request.form.get('provider', '').strip()
    
    if not tracking_number:
        flash('Vui lòng nhập mã vận đơn', 'error')
        return redirect(url_for('tracking.index'))
    
    # Log the query
    query_log = TrackingQuery(
        tracking_number=tracking_number,
        shipping_provider=provider,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent', '')[:500]
    )
    
    try:
        # First try Google Sheets data
        sheets_service = GoogleSheetsService()
        tracking_data = sheets_service.get_tracking_data(tracking_number)
        
        # If not found in Google Sheets, try external shipping providers
        if not tracking_data:
            cache_service = CacheService()
            tracking_data = cache_service.get_tracking_data(tracking_number, provider)
            
            if not tracking_data:
                # Query shipping service
                shipping_service = ShippingService()
                tracking_data = shipping_service.track_package(tracking_number, provider)
                
                if tracking_data:
                    # Cache the result
                    cache_service.set_tracking_data(tracking_number, provider, tracking_data)
        
        # If we have Google Sheets data but no shipping fee, try to get it from shipping provider
        elif tracking_data and not tracking_data.get('shipping_fee'):
            try:
                shipping_service = ShippingService()
                provider_data = shipping_service.track_package(tracking_number, provider)
                if provider_data and provider_data.get('shipping_fee'):
                    tracking_data['shipping_fee'] = provider_data['shipping_fee']
            except Exception as e:
                logging.warning(f"Failed to get shipping fee from provider: {str(e)}")
        
        if tracking_data:
            query_log.success = True
            db.session.add(query_log)
            db.session.commit()
            
            # Use the enhanced template for Google Sheets data
            if tracking_data.get('customer_data'):
                return render_template('tracking/sheets_results.html', 
                                     tracking_data=tracking_data,
                                     customer_data=tracking_data['customer_data'])
            else:
                return render_template('tracking/results.html', 
                                     tracking_data=tracking_data,
                                 tracking_number=tracking_number)
        else:
            query_log.success = False
            query_log.error_message = "Không tìm thấy thông tin vận đơn"
            db.session.add(query_log)
            db.session.commit()
            
            flash(f'Không tìm thấy thông tin cho mã vận đơn: {tracking_number}', 'error')
            return redirect(url_for('tracking.index'))
            
    except Exception as e:
        logging.error(f"Error tracking package {tracking_number}: {str(e)}")
        
        query_log.success = False
        query_log.error_message = str(e)
        db.session.add(query_log)
        db.session.commit()
        
        flash('Có lỗi xảy ra khi tra cứu vận đơn. Vui lòng thử lại sau.', 'error')
        return redirect(url_for('tracking.index'))

@tracking_bp.route('/api/track/<tracking_number>')
@rate_limit("30 per minute")
def api_track_package(tracking_number):
    """API endpoint for package tracking"""
    provider = request.args.get('provider', '')
    
    try:
        cache_service = CacheService()
        tracking_data = cache_service.get_tracking_data(tracking_number, provider)
        
        if not tracking_data:
            shipping_service = ShippingService()
            tracking_data = shipping_service.track_package(tracking_number, provider)
            
            if tracking_data:
                cache_service.set_tracking_data(tracking_number, provider, tracking_data)
        
        if tracking_data:
            return jsonify({
                'success': True,
                'data': tracking_data
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Không tìm thấy thông tin cho mã vận đơn: {tracking_number}'
            }), 404
            
    except Exception as e:
        logging.error(f"API Error tracking package {tracking_number}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi tra cứu vận đơn. Vui lòng thử lại sau.'
        }), 500

@tracking_bp.route('/providers')
def providers():
    """Get available shipping providers"""
    providers = [
        {'id': 'vietnampost', 'name': 'Bưu điện Việt Nam'},
        {'id': 'ghn', 'name': 'Giao hàng nhanh (GHN)'},
        {'id': 'ghtk', 'name': 'Giao hàng tiết kiệm (GHTK)'},
        {'id': 'jnt', 'name': 'J&T Express'},
        {'id': 'shopee', 'name': 'Shopee Express'},
        {'id': 'auto', 'name': 'Tự động nhận diện'}
    ]
    
    return jsonify({
        'success': True,
        'providers': providers
    })
