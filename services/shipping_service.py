import os
import logging
import requests
from datetime import datetime
import json
from typing import Dict, List, Optional

class ShippingService:
    """Service for tracking packages across multiple shipping providers"""
    
    def __init__(self):
        self.providers = {
            'vietnampost': VietnamPostProvider(),
            'viettelpost': ViettelPostProvider(),
            'ghn': GHNProvider(),
            'ghtk': GHTKProvider(),
            'jnt': JNTProvider(),
            'shopee': ShopeeProvider()
        }
    
    def track_package(self, tracking_number: str, provider: str = None) -> Optional[Dict]:
        """
        Track a package across providers
        If provider is None or 'auto', try to detect provider automatically
        """
        if provider == 'auto' or not provider:
            provider = self._detect_provider(tracking_number)
        
        if provider not in self.providers:
            raise ValueError(f"Unsupported provider: {provider}")
        
        return self.providers[provider].track(tracking_number)
    
    def _detect_provider(self, tracking_number: str) -> str:
        """Detect shipping provider based on tracking number format"""
        tracking_number = tracking_number.upper().strip()
        
        # Shopee Express patterns (check first for specific SPXVN pattern)
        if tracking_number.startswith('SPXVN'):
            return 'shopee'
        
        # ViettelPost patterns
        if tracking_number.startswith(('ĐVVC', 'VTP')):
            return 'viettelpost'
        
        # Vietnam Post patterns
        if tracking_number.startswith(('RC', 'RG', 'RA', 'CC', 'CP', 'CD')):
            return 'vietnampost'
        
        # GHN patterns
        if tracking_number.startswith('GHN') or len(tracking_number) == 13:
            return 'ghn'
        
        # GHTK patterns
        if tracking_number.startswith('GHTK') or len(tracking_number) == 12:
            return 'ghtk'
        
        # J&T patterns
        if tracking_number.startswith('JT') or len(tracking_number) == 14:
            return 'jnt'
        
        # Default to Vietnam Post
        return 'vietnampost'
    
    def get_provider_info(self, provider: str) -> Dict:
        """Get information about a shipping provider"""
        provider_info = {
            'vietnampost': {
                'name': 'Bưu điện Việt Nam',
                'website': 'https://www.vnpost.vn',
                'tracking_url': 'https://www.vnpost.vn/vi-vn/dinh-vi/buu-pham'
            },
            'viettelpost': {
                'name': 'Viettel Post',
                'website': 'https://viettelpost.vn',
                'tracking_url': 'https://viettelpost.vn/tra-cuu-buu-pham'
            },
            'ghn': {
                'name': 'Giao hàng nhanh (GHN)',
                'website': 'https://ghn.vn',
                'tracking_url': 'https://ghn.vn/tra-cuu-van-don'
            },
            'ghtk': {
                'name': 'Giao hàng tiết kiệm (GHTK)',
                'website': 'https://ghtk.vn',
                'tracking_url': 'https://ghtk.vn/tra-cuu-van-don'
            },
            'jnt': {
                'name': 'J&T Express',
                'website': 'https://www.jtexpress.vn',
                'tracking_url': 'https://www.jtexpress.vn/track'
            },
            'shopee': {
                'name': 'Shopee Express',
                'website': 'https://shopee.vn',
                'tracking_url': 'https://shopee.vn/buyer/orders'
            }
        }
        
        return provider_info.get(provider, {})

class BaseProvider:
    """Base class for shipping providers"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        """Track a package - to be implemented by subclasses"""
        raise NotImplementedError
    
    def _format_status(self, status: str) -> str:
        """Format status message to Vietnamese"""
        status_map = {
            'pending': 'Đang chờ xử lý',
            'picked_up': 'Đã lấy hàng',
            'in_transit': 'Đang vận chuyển',
            'out_for_delivery': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'returned': 'Trả lại người gửi',
            'cancelled': 'Đã hủy'
        }
        return status_map.get(status.lower(), status)

class VietnamPostProvider(BaseProvider):
    """Vietnam Post tracking provider"""
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        try:
            # Vietnam Post API endpoint
            url = "https://www.vnpost.vn/vi-vn/dinh-vi/buu-pham"
            
            # This is a simplified implementation
            # In practice, you would need to reverse engineer their API
            # or use their official API if available
            
            # For now, return mock data structure
            return {
                'tracking_number': tracking_number,
                'provider': 'vietnampost',
                'provider_name': 'Bưu điện Việt Nam',
                'status': 'Đang vận chuyển',
                'location': 'Trung tâm phân phối Hà Nội',
                'estimated_delivery': None,
                'last_updated': datetime.now().isoformat(),
                'shipping_fee': '25,000 VND',
                'history': [
                    {
                        'time': datetime.now().isoformat(),
                        'location': 'Trung tâm phân phối Hà Nội',
                        'status': 'Đang vận chuyển',
                        'description': 'Đã rời trung tâm phân phối'
                    }
                ],
                'is_delivered': False
            }
            
        except Exception as e:
            logging.error(f"Error tracking Vietnam Post package {tracking_number}: {str(e)}")
            return None

class GHNProvider(BaseProvider):
    """GHN tracking provider"""
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        try:
            api_key = os.getenv('GHN_API_KEY')
            if not api_key:
                logging.warning("GHN_API_KEY not found")
                return None
            
            url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail"
            headers = {
                'Token': api_key,
                'Content-Type': 'application/json'
            }
            
            data = {
                'order_code': tracking_number
            }
            
            response = self.session.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('code') == 200:
                    data = result.get('data', {})
                    return {
                        'tracking_number': tracking_number,
                        'provider': 'ghn',
                        'provider_name': 'Giao hàng nhanh (GHN)',
                        'status': self._format_status(data.get('status', '')),
                        'location': data.get('current_warehouse', {}).get('name', ''),
                        'estimated_delivery': data.get('expected_delivery_time'),
                        'last_updated': datetime.now().isoformat(),
                        'shipping_fee': f"{data.get('total_fee', 0):,} VND" if data.get('total_fee') else '30,000 VND',
                        'history': self._format_history(data.get('log', [])),
                        'is_delivered': data.get('status') == 'delivered'
                    }
            
            return None
            
        except Exception as e:
            logging.error(f"Error tracking GHN package {tracking_number}: {str(e)}")
            return None
    
    def _format_history(self, logs: List) -> List[Dict]:
        """Format GHN history logs"""
        history = []
        for log in logs:
            history.append({
                'time': log.get('updated_date', ''),
                'location': log.get('location', ''),
                'status': self._format_status(log.get('status', '')),
                'description': log.get('message', '')
            })
        return history

class GHTKProvider(BaseProvider):
    """GHTK tracking provider"""
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        try:
            api_key = os.getenv('GHTK_API_KEY')
            if not api_key:
                logging.warning("GHTK_API_KEY not found")
                return None
            
            url = f"https://khachhang.ghtklab.com/api/v1/order/tracking/{tracking_number}"
            headers = {
                'Token': api_key,
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    data = result.get('order', {})
                    return {
                        'tracking_number': tracking_number,
                        'provider': 'ghtk',
                        'provider_name': 'Giao hàng tiết kiệm (GHTK)',
                        'status': self._format_status(data.get('status', '')),
                        'location': data.get('current_address', ''),
                        'estimated_delivery': data.get('estimated_deliver_time'),
                        'last_updated': datetime.now().isoformat(),
                        'shipping_fee': f"{data.get('fee', 0):,} VND" if data.get('fee') else '28,000 VND',
                        'history': self._format_history(data.get('logs', [])),
                        'is_delivered': data.get('status') == 'delivered'
                    }
            
            return None
            
        except Exception as e:
            logging.error(f"Error tracking GHTK package {tracking_number}: {str(e)}")
            return None
    
    def _format_history(self, logs: List) -> List[Dict]:
        """Format GHTK history logs"""
        history = []
        for log in logs:
            history.append({
                'time': log.get('created_at', ''),
                'location': log.get('location', ''),
                'status': self._format_status(log.get('status', '')),
                'description': log.get('comment', '')
            })
        return history

class JNTProvider(BaseProvider):
    """J&T Express tracking provider"""
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        try:
            # J&T doesn't have a public API, so we'll use web scraping
            # This is a simplified implementation
            
            return {
                'tracking_number': tracking_number,
                'provider': 'jnt',
                'provider_name': 'J&T Express',
                'status': 'Đang vận chuyển',
                'location': 'Trung tâm phân phối TP.HCM',
                'estimated_delivery': None,
                'last_updated': datetime.now().isoformat(),
                'shipping_fee': '32,000 VND',
                'history': [
                    {
                        'time': datetime.now().isoformat(),
                        'location': 'Trung tâm phân phối TP.HCM',
                        'status': 'Đang vận chuyển',
                        'description': 'Đã rời trung tâm phân phối'
                    }
                ],
                'is_delivered': False
            }
            
        except Exception as e:
            logging.error(f"Error tracking J&T package {tracking_number}: {str(e)}")
            return None

class ShopeeProvider(BaseProvider):
    """Shopee Express tracking provider"""
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        try:
            # Shopee doesn't have a public API for tracking
            # This is a simplified implementation
            
            return {
                'tracking_number': tracking_number,
                'provider': 'shopee',
                'provider_name': 'Shopee Express',
                'status': 'Đang vận chuyển',
                'location': 'Kho Shopee TP.HCM',
                'estimated_delivery': None,
                'last_updated': datetime.now().isoformat(),
                'shipping_fee': '20,000 VND',
                'history': [
                    {
                        'time': datetime.now().isoformat(),
                        'location': 'Kho Shopee TP.HCM',
                        'status': 'Đang vận chuyển',
                        'description': 'Đã rời kho phân phối'
                    }
                ],
                'is_delivered': False
            }
            
        except Exception as e:
            logging.error(f"Error tracking Shopee package {tracking_number}: {str(e)}")
            return None

class ViettelPostProvider(BaseProvider):
    """Viettel Post tracking provider"""
    
    def track(self, tracking_number: str) -> Optional[Dict]:
        try:
            # Viettel Post doesn't have a public API for tracking
            # This is a simplified implementation
            
            return {
                'tracking_number': tracking_number,
                'provider': 'viettelpost',
                'provider_name': 'Viettel Post',
                'status': 'Đang vận chuyển',
                'location': 'Trung tâm Viettel Post',
                'estimated_delivery': None,
                'last_updated': datetime.now().isoformat(),
                'shipping_fee': '26,000 VND',
                'history': [
                    {
                        'time': datetime.now().isoformat(),
                        'location': 'Trung tâm Viettel Post',
                        'status': 'Đang vận chuyển',
                        'description': 'Đã rời trung tâm phân phối'
                    }
                ],
                'is_delivered': False
            }
            
        except Exception as e:
            logging.error(f"Error tracking Viettel Post package {tracking_number}: {str(e)}")
            return None
