from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from utils.decorators import rate_limit, cache_result
from utils.helpers import validate_input, get_client_ip
import logging

booking_bp = Blueprint('booking', __name__, url_prefix='/booking')

@booking_bp.route('/')
def index():
    """Booking/Order selection page"""
    return render_template('booking/index.html')

@booking_bp.route('/event')
def event():
    """Event booking page with form and rules"""
    return render_template('booking/event.html')

@booking_bp.route('/order')
def order():
    """Order/Pickup page"""
    return render_template('booking/order.html')

@booking_bp.route('/event/form')
def event_form():
    """Event booking form"""
    return render_template('booking/event_form.html')

# Removed event_rules route - now using external URL

@booking_bp.route('/submit-event-booking', methods=['POST'])
@rate_limit("10 per minute")
def submit_event_booking():
    """Handle event booking form submission"""
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        event_type = request.form.get('event_type', '').strip()
        event_date = request.form.get('event_date', '').strip()
        participants = request.form.get('participants', '').strip()
        notes = request.form.get('notes', '').strip()
        
        # Validate required fields
        if not all([name, email, phone, event_type, event_date, participants]):
            flash('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error')
            return redirect(url_for('booking.event_form'))
        
        # Validate email format
        email_validation = validate_input('email', email)
        if not email_validation['valid']:
            flash(email_validation['message'], 'error')
            return redirect(url_for('booking.event_form'))
        
        # Validate phone format
        phone_validation = validate_input('phone', phone)
        if not phone_validation['valid']:
            flash(phone_validation['message'], 'error')
            return redirect(url_for('booking.event_form'))
        
        # Here you would typically save to database or send to Google Sheets
        # For now, we'll just show success message
        flash('Đặt vé sự kiện thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 'success')
        return redirect(url_for('booking.event'))
        
    except Exception as e:
        logging.error(f"Error submitting event booking: {str(e)}")
        flash('Đã có lỗi xảy ra. Vui lòng thử lại sau.', 'error')
        return redirect(url_for('booking.event_form'))

@booking_bp.route('/submit-order', methods=['POST'])
@rate_limit("10 per minute")
def submit_order():
    """Handle order/pickup form submission"""
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        phone = request.form.get('phone', '').strip()
        order_type = request.form.get('order_type', '').strip()
        pickup_time = request.form.get('pickup_time', '').strip()
        items = request.form.get('items', '').strip()
        notes = request.form.get('notes', '').strip()
        
        # Validate required fields
        if not all([name, phone, order_type, pickup_time]):
            flash('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error')
            return redirect(url_for('booking.order'))
        
        # Validate phone format
        phone_validation = validate_input('phone', phone)
        if not phone_validation['valid']:
            flash(phone_validation['message'], 'error')
            return redirect(url_for('booking.order'))
        
        # Here you would typically save to database or send to Google Sheets
        # For now, we'll just show success message
        flash('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 'success')
        return redirect(url_for('booking.order'))
        
    except Exception as e:
        logging.error(f"Error submitting order: {str(e)}")
        flash('Đã có lỗi xảy ra. Vui lòng thử lại sau.', 'error')
        return redirect(url_for('booking.order'))