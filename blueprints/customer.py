from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from services.google_sheets_service import GoogleSheetsService
from services.cache_service import CacheService
from utils.decorators import rate_limit
import logging

customer_bp = Blueprint('customer', __name__, url_prefix='/customer')

@customer_bp.route('/')
@customer_bp.route('/lookup')
def index():
    """Customer lookup form"""
    return render_template('customer/index.html')

@customer_bp.route('/lookup', methods=['POST'])
@rate_limit("10 per minute")
def lookup_customer():
    """Handle customer code lookup with caching"""
    customer_code = request.form.get('customer_code', '').strip()
    
    if not customer_code:
        flash('Vui lòng nhập mã khách hàng', 'error')
        return redirect(url_for('customer.index'))
    
    try:
        # Fetch directly from Google Sheets to get all fields
        sheets_service = GoogleSheetsService()
        customer_data = sheets_service.get_customer_data(customer_code)
        
        if not customer_data:
            # Try cache as fallback
            cache_service = CacheService()
            customer_data = cache_service.get_customer_data(customer_code)
        
        if customer_data:
            return render_template('customer/index.html', 
                                 customer_data=customer_data, 
                                 searched_code=customer_code)
        else:
            flash(f'Không tìm thấy khách hàng với mã: {customer_code}', 'error')
            return redirect(url_for('customer.index'))
            
    except Exception as e:
        logging.error(f"Error looking up customer {customer_code}: {str(e)}")
        flash('Có lỗi xảy ra khi tra cứu thông tin. Vui lòng thử lại sau.', 'error')
        return redirect(url_for('customer.index'))

@customer_bp.route('/api/lookup/<customer_code>')
@rate_limit("20 per minute")
def api_lookup_customer(customer_code):
    """API endpoint for customer lookup"""
    try:
        # Fetch directly from Google Sheets to get all fields
        sheets_service = GoogleSheetsService()
        customer_data = sheets_service.get_customer_data(customer_code)
        
        if not customer_data:
            # Try cache as fallback
            cache_service = CacheService()
            customer_data = cache_service.get_customer_data(customer_code)
        
        if customer_data:
            return jsonify({
                'success': True,
                'data': customer_data
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Không tìm thấy khách hàng với mã: {customer_code}'
            }), 404
            
    except Exception as e:
        logging.error(f"API Error looking up customer {customer_code}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi tra cứu thông tin. Vui lòng thử lại sau.'
        }), 500

@customer_bp.route('/embed')
def embed():
    """Embeddable version of the membership lookup"""
    return render_template('customer/embed.html')

@customer_bp.route('/embed-code')
def embed_code():
    """Generate HTML embed code"""
    request_url = request.url_root
    
    embed_html = f'''<!-- Mát Mát Lookup Widget -->
<iframe 
    src="{request_url}customer/embed" 
    width="100%" 
    height="600" 
    frameborder="0" 
    style="border: 1px solid #ddd; border-radius: 8px; max-width: 800px;">
</iframe>
<!-- End Mát Mát Lookup Widget -->'''
    
    wordpress_shortcode = f'[iframe src="{request_url}customer/embed" width="100%" height="600" frameborder="0"]'
    
    wordpress_html_block = f'''<!-- wp:html -->
<div style="max-width: 800px; margin: 0 auto;">
    <iframe 
        src="{request_url}customer/embed" 
        width="100%" 
        height="600" 
        frameborder="0" 
        style="border: 1px solid #ddd; border-radius: 8px; display: block;">
    </iframe>
</div>
<!-- /wp:html -->'''
    
    return render_template('customer/embed_code.html', 
                         embed_html=embed_html, 
                         wordpress_shortcode=wordpress_shortcode,
                         wordpress_html_block=wordpress_html_block,
                         app_url=request_url)
