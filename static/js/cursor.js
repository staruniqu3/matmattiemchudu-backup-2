// Universal custom cursor system
class CustomCursor {
    constructor() {
        this.cursorDot = null;
        this.cursorOutline = null;
        this.isActive = false;
        this.init();
    }
    
    init() {
        // Only initialize on desktop
        if (window.innerWidth <= 768) return;
        
        this.createCursorElements();
        this.bindEvents();
    }
    
    createCursorElements() {
        // Create cursor dot
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'cursor-dot';
        
        // Create cursor outline
        this.cursorOutline = document.createElement('div');
        this.cursorOutline.className = 'cursor-outline';
        
        document.body.appendChild(this.cursorDot);
        document.body.appendChild(this.cursorOutline);
    }
    
    bindEvents() {
        // Update cursor position
        document.addEventListener('mousemove', (e) => {
            this.updateCursorPosition(e);
        });
        
        // Show cursor on interactive elements
        document.addEventListener('mouseover', (e) => {
            if (this.isInteractiveElement(e.target)) {
                this.showCursor();
            }
        });
        
        // Hide cursor when leaving interactive elements
        document.addEventListener('mouseout', (e) => {
            if (this.isInteractiveElement(e.target)) {
                this.hideCursor();
            }
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.hideCursor();
        });
    }
    
    updateCursorPosition(e) {
        const posX = e.clientX;
        const posY = e.clientY;
        
        if (this.cursorDot) {
            this.cursorDot.style.left = posX - 10 + 'px';
            this.cursorDot.style.top = posY - 10 + 'px';
        }
        
        if (this.cursorOutline) {
            this.cursorOutline.style.left = posX - 20 + 'px';
            this.cursorOutline.style.top = posY - 20 + 'px';
        }
    }
    
    isInteractiveElement(element) {
        // Check if element or its parent has interactive classes
        const interactiveSelectors = [
            '.service-button',
            '.btn',
            '.form-control',
            '.nav-link',
            '.logo',
            '.card',
            'button',
            'input',
            'textarea',
            'select',
            'a',
            '[role="button"]',
            '.clickable'
        ];
        
        // Check current element and parents
        let current = element;
        while (current && current !== document.body) {
            for (const selector of interactiveSelectors) {
                if (current.matches && current.matches(selector)) {
                    return true;
                }
            }
            current = current.parentElement;
        }
        
        return false;
    }
    
    showCursor() {
        if (this.cursorDot) {
            this.cursorDot.style.opacity = '1';
            this.isActive = true;
        }
        if (this.cursorOutline) {
            this.cursorOutline.style.opacity = '0.6';
        }
        
        // Add cursor-none class to body
        document.body.classList.add('custom-cursor-area');
    }
    
    hideCursor() {
        if (this.cursorDot) {
            this.cursorDot.style.opacity = '0';
            this.isActive = false;
        }
        if (this.cursorOutline) {
            this.cursorOutline.style.opacity = '0';
        }
        
        // Remove cursor-none class from body
        document.body.classList.remove('custom-cursor-area');
    }
}

// Initialize cursor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomCursor();
});