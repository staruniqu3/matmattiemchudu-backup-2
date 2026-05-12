// Enhanced JavaScript with performance optimizations
(function() {
    'use strict';

    // Utility functions
    const utils = {
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        formatDate: function(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return dateString;
            }
        },

        showAlert: function(message, type = 'info') {
            const alertContainer = document.getElementById('alert-container');
            if (!alertContainer) return;

            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            
            // Create icon element safely
            const icon = document.createElement('i');
            icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}`;
            
            // Create message text safely
            const messageSpan = document.createElement('span');
            messageSpan.textContent = message;
            
            // Create close button safely
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'btn-close';
            closeButton.setAttribute('data-bs-dismiss', 'alert');
            
            // Append elements safely
            alertDiv.appendChild(icon);
            alertDiv.appendChild(document.createTextNode(' '));
            alertDiv.appendChild(messageSpan);
            alertDiv.appendChild(document.createTextNode(' '));
            alertDiv.appendChild(closeButton);

            alertContainer.appendChild(alertDiv);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        },

        validateCustomerCode: function(code) {
            if (!code || code.trim().length === 0) {
                return { valid: false, message: 'Vui lòng nhập mã khách hàng' };
            }
            if (code.length < 3) {
                return { valid: false, message: 'Mã khách hàng phải có ít nhất 3 ký tự' };
            }
            return { valid: true, message: '' };
        },

        validateTrackingNumber: function(trackingNumber) {
            if (!trackingNumber || trackingNumber.trim().length === 0) {
                return { valid: false, message: 'Vui lòng nhập mã vận đơn' };
            }
            if (trackingNumber.length < 8) {
                return { valid: false, message: 'Mã vận đơn phải có ít nhất 8 ký tự' };
            }
            return { valid: true, message: '' };
        },

        setButtonLoading: function(button, loading = true) {
            if (loading) {
                button.disabled = true;
                button.classList.add('btn-loading');
                // Store original content nodes for safe restoration
                button.dataset.originalNodes = JSON.stringify(Array.from(button.childNodes).map(node => ({
                    nodeType: node.nodeType,
                    textContent: node.textContent,
                    className: node.className || '',
                    tagName: node.tagName || '',
                    id: node.id || ''
                })));
                // Safe DOM manipulation for loading state
                button.innerHTML = '';
                const spinner = document.createElement('i');
                spinner.className = 'fas fa-spinner fa-spin';
                button.appendChild(spinner);
                button.appendChild(document.createTextNode(' Đang xử lý...'));
            } else {
                button.disabled = false;
                button.classList.remove('btn-loading');
                if (button.dataset.originalNodes) {
                    // Safe restoration using createElement and textContent
                    button.innerHTML = '';
                    try {
                        const nodes = JSON.parse(button.dataset.originalNodes);
                        nodes.forEach(nodeData => {
                            if (nodeData.nodeType === 3) { // Text node
                                button.appendChild(document.createTextNode(nodeData.textContent));
                            } else if (nodeData.nodeType === 1) { // Element node
                                const element = document.createElement(nodeData.tagName.toLowerCase());
                                element.textContent = nodeData.textContent;
                                if (nodeData.className) element.className = nodeData.className;
                                if (nodeData.id) element.id = nodeData.id;
                                button.appendChild(element);
                            }
                        });
                    } catch (e) {
                        // Fallback to safe default if parsing fails
                        this.createDefaultButton(button);
                    }
                } else {
                    // Safe fallback content
                    this.createDefaultButton(button);
                }
            }
        },

        createDefaultButton: function(button) {
            button.innerHTML = '';
            const icon = document.createElement('i');
            icon.className = 'fas fa-search';
            const span = document.createElement('span');
            span.id = 'btn-text';
            span.textContent = 'Tra cứu';
            button.appendChild(icon);
            button.appendChild(document.createTextNode(' '));
            button.appendChild(span);
        }
    };

    // Customer lookup functionality
    const customerLookup = {
        init: function() {
            const form = document.getElementById('customer-lookup-form');
            const input = document.getElementById('customer-code');
            const submitBtn = document.getElementById('lookup-btn');

            if (!form || !input || !submitBtn) return;

            // Real-time validation
            input.addEventListener('input', utils.debounce((e) => {
                const validation = utils.validateCustomerCode(e.target.value);
                this.showValidation(input, validation);
            }, 300));

            // Form submission
            form.addEventListener('submit', (e) => {
                const code = input.value.trim();
                const validation = utils.validateCustomerCode(code);
                
                if (!validation.valid) {
                    e.preventDefault();
                    this.showValidation(input, validation);
                    return;
                }

                // Set button to loading state for normal form submission
                utils.setButtonLoading(submitBtn, true);
                
                // Reset button after a short delay to handle form submission
                setTimeout(() => {
                    utils.setButtonLoading(submitBtn, false);
                }, 3000);
            });

            // Auto-focus on page load
            input.focus();
        },

        showValidation: function(input, validation) {
            const feedback = input.parentNode.querySelector('.invalid-feedback') || 
                            this.createFeedbackElement(input);
            
            if (validation.valid) {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                feedback.textContent = '';
            } else {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
                feedback.textContent = validation.message;
            }
        },

        createFeedbackElement: function(input) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.appendChild(feedback);
            return feedback;
        },

        lookupCustomer: function(code, button) {
            utils.setButtonLoading(button, true);

            fetch(`/customer/api/lookup/${encodeURIComponent(code)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.displayCustomerData(data.data);
                    utils.showAlert('Tìm thấy thông tin khách hàng', 'success');
                } else {
                    utils.showAlert(data.error || 'Không tìm thấy khách hàng', 'error');
                }
            })
            .catch(error => {
                // console.error('Error:', error); // Debug disabled
                utils.showAlert('Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.', 'error');
            })
            .finally(() => {
                utils.setButtonLoading(button, false);
            });
        },

        displayCustomerData: function(data) {
            const resultContainer = document.getElementById('customer-result');
            if (!resultContainer) return;

            // Clear container and create elements safely
            resultContainer.innerHTML = '';
            
            // Create main container
            const customerInfo = document.createElement('div');
            customerInfo.className = 'customer-info';
            
            // Create customer header
            const customerHeader = document.createElement('div');
            customerHeader.className = 'customer-header';
            const headerDiv = document.createElement('div');
            
            // Create name element safely
            const nameH4 = document.createElement('h4');
            nameH4.textContent = data.name || 'Không có tên';
            headerDiv.appendChild(nameH4);
            
            // Create Facebook name element safely if exists
            if (data.facebook_name) {
                const facebookP = document.createElement('p');
                facebookP.style.margin = '0.2rem 0 0.2rem 0';
                facebookP.style.fontSize = '0.9rem';
                facebookP.style.color = '#6c757d';
                facebookP.textContent = `Facebook: ${data.facebook_name}`;
                headerDiv.appendChild(facebookP);
            }
            
            // Create customer code element safely
            const codeP = document.createElement('p');
            codeP.className = 'text-muted';
            codeP.textContent = `Mã khách hàng: ${data.code}`;
            headerDiv.appendChild(codeP);
            
            customerHeader.appendChild(headerDiv);
            customerInfo.appendChild(customerHeader);
            
            // Create customer details
            const customerDetails = document.createElement('div');
            customerDetails.className = 'customer-details';
            
            // Points detail item
            const pointsItem = this.createDetailItem('fas fa-coins text-warning', 'Điểm tích lũy:', data.points || '0', 'points-badge');
            customerDetails.appendChild(pointsItem);
            
            // Rank detail item
            const rankItem = this.createDetailItem('fas fa-crown text-warning', 'Hạng thành viên:', data.rank || 'Thành viên', 'rank-badge');
            customerDetails.appendChild(rankItem);
            
            // Last updated detail item
            const updatedItem = this.createDetailItem('fas fa-clock text-info', 'Cập nhật lần cuối:', utils.formatDate(data.last_updated), 'detail-value');
            customerDetails.appendChild(updatedItem);
            
            customerInfo.appendChild(customerDetails);
            resultContainer.appendChild(customerInfo);
            
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        },
        
        createDetailItem: function(iconClass, label, value, valueClass) {
            const item = document.createElement('div');
            item.className = 'detail-item';
            
            const icon = document.createElement('i');
            icon.className = iconClass;
            item.appendChild(icon);
            
            const labelSpan = document.createElement('span');
            labelSpan.className = 'detail-label';
            labelSpan.textContent = label;
            item.appendChild(labelSpan);
            
            const valueSpan = document.createElement('span');
            valueSpan.className = valueClass;
            valueSpan.textContent = value;
            item.appendChild(valueSpan);
            
            return item;
        }
    };

    // Performance optimizations
    const performance = {
        init: function() {
            // Lazy load images
            this.lazyLoadImages();
            
            // Preload critical resources
            this.preloadCriticalResources();
            
            // Monitor performance
            this.monitorPerformance();
        },

        lazyLoadImages: function() {
            const images = document.querySelectorAll('img[data-src]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for older browsers
                images.forEach(img => {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                });
            }
        },

        preloadCriticalResources: function() {
            const criticalResources = [
                '/static/css/style.css',
                '/static/js/tracking.js'
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = resource.endsWith('.css') ? 'style' : 'script';
                document.head.appendChild(link);
            });
        },

        monitorPerformance: function() {
            if ('performance' in window) {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const perfData = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
                        if (perfData) {
                            // console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms'); // Debug disabled
                        }
                    }, 0);
                });
            }
        }
    };

    // Enhanced form handling
    const forms = {
        init: function() {
            // Add loading states to all forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        utils.setButtonLoading(submitBtn, true);
                    }
                });
            });

            // Auto-save form data
            this.autoSaveFormData();
        },

        autoSaveFormData: function() {
            const inputs = document.querySelectorAll('input[type="text"], textarea');
            
            inputs.forEach(input => {
                const key = `form_${input.name || input.id}`;
                
                // Restore saved data
                const savedValue = localStorage.getItem(key);
                if (savedValue) {
                    input.value = savedValue;
                }
                
                // Save on input
                input.addEventListener('input', utils.debounce((e) => {
                    localStorage.setItem(key, e.target.value);
                }, 1000));
            });
        }
    };

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        customerLookup.init();
        performance.init();
        forms.init();
    });

    // Service Worker registration for offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    // console.log('SW registered: ', registration); // Debug disabled
                })
                .catch(registrationError => {
                    // console.log('SW registration failed: ', registrationError); // Debug disabled
                });
        });
    }

    // Enhanced cursor animation system
    const cursorEffects = {
        init: function() {
            this.createCursorElements();
            this.bindEvents();
        },

        createCursorElements: function() {
            // Create cursor dot
            this.cursorDot = document.createElement('div');
            this.cursorDot.className = 'cursor-dot';
            document.body.appendChild(this.cursorDot);

            // Create cursor outline
            this.cursorOutline = document.createElement('div');
            this.cursorOutline.className = 'cursor-outline';
            document.body.appendChild(this.cursorOutline);

            // Apply custom cursor area to body
            document.body.classList.add('custom-cursor-area');
        },

        bindEvents: function() {
            // Mouse move tracking
            document.addEventListener('mousemove', (e) => {
                this.updateCursorPosition(e.clientX, e.clientY);
            });

            // Mouse enter/leave for visibility
            document.addEventListener('mouseenter', () => {
                this.showCursor();
            });

            document.addEventListener('mouseleave', () => {
                this.hideCursor();
            });

            // Click effects
            document.addEventListener('mousedown', (e) => {
                this.triggerClickEffect(e.clientX, e.clientY);
            });

            document.addEventListener('mouseup', () => {
                this.removeClickEffect();
            });

            // Hover effects for interactive elements
            const interactiveElements = 'a, button, [role="button"], input, textarea, select, .service-button';
            
            document.addEventListener('mouseover', (e) => {
                if (e.target.matches(interactiveElements)) {
                    this.triggerHoverEffect();
                }
            });

            document.addEventListener('mouseout', (e) => {
                if (e.target.matches(interactiveElements)) {
                    this.removeHoverEffect();
                }
            });

            // Loading states for form submissions and AJAX
            document.addEventListener('submit', () => {
                this.triggerLoadingEffect();
            });

            // Custom loading trigger for AJAX requests
            document.addEventListener('loading-start', () => {
                this.triggerLoadingEffect();
            });

            document.addEventListener('loading-end', () => {
                this.removeLoadingEffect();
            });
        },

        updateCursorPosition: function(x, y) {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.style.left = x + 'px';
                this.cursorDot.style.top = y + 'px';
                this.cursorOutline.style.left = (x - 20) + 'px';
                this.cursorOutline.style.top = (y - 20) + 'px';
            }
        },

        showCursor: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.style.opacity = '1';
                this.cursorOutline.style.opacity = '1';
            }
        },

        hideCursor: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.style.opacity = '0';
                this.cursorOutline.style.opacity = '0';
            }
        },

        triggerClickEffect: function(x, y) {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.classList.add('clicked');
                this.cursorOutline.classList.add('clicked');
                
                // Create explosion effect
                this.createExplosionEffect(x, y);
            }
        },

        removeClickEffect: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.classList.remove('clicked');
                this.cursorOutline.classList.remove('clicked');
            }
        },

        triggerHoverEffect: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.classList.add('hover');
                this.cursorOutline.classList.add('hover');
            }
        },

        removeHoverEffect: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.classList.remove('hover');
                this.cursorOutline.classList.remove('hover');
            }
        },

        triggerLoadingEffect: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.classList.add('loading');
                this.cursorOutline.classList.add('loading');
            }
        },

        removeLoadingEffect: function() {
            if (this.cursorDot && this.cursorOutline) {
                this.cursorDot.classList.remove('loading');
                this.cursorOutline.classList.remove('loading');
            }
        },

        createExplosionEffect: function(x, y) {
            // Create 3 spreading ripple circles
            for (let i = 1; i <= 3; i++) {
                const ripple = document.createElement('div');
                ripple.className = `cursor-ripple wave-${i}`;
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                document.body.appendChild(ripple);
                
                // Remove ripple after animation completes
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 1200 + (i * 150)); // Stagger removal based on wave delay
            }
            
            // Create particle explosion effect
            const explosion = document.createElement('div');
            explosion.className = 'cursor-explosion';
            explosion.style.left = x + 'px';
            explosion.style.top = y + 'px';
            
            document.body.appendChild(explosion);
            
            // Remove explosion after animation
            setTimeout(() => {
                if (explosion.parentNode) {
                    explosion.parentNode.removeChild(explosion);
                }
            }, 800);
        }
    };

    // Enhanced button loading integration with cursor effects
    const originalSetButtonLoading = utils.setButtonLoading;
    utils.setButtonLoading = function(button, loading = true) {
        // Call original function
        originalSetButtonLoading.call(this, button, loading);
        
        // Trigger cursor loading effect
        if (loading) {
            document.dispatchEvent(new CustomEvent('loading-start'));
        } else {
            document.dispatchEvent(new CustomEvent('loading-end'));
        }
    };

    // Universal background fix for all devices including desktop
    function forceMobileBackground() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIPhoneX = /iPhone/.test(navigator.userAgent) && window.screen.height === 812 && window.screen.width === 375;
        const isDesktop = window.innerWidth >= 769;
        
        // Apply to all devices to fix horizontal lines
        if (isMobile || isIOS || isSafari || isIPhoneX || isDesktop) {
            // Ultra-aggressive background enforcement for all devices
            const applyBackground = (element) => {
                element.style.setProperty('background', '#FF6B35', 'important');
                element.style.setProperty('background', 'linear-gradient(135deg, #FF6B35 0%, #1E3A8A 100%)', 'important');
                
                // Different settings for mobile vs desktop
                if (isDesktop) {
                    element.style.setProperty('background-size', 'cover', 'important');
                    element.style.setProperty('background-attachment', 'fixed', 'important');
                    element.style.setProperty('background-position', 'center center', 'important');
                } else {
                    element.style.setProperty('background-size', '100% 100%', 'important');
                    element.style.setProperty('background-attachment', 'scroll', 'important');
                    element.style.setProperty('background-position', '0 0', 'important');
                }
                
                element.style.setProperty('background-repeat', 'no-repeat', 'important');
                element.style.setProperty('width', '100vw', 'important');
                element.style.setProperty('height', '100vh', 'important');
                element.style.setProperty('min-height', '100vh', 'important');
                element.style.setProperty('min-height', '-webkit-fill-available', 'important');
                element.style.setProperty('margin', '0', 'important');
                element.style.setProperty('padding', '0', 'important');
            };
            
            // Apply to HTML and body immediately and repeatedly
            const forceApply = () => {
                applyBackground(document.documentElement);
                applyBackground(document.body);
            };
            
            forceApply();
            
            // Create multiple background layers for all devices
            const layerCount = isDesktop ? 3 : 5; // Less layers for desktop, more for mobile
            for (let i = 0; i < layerCount; i++) {
                const bgDiv = document.createElement('div');
                bgDiv.className = `bg-layer-${i}`;
                
                const backgroundSize = isDesktop ? 'cover' : '100% 100%';
                const backgroundAttachment = isDesktop ? 'fixed' : 'scroll';
                const backgroundPosition = isDesktop ? 'center center' : '0 0';
                
                bgDiv.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    height: -webkit-fill-available !important;
                    background: linear-gradient(135deg, #FF6B35 0%, #1E3A8A 100%) !important;
                    background-size: ${backgroundSize} !important;
                    background-repeat: no-repeat !important;
                    background-attachment: ${backgroundAttachment} !important;
                    background-position: ${backgroundPosition} !important;
                    z-index: ${-999 - i} !important;
                    pointer-events: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;
                document.body.insertBefore(bgDiv, document.body.firstChild);
            }
            
            // Multiple event listeners for aggressive reapplication
            const events = ['resize', 'orientationchange', 'scroll', 'touchstart', 'touchend', 'focus', 'blur'];
            events.forEach(event => {
                window.addEventListener(event, forceApply);
            });
            
            // Periodic reapplication for stubborn cases
            setInterval(forceApply, 1000);
        }
    }

    // Initialize cursor effects when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Apply mobile background fix immediately
        forceMobileBackground();
        
        customerLookup.init();
        performance.init();
        forms.init();
        
        // Initialize cursor effects on desktop/tablet (not on mobile)
        if (window.innerWidth > 768) {
            cursorEffects.init();
        }
    });

    // Expose utilities globally
    window.MatMatUtils = utils;
    window.MatMatCustomerLookup = customerLookup;
    window.MatMatCursorEffects = cursorEffects;
})();
