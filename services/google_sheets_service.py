import os
import logging
import gspread
from google.oauth2.service_account import Credentials
import json
from datetime import datetime
from services.cache_service import CacheService

class GoogleSheetsService:
    """Enhanced Google Sheets service with caching"""
    
    def __init__(self):
        self.client = None
        self.sheet = None
        self.cache_service = CacheService()
        self.setup_client()
    
    def setup_client(self):
        """Initialize Google Sheets client"""
        try:
            credentials_json = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
            sheet_id = os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID')
            
            if not credentials_json:
                logging.error("GOOGLE_SHEETS_CREDENTIALS environment variable not found")
                return
                
            if not sheet_id:
                logging.error("GOOGLE_SHEETS_SPREADSHEET_ID environment variable not found")
                return
            
            credentials_info = json.loads(credentials_json)
            
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            
            credentials = Credentials.from_service_account_info(credentials_info, scopes=scope)
            self.client = gspread.authorize(credentials)
            
            self.spreadsheet = self.client.open_by_key(sheet_id)
            
            # Try to find the sheet with customer data
            potential_sheets = ['Sheet1', 'Sheet2', 'Form Responses 2']
            
            self.sheet = None
            for sheet_name in potential_sheets:
                try:
                    worksheet = self.spreadsheet.worksheet(sheet_name)
                    headers = worksheet.row_values(1)
                    customer_fields = ['customer code', 'code', 'member', 'name', 'points', 'rank']
                    
                    header_lower = [h.lower() for h in headers]
                    if any(field in ' '.join(header_lower) for field in customer_fields):
                        self.sheet = worksheet
                        logging.info(f"Using worksheet '{sheet_name}' with headers: {headers}")
                        break
                        
                except Exception as e:
                    logging.debug(f"Could not access worksheet '{sheet_name}': {str(e)}")
                    continue
            
            if not self.sheet:
                try:
                    self.sheet = self.spreadsheet.worksheet('Sheet1')
                    logging.info("Defaulting to Sheet1")
                except:
                    self.sheet = self.spreadsheet.sheet1
                    logging.info("Defaulting to first sheet")
            
            # Setup tracking sheet
            try:
                self.tracking_sheet = self.spreadsheet.worksheet('Sheet2')
                headers = self.tracking_sheet.row_values(1)
                logging.info(f"Tracking sheet (Sheet2) headers: {headers}")
            except Exception as e:
                logging.warning(f"Could not access tracking sheet 'Sheet2': {str(e)}")
                self.tracking_sheet = None
            
            logging.info("Google Sheets client initialized successfully")
            
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing Google Sheets credentials JSON: {str(e)}")
        except Exception as e:
            logging.error(f"Error setting up Google Sheets client: {str(e)}")
    
    def get_customer_data(self, customer_code):
        """
        Get customer data with caching
        """
        if not self.sheet:
            logging.error("Google Sheets client not initialized")
            return None
            
        try:
            # Get all records from the sheet
            records = self.sheet.get_all_records()
            
            # Search for the customer code
            for record in records:
                code_fields = ['MÃ KHÁCH HÀNG', 'Customer Code', 'customer_code', 'Code', 'code', 'CustomerCode']
                customer_code_value = None
                
                for field in code_fields:
                    if field in record and str(record[field]).strip().lower() == customer_code.lower():
                        customer_code_value = record[field]
                        break
                
                if customer_code_value:
                    # Get both customer name and Facebook name
                    customer_name = self._get_field_value(record, ['TÊN KHÁCH HÀNG', 'Name', 'name', 'Customer Name', 'customer_name'])
                    facebook_name = self._get_field_value(record, ['FACEBOOK NAME', 'Facebook Name', 'facebook_name'])
                    
                    customer_data = {
                        'code': str(customer_code_value),
                        'name': customer_name,
                        'facebook_name': facebook_name,
                        'birthday': self._get_field_value(record, ['NGÀY SINH', 'Birthday', 'birthday', 'Birth Date', 'birth_date']),
                        'points': self._get_field_value(record, ['ĐIỂM', 'Points', 'points', 'Point', 'point']),
                        'rank': self._get_field_value(record, ['HẠNG', 'Rank', 'rank', 'Level', 'level', 'Tier', 'tier']),
                        'yearly_points': self._get_field_value(record, ['ĐIỂM TÍCH LUỸ TRONG NĂM', 'Yearly Points', 'yearly_points', 'Annual Points']),
                        'point_conversion': self._get_field_value(record, ['QUY ĐỔI ĐIỂM', 'Point Conversion', 'point_conversion', 'Points Exchange']),
                        'membership_vouchers': self._get_field_value(record, ['VOUCHERS ƯU ĐÃI CHO MEMBERSHIP', 'Membership Vouchers', 'membership_vouchers']),
                        'used_vouchers': self._get_field_value(record, ['VOUCHERS ĐÃ SỬ DỤNG', 'Used Vouchers', 'used_vouchers']),
                        'remaining_vouchers': self._get_field_value(record, ['VOUCHER CÒN LẠI', 'Remaining Vouchers', 'remaining_vouchers']),
                        'last_updated': datetime.now().isoformat()
                    }
                    
                    logging.info(f"Found customer data for code: {customer_code}")
                    return customer_data
            
            logging.info(f"No customer found with code: {customer_code}")
            return None
            
        except Exception as e:
            logging.error(f"Error fetching customer data: {str(e)}")
            raise
    
    def get_tracking_data(self, search_term):
        """
        Get tracking data from Sheet2 with customer membership information
        Supports search by tracking number (MÃ VẬN ĐƠN) or customer code (MÃ KHÁCH HÀNG)
        """
        if not self.tracking_sheet:
            logging.error("Tracking sheet not initialized")
            return None
            
        try:
            # Check cache first
            cached_data = self.cache_service.get_tracking_data(search_term, 'google_sheets')
            if cached_data:
                logging.info(f"Found cached tracking data for: {search_term}")
                return cached_data
            
            # Fetch from Google Sheets
            records = self.tracking_sheet.get_all_records()
            
            for record in records:
                # Check both tracking number and customer code fields
                tracking_value = self._get_field_value(record, [
                    'MÃ VẬN ĐƠN', 'TRACKING NUMBER', 'TRACKING CODE', 'VẬN ĐƠN', 'Tracking Number', 'tracking_number'
                ])
                
                customer_code = self._get_field_value(record, [
                    'MÃ KHÁCH HÀNG', 'CUSTOMER CODE', 'CODE', 'Member Code', 'customer_code'
                ])
                
                # Check if search term matches either tracking number or customer code
                if (tracking_value and str(tracking_value).strip() == str(search_term).strip()) or \
                   (customer_code and str(customer_code).strip() == str(search_term).strip()):
                    
                    # Get customer membership data if customer code exists
                    customer_data = None
                    if customer_code:
                        customer_data = self.get_customer_data(customer_code)
                    
                    # Extract tracking data
                    tracking_data = {
                        'tracking_number': tracking_value or search_term,
                        'customer_code': customer_code,
                        'customer_name': self._get_field_value(record, [
                            'TÊN KHÁCH HÀNG', 'CUSTOMER NAME', 'NAME', 'NGƯỜI NHẬN', 'Customer Name', 'customer_name'
                        ]),
                        'customer_phone': self._get_field_value(record, [
                            'SỐ ĐIỆN THOẠI', 'PHONE', 'PHONE NUMBER', 'ĐIỆN THOẠI', 'Phone', 'phone'
                        ]),
                        'address': self._get_field_value(record, [
                            'ĐỊA CHỈ', 'ADDRESS', 'DELIVERY ADDRESS', 'ĐỊA CHỈ GIAO', 'Address', 'address'
                        ]),
                        'status': self._get_field_value(record, [
                            'TRẠNG THÁI', 'STATUS', 'DELIVERY STATUS', 'TÌNH TRẠNG', 'Status', 'status', 'TÌNH TRẠNG'
                        ]),
                        'shipping_provider': self._get_field_value(record, [
                            'ĐƠN VỊ VẬN CHUYỂN', 'SHIPPING PROVIDER', 'CARRIER', 'TRANSPORTER', 'Shipping Provider', 'shipping_provider'
                        ]),
                        'order_date': self._get_field_value(record, [
                            'NGÀY ĐẶT', 'ORDER DATE', 'DATE ORDERED', 'NGÀY TẠO', 'Order Date', 'order_date'
                        ]),
                        'delivery_date': self._get_field_value(record, [
                            'NGÀY GIAO', 'DELIVERY DATE', 'DELIVERED DATE', 'NGÀY NHẬN', 'Delivery Date', 'delivery_date'
                        ]),
                        'product_name': self._get_field_value(record, [
                            'TÊN SẢN PHẨM', 'PRODUCT NAME', 'PRODUCT', 'SẢN PHẨM', 'Product Name', 'product_name'
                        ]),
                        'total_amount': self._get_field_value(record, [
                            'TỔNG TIỀN', 'TOTAL AMOUNT', 'AMOUNT', 'GIÁ TRỊ', 'Total Amount', 'total_amount'
                        ]),
                        'shipping_fee': self._format_shipping_fee(self._get_field_value(record, [
                            'CƯỚC PHÍ VẬN CHUYỂN', 'SHIPPING FEE', 'DELIVERY FEE', 'PHÍ VẬN CHUYỂN', 'Shipping Fee', 'shipping_fee'
                        ])),
                        'notes': self._get_field_value(record, [
                            'GHI CHÚ', 'NOTES', 'REMARKS', 'COMMENT', 'Notes', 'notes'
                        ]),
                        'last_updated': datetime.now().isoformat(),
                        
                        # Add customer membership data if available
                        'customer_data': customer_data,
                        'search_type': 'customer_code' if customer_code and str(customer_code).strip() == str(search_term).strip() else 'tracking_number'
                    }
                    
                    # Cache the data
                    self.cache_service.set_tracking_data(search_term, 'google_sheets', tracking_data)
                    
                    logging.info(f"Found tracking data for: {search_term}")
                    return tracking_data
                    
            logging.info(f"No tracking data found for: {search_term}")
            return None
            
        except Exception as e:
            logging.error(f"Error fetching tracking data for {search_term}: {str(e)}")
            return None
    
    def _get_field_value(self, record, possible_fields):
        """Helper method to get field value from record with multiple possible field names"""
        for field in possible_fields:
            if field in record:
                value = record[field]
                if value is not None and str(value).strip():
                    return str(value).strip()
        return ''
    
    def _format_shipping_fee(self, fee_value):
        """Format shipping fee value from Google Sheets"""
        if not fee_value:
            return ''
        
        # Remove any extra whitespace
        fee_value = str(fee_value).strip()
        
        # If it's already formatted with VND, return as is
        if 'VND' in fee_value.upper():
            return fee_value
        
        # If it's a number, format it with VND
        try:
            # Try to parse as number and format with thousand separators
            if fee_value.replace(',', '').replace('.', '').isdigit():
                number = int(fee_value.replace(',', '').replace('.', ''))
                return f"{number:,} VND"
        except:
            pass
        
        # Return as is if can't format
        return fee_value
    
    def get_all_customers(self, page=1, per_page=20):
        """Get paginated customer data"""
        if not self.sheet:
            return [], 0
            
        try:
            records = self.sheet.get_all_records()
            total = len(records)
            
            # Calculate pagination
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            
            customers = []
            for record in records[start_idx:end_idx]:
                customer_data = {
                    'code': self._get_field_value(record, ['MÃ KHÁCH HÀNG', 'Customer Code', 'customer_code', 'Code', 'code']),
                    'name': self._get_field_value(record, ['TÊN KHÁCH HÀNG', 'Name', 'name', 'Customer Name']),
                    'points': self._get_field_value(record, ['ĐIỂM', 'Points', 'points', 'Point']),
                    'rank': self._get_field_value(record, ['HẠNG', 'Rank', 'rank', 'Level', 'Tier'])
                }
                customers.append(customer_data)
            
            return customers, total
            
        except Exception as e:
            logging.error(f"Error fetching all customers: {str(e)}")
            return [], 0
    
    def test_connection(self):
        """Test the Google Sheets connection"""
        if not self.sheet:
            return False, "Google Sheets client not initialized"
            
        try:
            self.sheet.row_values(1)
            return True, "Connection successful"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"
    
    def debug_sheet_structure(self):
        """Debug method to see sheet structure and sample data"""
        if not self.client:
            return {"error": "Client not initialized"}
            
        try:
            sheet_id = os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID')
            if not sheet_id:
                return {"error": "GOOGLE_SHEETS_SPREADSHEET_ID not found"}
                
            spreadsheet = self.client.open_by_key(sheet_id)
            worksheets = spreadsheet.worksheets()
            
            result = {
                "worksheets": [],
                "current_sheet": None,
                "sample_data": None
            }
            
            for ws in worksheets:
                result["worksheets"].append(ws.title)
            
            if self.sheet:
                result["current_sheet"] = self.sheet.title
                try:
                    all_values = self.sheet.get_all_values()
                    result["sample_data"] = all_values[:5] if all_values else []
                    result["total_rows"] = len(all_values)
                except Exception as e:
                    result["sample_data_error"] = str(e)
            
            return result
            
        except Exception as e:
            return {"error": str(e)}
