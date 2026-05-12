// Lightweight Coupon System for Easter Eggs
(function() {
    'use strict';
    
    const CouponSystem = {
        // Coupon database (very lightweight)
        coupons: [
            { code: 'MATMAT10', discount: '10k', description: 'Giảm 10k cho đơn hàng tiếp theo' },
            { code: 'CHUDU15', discount: '15k', description: 'Voucher 15k cho dịch vụ Chu Du' },
            { code: 'MAGIC20', discount: '20k', description: 'Mã giảm giá đặc biệt 20k' },
            { code: 'LUCKY25', discount: '25k', description: 'Voucher may mắn 25k' },
            { code: 'WEATHER5', discount: '5k', description: 'Phần thưởng thời tiết 5k' },
            { code: 'PARTY50', discount: '50k', description: 'Voucher tiệc tùng 50k' },
            { code: 'SECRET30', discount: '30k', description: 'Mã bí mật 30k' },
            { code: 'VOUCHER12', discount: '12k', description: 'Mã giảm giá voucher hunter 12k' },
            { code: 'SALE18', discount: '18k', description: 'Voucher sale hunter 18k' },
            { code: 'FREESHIP8', discount: '8k', description: 'Mã miễn phí vận chuyển 8k' },
            { code: 'DISCOUNT22', discount: '22k', description: 'Discount master 22k' },
            { code: 'GIAMGIA35', discount: '35k', description: 'Voucher giảm giá đặc biệt 35k' },
            { code: 'KHUYENMAI40', discount: '40k', description: 'Mã khuyến mãi siêu hot 40k' }
        ],
        
        // Track used coupons in localStorage (prevents spam)
        usedCoupons: JSON.parse(localStorage.getItem('matmat_used_coupons') || '[]'),
        
        // Coupon cooldown (24 hours)
        lastCouponTime: parseInt(localStorage.getItem('matmat_last_coupon') || '0'),
        
        init: function() {
            // Attach to existing Easter egg system
            this.attachToEasterEggs();
        },
        
        attachToEasterEggs: function() {
            // Listen for Easter egg triggers
            document.addEventListener('easterEggTriggered', (event) => {
                const triggerType = event.detail.type;
                this.maybeShowCoupon(triggerType);
            });
        },
        
        maybeShowCoupon: function(triggerType) {
            // Random chance (15% for most triggers, 35% for special ones) - PRODUCTION MODE
            const specialTriggers = ['konami', 'corners', 'party-mode'];
            const chance = specialTriggers.includes(triggerType) ? 0.35 : 0.15;
            
            if (Math.random() > chance) return;
            
            // Check cooldown (24 hours)
            const now = Date.now();
            if (now - this.lastCouponTime < 24 * 60 * 60 * 1000) {
                this.showCooldownMessage();
                return;
            }
            
            // Get available coupons
            const availableCoupons = this.coupons.filter(c => !this.usedCoupons.includes(c.code));
            if (availableCoupons.length === 0) {
                this.showNoMoreCouponsMessage();
                return;
            }
            
            // Select random coupon
            const coupon = availableCoupons[Math.floor(Math.random() * availableCoupons.length)];
            this.showCoupon(coupon, triggerType);
        },
        
        showCoupon: function(coupon, triggerType) {
            // Hide any existing Easter egg messages first
            const existingMessages = document.querySelectorAll('.easter-egg-message');
            existingMessages.forEach(msg => msg.remove());
            
            // Create coupon popup
            const popup = document.createElement('div');
            popup.className = 'coupon-popup';
            popup.innerHTML = `
                <div class="coupon-content">
                    <div class="coupon-header">
                        <i class="fas fa-gift"></i>
                        <h3>🎉 Chúc mừng! Bạn nhận được voucher!</h3>
                    </div>
                    <div class="coupon-body">
                        <div class="coupon-value">Giảm ${coupon.discount}</div>
                        <div class="coupon-code" onclick="CouponSystem.selectCouponCode(this)" title="Click để chọn mã">${coupon.code}</div>
                        <div class="coupon-description">${coupon.description}</div>
                        <div class="coupon-note">
                            <i class="fas fa-clock"></i>
                            Hạn sử dụng: 30 ngày từ hôm nay
                        </div>
                    </div>
                    <div class="coupon-actions">
                        <button class="copy-coupon-btn" onclick="CouponSystem.copyCoupon('${coupon.code}')">
                            <i class="fas fa-copy"></i> Copy mã
                        </button>
                        <button class="close-coupon-btn" onclick="CouponSystem.closeCoupon()">
                            <i class="fas fa-times"></i> Đóng
                        </button>
                    </div>

                </div>
            `;
            
            document.body.appendChild(popup);
            
            // Animate in
            setTimeout(() => popup.classList.add('show'), 100);
            
            // Mark as used and update storage
            this.usedCoupons.push(coupon.code);
            this.lastCouponTime = Date.now();
            this.updateStorage();
            
            // Auto close after 15 seconds
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    this.closeCoupon();
                }
            }, 15000);
        },
        
        selectCouponCode: function(element) {
            // Select the text in the coupon code element
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Flash effect
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = '';
            }, 150);
        },
        
        copyCoupon: function(code) {
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('.copy-coupon-btn');
                const originalText = btn.innerHTML;
                const originalStyle = btn.style.background;
                
                btn.innerHTML = '<i class="fas fa-check"></i> Đã copy!';
                btn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                btn.style.transform = 'scale(1.05)';
                
                // Flash the coupon code
                const codeElement = document.querySelector('.coupon-code');
                codeElement.style.background = '#28a745';
                codeElement.style.color = 'white';
                codeElement.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = originalStyle;
                    btn.style.transform = '';
                    
                    codeElement.style.background = '';
                    codeElement.style.color = '';
                    codeElement.style.transform = '';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    this.showMessage('Đã copy mã: ' + code, 'success');
                } catch (err) {
                    this.showMessage('Mã coupon: ' + code + ' (Vui lòng copy thủ công)', 'info');
                }
                
                document.body.removeChild(textArea);
            });
        },
        
        closeCoupon: function() {
            const popup = document.querySelector('.coupon-popup');
            if (popup) {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 300);
            }
        },
        
        showCooldownMessage: function() {
            const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - this.lastCouponTime);
            const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
            
            // Create proper modal instead of simple message
            const popup = document.createElement('div');
            popup.className = 'coupon-popup';
            popup.innerHTML = `
                <div class="coupon-content">
                    <div class="coupon-header">
                        <i class="fas fa-clock"></i>
                        <h3>⏰ Đã nhận voucher hôm nay!</h3>
                    </div>
                    <div class="coupon-body">
                        <div class="coupon-description">Bạn đã nhận voucher hôm nay rồi!</div>
                        <div class="coupon-note">
                            <i class="fas fa-hourglass-half"></i>
                            Quay lại sau ${hoursLeft} giờ nữa để nhận voucher mới
                        </div>
                    </div>
                    <div class="coupon-actions">
                        <button class="close-coupon-btn" onclick="CouponSystem.closeCoupon()">
                            <i class="fas fa-times"></i> Đóng
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            setTimeout(() => popup.classList.add('show'), 100);
            
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    this.closeCoupon();
                }
            }, 5000);
        },
        
        showNoMoreCouponsMessage: function() {
            // Create proper modal instead of simple message
            const popup = document.createElement('div');
            popup.className = 'coupon-popup';
            popup.innerHTML = `
                <div class="coupon-content">
                    <div class="coupon-header">
                        <i class="fas fa-trophy"></i>
                        <h3>🎊 Chúc mừng! Bạn đã thu thập hết!</h3>
                    </div>
                    <div class="coupon-body">
                        <div class="coupon-description">Bạn đã sử dụng hết tất cả voucher có sẵn!</div>
                        <div class="coupon-note">
                            <i class="fas fa-star"></i>
                            Bạn là một collector thực thụ! 
                        </div>
                    </div>
                    <div class="coupon-actions">
                        <button class="close-coupon-btn" onclick="CouponSystem.closeCoupon()">
                            <i class="fas fa-times"></i> Đóng
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            setTimeout(() => popup.classList.add('show'), 100);
            
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    this.closeCoupon();
                }
            }, 5000);
        },
        
        showMessage: function(text, type) {
            // Always use modal for consistency
            const popup = document.createElement('div');
            popup.className = 'coupon-popup';
            popup.innerHTML = `
                <div class="coupon-content">
                    <div class="coupon-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>📢 Thông báo</h3>
                    </div>
                    <div class="coupon-body">
                        <div class="coupon-description">${text}</div>
                    </div>
                    <div class="coupon-actions">
                        <button class="close-coupon-btn" onclick="CouponSystem.closeCoupon()">
                            <i class="fas fa-times"></i> Đóng
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            setTimeout(() => popup.classList.add('show'), 100);
            
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    this.closeCoupon();
                }
            }, 4000);
        },
        

        
        updateStorage: function() {
            localStorage.setItem('matmat_used_coupons', JSON.stringify(this.usedCoupons));
            localStorage.setItem('matmat_last_coupon', this.lastCouponTime.toString());
        },
        
        // Admin function to reset coupons (for testing)
        resetCoupons: function() {
            this.usedCoupons = [];
            this.lastCouponTime = 0;
            this.updateStorage();
            console.log('Coupons reset!');
        },
        
        // Force show coupon for testing
        testCoupon: function() {
            const availableCoupons = this.coupons.filter(c => !this.usedCoupons.includes(c.code));
            if (availableCoupons.length > 0) {
                const coupon = availableCoupons[Math.floor(Math.random() * availableCoupons.length)];
                this.showCoupon(coupon, 'test-trigger');
            } else {
                this.showNoMoreCouponsMessage();
            }
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CouponSystem.init());
    } else {
        CouponSystem.init();
    }
    
    // Export for global access
    window.CouponSystem = CouponSystem;
})();