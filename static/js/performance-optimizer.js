// Performance Optimizer - Lazy loading and resource management
(function() {
    'use strict';
    
    const PerformanceOptimizer = {
        init: function() {
            this.setupResourceHints();
            this.optimizeImages();
            this.setupIntersectionObserver();
            this.optimizeAnimations();
            this.setupPreloading();
        },
        
        setupResourceHints: function() {
            // DNS prefetch for external resources
            this.addResourceHint('dns-prefetch', '//cdn.jsdelivr.net');
            this.addResourceHint('dns-prefetch', '//cdnjs.cloudflare.com');
            this.addResourceHint('dns-prefetch', '//api.open-meteo.com');
            
            // Preconnect to critical resources
            this.addResourceHint('preconnect', 'https://cdn.jsdelivr.net');
            this.addResourceHint('preconnect', 'https://cdnjs.cloudflare.com');
        },
        
        addResourceHint: function(rel, href) {
            const link = document.createElement('link');
            link.rel = rel;
            link.href = href;
            document.head.appendChild(link);
        },
        
        optimizeImages: function() {
            // Defer non-critical images
            const images = document.querySelectorAll('img:not([data-critical])');
            images.forEach(img => {
                if (img.loading !== 'lazy') {
                    img.loading = 'lazy';
                }
            });
        },
        
        setupIntersectionObserver: function() {
            // Optimize animations when elements are not visible
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in-view');
                        } else {
                            entry.target.classList.remove('in-view');
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '50px'
                });
                
                // Observe animated elements
                const animatedElements = document.querySelectorAll('.floating-bubble, .floating-particle, .floating-shape');
                animatedElements.forEach(el => observer.observe(el));
            }
        },
        
        optimizeAnimations: function() {
            // Reduce motion for users who prefer it
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.style.setProperty('--animation-duration', '0.1s');
                document.documentElement.style.setProperty('--mood-animation-speed', '0.1');
            }
            
            // Pause animations when page is not visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    document.body.classList.add('page-hidden');
                } else {
                    document.body.classList.remove('page-hidden');
                }
            });
        },
        
        setupPreloading: function() {
            // Preload critical resources on idle
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    this.preloadCriticalAssets();
                });
            } else {
                setTimeout(() => {
                    this.preloadCriticalAssets();
                }, 2000);
            }
        },
        
        preloadCriticalAssets: function() {
            const criticalAssets = [
                '/static/js/interactive-background.js',
                '/static/css/style.css'
            ];
            
            criticalAssets.forEach(asset => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = asset;
                document.head.appendChild(link);
            });
        },
        
        // Debounce function for performance-critical events
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        // Memory cleanup utilities
        cleanup: function() {
            // Remove unused event listeners and observers
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
            }
        }
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
    } else {
        PerformanceOptimizer.init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => PerformanceOptimizer.cleanup());
    
    // Export for global access
    window.PerformanceOptimizer = PerformanceOptimizer;
})();