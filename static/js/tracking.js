// Package tracking functionality
(function() {
    'use strict';

    const tracking = {
        init: function() {
            const form = document.getElementById('tracking-form');
            const trackingInput = document.getElementById('tracking-number');
            const providerSelect = document.getElementById('provider');
            const submitBtn = document.getElementById('track-btn');

            if (!form || !trackingInput || !submitBtn) return;

            // Real-time validation
            trackingInput.addEventListener('input', MatMatUtils.debounce((e) => {
                const validation = MatMatUtils.validateTrackingNumber(e.target.value);
                this.showValidation(trackingInput, validation);
                
                // Auto-detect provider
                if (validation.valid) {
                    this.autoDetectProvider(e.target.value, providerSelect);
                }
            }, 300));

            // Form submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const trackingNumber = trackingInput.value.trim();
                const provider = providerSelect.value;
                
                const validation = MatMatUtils.validateTrackingNumber(trackingNumber);
                
                if (!validation.valid) {
                    this.showValidation(trackingInput, validation);
                    return;
                }

                this.trackPackage(trackingNumber, provider, submitBtn);
            });

            // Auto-focus on page load
            trackingInput.focus();
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

        autoDetectProvider: function(searchTerm, providerSelect) {
            // Check if it's a customer code (starts with TCD)
            if (searchTerm.toUpperCase().startsWith('TCD')) {
                const detectionResult = document.getElementById('detection-result');
                if (detectionResult) {
                    // Clear existing content
                    detectionResult.textContent = '';
                    
                    // Create safe DOM elements
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-info alert-sm';
                    
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-user-tag';
                    
                    const textNode = document.createTextNode(' Mã khách hàng được phát hiện');
                    
                    alertDiv.appendChild(icon);
                    alertDiv.appendChild(textNode);
                    detectionResult.appendChild(alertDiv);
                }
                return;
            }
            
            const detectedProvider = this.detectProvider(searchTerm);
            if (detectedProvider && providerSelect.value === 'auto') {
                providerSelect.value = detectedProvider;
                
                // Show detection result
                const detectionResult = document.getElementById('detection-result');
                if (detectionResult) {
                    // Clear existing content
                    detectionResult.textContent = '';
                    
                    // Create safe DOM elements
                    const smallElement = document.createElement('small');
                    smallElement.className = 'text-info';
                    
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-magic';
                    
                    const textNode = document.createTextNode(' Tự động nhận diện: ' + this.getProviderName(detectedProvider));
                    
                    smallElement.appendChild(icon);
                    smallElement.appendChild(textNode);
                    detectionResult.appendChild(smallElement);
                }
            }
        },

        detectProvider: function(searchTerm) {
            // Skip detection for customer codes
            if (searchTerm.toUpperCase().startsWith('TCD')) {
                return null;
            }
            
            const number = searchTerm.toUpperCase().trim();
            
            // Shopee Express patterns (check first for specific SPXVN pattern)
            if (number.startsWith('SPXVN')) {
                return 'shopee';
            }
            
            // ViettelPost patterns
            if (number.startsWith('ĐVVC') || number.startsWith('VTP')) {
                return 'viettelpost';
            }
            
            // Vietnam Post patterns
            if (number.startsWith('RC') || number.startsWith('RG') || number.startsWith('RA') || 
                number.startsWith('CC') || number.startsWith('CP') || number.startsWith('CD')) {
                return 'vietnampost';
            }
            
            // GHN patterns
            if (number.startsWith('GHN') || number.length === 13) {
                return 'ghn';
            }
            
            // GHTK patterns
            if (number.startsWith('GHTK') || number.length === 12) {
                return 'ghtk';
            }
            
            // J&T patterns
            if (number.startsWith('JT') || number.length === 14) {
                return 'jnt';
            }
            
            return 'vietnampost';
        },

        getProviderName: function(provider) {
            const names = {
                'vietnampost': 'Bưu điện Việt Nam',
                'viettelpost': 'Viettel Post',
                'ghn': 'Giao hàng nhanh (GHN)',
                'ghtk': 'Giao hàng tiết kiệm (GHTK)',
                'jnt': 'J&T Express',
                'shopee': 'Shopee Express'
            };
            return names[provider] || 'Không xác định';
        },

        trackPackage: function(trackingNumber, provider, button) {
            // Set button to loading state
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            // Submit the form normally instead of using AJAX
            const form = document.getElementById('tracking-form');
            if (form) {
                form.submit();
            }
        },

        displayTrackingResult: function(data) {
            const resultContainer = document.getElementById('tracking-result');
            if (!resultContainer) return;

            const statusIcon = this.getStatusIcon(data.status);
            const statusColor = this.getStatusColor(data.status);
            
            // Clear existing content safely
            resultContainer.textContent = '';
            
            // Create main tracking result container
            const trackingResultDiv = document.createElement('div');
            trackingResultDiv.className = 'tracking-result';
            
            // Create header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'tracking-header';
            headerDiv.style.background = statusColor;
            
            // Create status section
            const statusDiv = document.createElement('div');
            statusDiv.className = 'tracking-status';
            
            const statusIconDiv = document.createElement('div');
            statusIconDiv.className = 'status-icon';
            const statusIconElement = document.createElement('i');
            statusIconElement.className = `fas fa-${statusIcon}`;
            statusIconDiv.appendChild(statusIconElement);
            
            const statusSpan = document.createElement('span');
            statusSpan.textContent = data.status || '';
            
            statusDiv.appendChild(statusIconDiv);
            statusDiv.appendChild(statusSpan);
            
            // Create tracking info section
            const infoDiv = document.createElement('div');
            infoDiv.className = 'tracking-info';
            
            const trackingStrong = document.createElement('strong');
            trackingStrong.textContent = data.tracking_number || '';
            
            const lineBreak = document.createElement('br');
            
            const providerSmall = document.createElement('small');
            providerSmall.textContent = data.provider_name || '';
            
            infoDiv.appendChild(trackingStrong);
            infoDiv.appendChild(lineBreak);
            infoDiv.appendChild(providerSmall);
            
            headerDiv.appendChild(statusDiv);
            headerDiv.appendChild(infoDiv);
            
            // Create body section
            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'tracking-body';
            
            const trackingInfoDiv = document.createElement('div');
            trackingInfoDiv.className = 'tracking-info';
            
            // Location item
            const locationItem = this.createInfoItem(
                'fas fa-map-marker-alt',
                'Vị trí hiện tại:',
                data.location || 'Chưa cập nhật'
            );
            trackingInfoDiv.appendChild(locationItem);
            
            // Estimated delivery item
            const deliveryItem = this.createInfoItem(
                'fas fa-calendar-alt',
                'Dự kiến giao hàng:',
                data.estimated_delivery ? MatMatUtils.formatDate(data.estimated_delivery) : 'Chưa xác định'
            );
            trackingInfoDiv.appendChild(deliveryItem);
            
            // Last updated item
            const lastUpdatedItem = this.createInfoItem(
                'fas fa-clock',
                'Cập nhật lần cuối:',
                MatMatUtils.formatDate(data.last_updated)
            );
            trackingInfoDiv.appendChild(lastUpdatedItem);
            
            bodyDiv.appendChild(trackingInfoDiv);
            
            // Add history timeline if available
            if (data.history && data.history.length > 0) {
                const timelineDiv = this.createTimelineDOM(data.history);
                bodyDiv.appendChild(timelineDiv);
            }
            
            // Assemble the complete result
            trackingResultDiv.appendChild(headerDiv);
            trackingResultDiv.appendChild(bodyDiv);
            resultContainer.appendChild(trackingResultDiv);
            
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        },

        getStatusIcon: function(status) {
            const icons = {
                'Đang chờ xử lý': 'clock',
                'Đã lấy hàng': 'check-circle',
                'Đang vận chuyển': 'truck',
                'Đang giao hàng': 'shipping-fast',
                'Đã giao hàng': 'check-double',
                'Trả lại người gửi': 'undo',
                'Đã hủy': 'times-circle'
            };
            return icons[status] || 'question-circle';
        },

        getStatusColor: function(status) {
            const colors = {
                'Đang chờ xử lý': '#ffc107',
                'Đã lấy hàng': '#17a2b8',
                'Đang vận chuyển': '#007bff',
                'Đang giao hàng': '#fd7e14',
                'Đã giao hàng': '#28a745',
                'Trả lại người gửi': '#6c757d',
                'Đã hủy': '#dc3545'
            };
            return colors[status] || '#6c757d';
        },

        createInfoItem: function(iconClass, label, value) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'info-item';
            
            const iconElement = document.createElement('i');
            iconElement.className = iconClass;
            
            const labelSpan = document.createElement('span');
            labelSpan.className = 'info-label';
            labelSpan.textContent = label;
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'info-value';
            valueSpan.textContent = value || '';
            
            itemDiv.appendChild(iconElement);
            itemDiv.appendChild(labelSpan);
            itemDiv.appendChild(valueSpan);
            
            return itemDiv;
        },

        createTimelineDOM: function(history) {
            const containerDiv = document.createElement('div');
            containerDiv.className = 'mt-4';
            
            const heading = document.createElement('h5');
            const historyIcon = document.createElement('i');
            historyIcon.className = 'fas fa-history';
            heading.appendChild(historyIcon);
            heading.appendChild(document.createTextNode(' Lịch sử vận chuyển'));
            
            const timelineDiv = document.createElement('div');
            timelineDiv.className = 'timeline';
            
            history.forEach((item, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.className = index === 0 ? 'timeline-item active' : 'timeline-item';
                
                const timelineContent = document.createElement('div');
                timelineContent.className = 'timeline-content';
                
                const timeDiv = document.createElement('div');
                timeDiv.className = 'timeline-time';
                timeDiv.textContent = MatMatUtils.formatDate(item.time);
                
                const titleDiv = document.createElement('div');
                titleDiv.className = 'timeline-title';
                titleDiv.textContent = item.status || '';
                
                const descDiv = document.createElement('div');
                descDiv.className = 'timeline-description';
                descDiv.textContent = item.description || '';
                
                timelineContent.appendChild(timeDiv);
                timelineContent.appendChild(titleDiv);
                timelineContent.appendChild(descDiv);
                
                if (item.location) {
                    const locationDiv = document.createElement('div');
                    locationDiv.className = 'timeline-location';
                    
                    const locationIcon = document.createElement('i');
                    locationIcon.className = 'fas fa-map-marker-alt';
                    
                    locationDiv.appendChild(locationIcon);
                    locationDiv.appendChild(document.createTextNode(' ' + item.location));
                    timelineContent.appendChild(locationDiv);
                }
                
                timelineItem.appendChild(timelineContent);
                timelineDiv.appendChild(timelineItem);
            });
            
            containerDiv.appendChild(heading);
            containerDiv.appendChild(timelineDiv);
            
            return containerDiv;
        },

        createTimeline: function(history) {
            const timelineItems = history.map((item, index) => {
                const isActive = index === 0 ? 'active' : '';
                return `
                    <div class="timeline-item ${isActive}">
                        <div class="timeline-content">
                            <div class="timeline-time">${MatMatUtils.formatDate(item.time)}</div>
                            <div class="timeline-title">${item.status}</div>
                            <div class="timeline-description">${item.description}</div>
                            ${item.location ? `<div class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="mt-4">
                    <h5><i class="fas fa-history"></i> Lịch sử vận chuyển</h5>
                    <div class="timeline">
                        ${timelineItems}
                    </div>
                </div>
            `;
        }
    };

    // Initialize tracking when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        tracking.init();
    });

    // Expose tracking globally
    window.MatMatTracking = tracking;
})();
