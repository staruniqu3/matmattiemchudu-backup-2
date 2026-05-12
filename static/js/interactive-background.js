// Enhanced interactive background with mouse movement and dynamic elements
class InteractiveBackground {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.pulseElements = [];
        this.lastClickTime = 0;
        this.init();
    }
    
    init() {
        this.createParallaxEffect();
        this.createMouseTracker();
        this.createDynamicPulses();
        this.createHoverEffects();
    }
    
    createParallaxEffect() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = e.clientY / window.innerHeight;
            
            // Enhanced constrained movement
            const maxMove = 15;
            const moveX = (this.mouseX - 0.5) * maxMove;
            const moveY = (this.mouseY - 0.5) * maxMove;
            
            // Apply enhanced parallax to background gradient
            document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
        });
    }
    
    createMouseTracker() {
        // Enhanced ripple effect on click with double-click detection
        document.addEventListener('click', (e) => {
            const currentTime = Date.now();
            const isDoubleClick = currentTime - this.lastClickTime < 400;
            this.lastClickTime = currentTime;
            
            this.createRipple(e.clientX, e.clientY, isDoubleClick);
            
            if (isDoubleClick) {
                this.createBurstEffect(e.clientX, e.clientY);
            }
        });
        
        // Add scroll interaction
        window.addEventListener('scroll', () => {
            this.updateElementsOnScroll();
        });
    }
    
    createRipple(x, y, isDoubleClick = false) {
        const ripple = document.createElement('div');
        ripple.className = 'mouse-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        if (isDoubleClick) {
            ripple.style.background = 'radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)';
            ripple.style.animationDuration = '0.8s';
        }
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, isDoubleClick ? 800 : 1200);
    }
    
    createBurstEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const burst = document.createElement('div');
                burst.className = 'mouse-ripple';
                burst.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
                burst.style.top = (y + (Math.random() - 0.5) * 100) + 'px';
                burst.style.width = '30px';
                burst.style.height = '30px';
                burst.style.background = 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%)';
                
                document.body.appendChild(burst);
                
                setTimeout(() => {
                    burst.remove();
                }, 600);
            }, i * 50);
        }
    }
    
    createDynamicPulses() {
        // Create floating particles for better interaction
        this.createFloatingParticles();
        
        // Create floating bubbles
        this.createFloatingBubbles();
        
        // Create floating geometric shapes
        this.createFloatingShapes();
        
        // Add sparkle effects
        this.createSparkleEffect();
        
        // Initialize Easter eggs
        this.initEasterEggs();
        
        // Initialize weather responsive system
        this.initWeatherSystem();
        
        // Add pulse effects on interval - less frequent
        setInterval(() => {
            this.createRandomPulse();
        }, 12000); // Reduced frequency for better performance
        
        // Add bubble generation on interval - less frequent
        setInterval(() => {
            this.createRandomBubble();
        }, 4000);
        
        // Add occasional sparkles
        setInterval(() => {
            this.createRandomSparkle();
        }, 3000);
        
        // Add floating shapes occasionally
        setInterval(() => {
            this.createRandomShape();
        }, 12000);
    }
    
    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.position = 'fixed';
        particleContainer.style.top = '0';
        particleContainer.style.left = '0';
        particleContainer.style.width = '100%';
        particleContainer.style.height = '100%';
        particleContainer.style.pointerEvents = 'none';
        particleContainer.style.zIndex = '1';
        document.body.appendChild(particleContainer);
        
        // Create 8 floating particles - reduced for softer effect
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            // Random starting position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Random size between 3-8px
            const size = 3 + Math.random() * 5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random animation delay and duration
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (20 + Math.random() * 15) + 's';
            
            particleContainer.appendChild(particle);
        }
    }
    
    createRandomPulse() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        const pulse = document.createElement('div');
        pulse.className = 'random-pulse';
        pulse.style.left = x + 'px';
        pulse.style.top = y + 'px';
        
        document.body.appendChild(pulse);
        
        setTimeout(() => {
            pulse.remove();
        }, 2000);
    }
    
    createFloatingBubbles() {
        // Create initial set of bubbles - reduced for softer effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createRandomBubble();
            }, i * 1000);
        }
    }
    
    createRandomBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        
        // Random starting position at bottom
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.bottom = '-50px';
        
        // Random size between 15-40px
        const size = 15 + Math.random() * 25;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // Random animation duration and delay
        bubble.style.animationDuration = (8 + Math.random() * 6) + 's';
        bubble.style.animationDelay = Math.random() * 2 + 's';
        
        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 100;
        bubble.style.setProperty('--drift', drift + 'px');
        
        document.body.appendChild(bubble);
        
        // Remove bubble after animation
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.remove();
            }
        }, 15000);
        
        // Add click interaction to pop bubbles
        bubble.addEventListener('click', (e) => {
            e.stopPropagation();
            this.popBubble(bubble);
        });
    }
    
    popBubble(bubble) {
        bubble.style.animation = 'bubble-pop 0.3s ease-out forwards';
        
        // Create pop effect
        const rect = bubble.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const droplet = document.createElement('div');
            droplet.className = 'bubble-droplet';
            droplet.style.left = centerX + 'px';
            droplet.style.top = centerY + 'px';
            
            const angle = (i * 60) * Math.PI / 180;
            const velocity = 30 + Math.random() * 20;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            droplet.style.setProperty('--vx', vx + 'px');
            droplet.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(droplet);
            
            setTimeout(() => {
                droplet.remove();
            }, 800);
        }
        
        setTimeout(() => {
            bubble.remove();
        }, 300);
    }
    
    createFloatingShapes() {
        // Create initial geometric shapes
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createRandomShape();
            }, i * 3000);
        }
    }
    
    createRandomShape() {
        const shapes = ['triangle', 'square', 'diamond', 'hexagon'];
        const shape = document.createElement('div');
        shape.className = `floating-shape floating-${shapes[Math.floor(Math.random() * shapes.length)]}`;
        
        // Random starting position
        shape.style.left = Math.random() * 100 + '%';
        shape.style.top = '100vh';
        
        // Random size between 8-20px (except for triangles)
        const size = 8 + Math.random() * 12;
        if (!shape.className.includes('triangle')) {
            shape.style.width = size + 'px';
            shape.style.height = size + 'px';
        }
        
        // Random animation duration
        shape.style.animationDuration = (15 + Math.random() * 10) + 's';
        shape.style.animationDelay = Math.random() * 3 + 's';
        
        document.body.appendChild(shape);
        
        // Remove after animation
        setTimeout(() => {
            if (shape.parentNode) {
                shape.remove();
            }
        }, 30000);
    }
    
    createSparkleEffect() {
        // Add sparkles on mouse movement
        let lastSparkle = 0;
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastSparkle > 200 && Math.random() < 0.1) {
                this.createSparkleAt(e.clientX, e.clientY);
                lastSparkle = now;
            }
        });
    }
    
    createRandomSparkle() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        this.createSparkleAt(x, y);
    }
    
    createSparkleAt(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        
        // Random sparkle size
        const size = 3 + Math.random() * 4;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1500);
    }
    
    createHoverEffects() {
        // Add hover effects to buttons and interactive elements
        const interactiveElements = document.querySelectorAll('button, .btn, .nav-link, .card');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.createHoverRipple(e.target);
            });
        });
        
        // Add cursor trail effect
        this.addCursorTrail();
    }
    
    addCursorTrail() {
        let lastTrail = 0;
        let trailCount = 0;
        const maxTrails = 10; // Limit concurrent trails for performance
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTrail > 80 && trailCount < maxTrails) { // Increased interval and added limit
                const trail = document.createElement('div');
                trail.className = 'cursor-trail';
                trail.style.left = e.clientX + 'px';
                trail.style.top = e.clientY + 'px';
                
                document.body.appendChild(trail);
                trailCount++;
                
                setTimeout(() => {
                    if (trail.parentNode) {
                        trail.remove();
                        trailCount--;
                    }
                }, 800);
                
                lastTrail = now;
            }
        });
    }
    
    createHoverRipple(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const hoverRipple = document.createElement('div');
        hoverRipple.style.position = 'fixed';
        hoverRipple.style.left = centerX + 'px';
        hoverRipple.style.top = centerY + 'px';
        hoverRipple.style.width = '20px';
        hoverRipple.style.height = '20px';
        hoverRipple.style.borderRadius = '50%';
        hoverRipple.style.background = 'rgba(255, 107, 53, 0.1)';
        hoverRipple.style.pointerEvents = 'none';
        hoverRipple.style.zIndex = '999';
        hoverRipple.style.transform = 'translate(-50%, -50%) scale(0)';
        hoverRipple.style.transition = 'transform 0.3s ease';
        
        document.body.appendChild(hoverRipple);
        
        setTimeout(() => {
            hoverRipple.style.transform = 'translate(-50%, -50%) scale(3)';
            hoverRipple.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            hoverRipple.remove();
        }, 300);
    }
    
    updateElementsOnScroll() {
        // Update parallax effect on scroll for better performance
        const scrollY = window.scrollY;
        const scrollFactor = scrollY * 0.1;
        
        // Apply subtle scroll parallax to background
        document.body.style.backgroundPositionY = `${scrollFactor}px`;
    }
    
    initEasterEggs() {
        this.konamiCode = [];
        this.konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.clickSequence = [];
        this.lastKeyTime = 0;
        
        // Konami code listener
        document.addEventListener('keydown', (e) => {
            this.handleKonamiInput(e.code);
        });
        
        // Secret click pattern (click corners in sequence)
        this.initCornerClickEgg();
        
        // Secret double-click on logo
        this.initLogoEgg();
        
        // Secret typing easter egg
        this.initTypingEgg();
        
        // Hidden rainbow mode
        this.initRainbowMode();
    }
    
    handleKonamiInput(keyCode) {
        const now = Date.now();
        
        // Reset if too much time passed
        if (now - this.lastKeyTime > 1000) {
            this.konamiCode = [];
        }
        
        this.konamiCode.push(keyCode);
        this.lastKeyTime = now;
        
        // Keep only the last 10 keys
        if (this.konamiCode.length > 10) {
            this.konamiCode.shift();
        }
        
        // Check if sequence matches
        if (this.konamiCode.length === 10 && 
            this.konamiCode.every((key, index) => key === this.konamiSequence[index])) {
            this.activateKonamiEgg();
            this.konamiCode = [];
        }
    }
    
    activateKonamiEgg() {
        // Create explosion of particles and effects
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                this.createSparkleAt(x, y);
                this.createRandomBubble();
                this.createRandomShape();
            }, i * 100);
        }
        
        // Show secret message
        this.showEasterEggMessage('🎉 Konami Code Activated! Ultimate Party Mode! 🎉');
        
        // Temporary crazy background effects
        this.activatePartyMode();
        this.triggerEasterEgg('konami');
    }
    
    initCornerClickEgg() {
        const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
        let cornerSequence = [];
        
        // Create invisible corner areas
        corners.forEach((corner, index) => {
            const area = document.createElement('div');
            area.className = `corner-easter-egg corner-${corner}`;
            area.style.position = 'fixed';
            area.style.width = '50px';
            area.style.height = '50px';
            area.style.zIndex = '999999';
            area.style.cursor = 'pointer';
            area.style.opacity = '0';
            
            // Position corners
            if (corner === 'top-left') {
                area.style.top = '0';
                area.style.left = '0';
            } else if (corner === 'top-right') {
                area.style.top = '0';
                area.style.right = '0';
            } else if (corner === 'bottom-right') {
                area.style.bottom = '0';
                area.style.right = '0';
            } else {
                area.style.bottom = '0';
                area.style.left = '0';
            }
            
            area.addEventListener('click', () => {
                cornerSequence.push(index);
                
                // Show brief feedback
                area.style.background = 'rgba(255, 107, 53, 0.3)';
                area.style.opacity = '1';
                setTimeout(() => {
                    area.style.opacity = '0';
                }, 200);
                
                // Check sequence (clockwise from top-left)
                if (cornerSequence.length === 4 && 
                    cornerSequence.join(',') === '0,1,2,3') {
                    this.activateCornerEgg();
                    cornerSequence = [];
                } else if (cornerSequence.length >= 4) {
                    cornerSequence = [];
                }
            });
            
            document.body.appendChild(area);
        });
    }
    
    activateCornerEgg() {
        this.showEasterEggMessage('🔮 Secret Portal Discovered! 🔮');
        this.triggerEasterEgg('corners');
        
        // Create portal effect in center
        const portal = document.createElement('div');
        portal.className = 'portal-effect';
        portal.style.position = 'fixed';
        portal.style.left = '50%';
        portal.style.top = '50%';
        portal.style.transform = 'translate(-50%, -50%)';
        portal.style.width = '0';
        portal.style.height = '0';
        portal.style.borderRadius = '50%';
        portal.style.background = 'radial-gradient(circle, rgba(255, 107, 53, 0.8) 0%, rgba(30, 58, 138, 0.4) 50%, transparent 70%)';
        portal.style.animation = 'portal-expand 3s ease-out forwards';
        portal.style.zIndex = '1000';
        portal.style.pointerEvents = 'none';
        
        document.body.appendChild(portal);
        
        setTimeout(() => {
            portal.remove();
        }, 3000);
    }
    
    initLogoEgg() {
        const logos = document.querySelectorAll('.logo, .logo-img');
        let logoClickCount = 0;
        let lastLogoClick = 0;
        
        logos.forEach(logo => {
            logo.addEventListener('dblclick', (e) => {
                e.preventDefault();
                const now = Date.now();
                
                if (now - lastLogoClick < 2000) {
                    logoClickCount++;
                } else {
                    logoClickCount = 1;
                }
                
                lastLogoClick = now;
                
                if (logoClickCount >= 3) {
                    this.activateLogoEgg();
                    logoClickCount = 0;
                }
            });
        });
    }
    
    activateLogoEgg() {
        this.showEasterEggMessage('🐱 Mát Mát says Meow! 🤖');
        this.triggerEasterEgg('logo-click');
        
        // Make logo bounce and glow
        const logos = document.querySelectorAll('.logo, .logo-img');
        logos.forEach(logo => {
            logo.style.animation = 'logo-bounce 2s ease-in-out';
            logo.style.filter = 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.8))';
            
            setTimeout(() => {
                logo.style.animation = '';
                logo.style.filter = '';
            }, 2000);
        });
        
        // Create cat-themed particles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createCatParticle();
            }, i * 200);
        }
    }
    
    createCatParticle() {
        const particle = document.createElement('div');
        particle.textContent = Math.random() > 0.5 ? '🐱' : '🤖';
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        particle.style.fontSize = '20px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.animation = 'cat-float 4s linear forwards';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 4000);
    }
    
    initTypingEgg() {
        let typedSequence = '';
        const secretWords = ['matmat', 'chudu', 'magic', '011407', 'voucher', 'giamgia', 'khuyenmai', 'sale', 'freeship', 'discount'];
        
        document.addEventListener('keypress', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            typedSequence += e.key.toLowerCase();
            
            // Keep only last 10 characters
            if (typedSequence.length > 10) {
                typedSequence = typedSequence.slice(-10);
            }
            
            // Check for secret words
            secretWords.forEach(word => {
                if (typedSequence.includes(word)) {
                    this.activateTypingEgg(word);
                    typedSequence = '';
                }
            });
        });
    }
    
    activateTypingEgg(word) {
        const messages = {
            'matmat': '✨ Mát Mát Magic Activated! ✨',
            'chudu': '🚀 Chu Du Verse Portal Open! 🚀',
            'magic': '🎩 Abracadabra! Pure Magic! 🎩',
            '011407': 'Bạn trúng voucher 10k cap màn hình lại đi nha',
            'voucher': '🎫 Voucher Hunter Discovered! 🎫',
            'giamgia': '💰 Giảm Giá Master Found! 💰',
            'khuyenmai': '🏷️ Khuyến Mãi Expert! 🏷️',
            'sale': '🛍️ Sale Hunter Activated! 🛍️',
            'freeship': '🚚 Free Ship Hero! 🚚',
            'discount': '💳 Discount Master! 💳'
        };
        
        this.showEasterEggMessage(messages[word]);
        this.triggerEasterEgg(`typing-${word}`);
        
        // Create themed effect based on word
        if (word === 'magic') {
            this.createMagicEffect();
        } else if (word === 'chudu') {
            this.createRocketEffect();
        }
    }
    
    createMagicEffect() {
        // Create sparkle shower
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                this.createSparkleAt(x, y);
            }, i * 50);
        }
    }
    
    createRocketEffect() {
        const rocket = document.createElement('div');
        rocket.textContent = '🚀';
        rocket.style.position = 'fixed';
        rocket.style.left = '0px';
        rocket.style.bottom = '20px';
        rocket.style.fontSize = '30px';
        rocket.style.zIndex = '1000';
        rocket.style.animation = 'rocket-fly 3s ease-out forwards';
        
        document.body.appendChild(rocket);
        
        setTimeout(() => {
            rocket.remove();
        }, 3000);
    }
    
    initRainbowMode() {
        let rainbowClicks = 0;
        
        document.addEventListener('click', (e) => {
            if (e.shiftKey && e.ctrlKey) {
                rainbowClicks++;
                
                if (rainbowClicks >= 5) {
                    this.toggleRainbowMode();
                    rainbowClicks = 0;
                }
            }
        });
    }
    
    toggleRainbowMode() {
        const body = document.body;
        
        if (body.classList.contains('rainbow-mode')) {
            body.classList.remove('rainbow-mode');
            this.showEasterEggMessage('🌈 Rainbow Mode Disabled');
        } else {
            body.classList.add('rainbow-mode');
            this.showEasterEggMessage('🌈 Rainbow Mode Activated! 🌈');
        }
    }
    
    activatePartyMode() {
        document.body.classList.add('party-mode');
        
        // Create extra bubbles and effects - optimized frequency
        const partyInterval = setInterval(() => {
            this.createRandomBubble();
            if (Math.random() > 0.5) { // Reduced shape creation
                this.createRandomShape();
            }
            if (Math.random() > 0.8) { // Reduced sparkle frequency
                this.createSparkleAt(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            }
        }, 300); // Slightly slower interval
        
        // End party mode after 10 seconds
        setTimeout(() => {
            document.body.classList.remove('party-mode');
            clearInterval(partyInterval);
        }, 10000);
    }
    
    showEasterEggMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'easter-egg-message';
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 4000);
    }
    
    initWeatherSystem() {
        this.currentMood = 'default';
        this.weatherData = null;
        
        // Get user location and weather
        this.getUserLocationAndWeather();
        
        // Update mood based on time of day every minute
        setInterval(() => {
            this.updateMoodBasedOnTime();
        }, 60000);
        
        // Refresh weather data every 60 minutes (reduced frequency)
        setInterval(() => {
            this.getUserLocationAndWeather();
        }, 3600000);
        
        // Initial mood setup
        this.updateMoodBasedOnTime();
    }
    
    getUserLocationAndWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.getWeatherData(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    // console.log('Location access denied, using default mood system'); // Debug disabled
                    this.useDefaultMoodSystem();
                }
            );
        } else {
            this.useDefaultMoodSystem();
        }
    }
    
    async getWeatherData(lat, lon) {
        try {
            // Using Open-Meteo API (no API key required, more reliable)
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
            if (response.ok) {
                this.weatherData = await response.json();
                this.updateMoodBasedOnWeather();
            } else {
                this.useDefaultMoodSystem();
            }
        } catch (error) {
            // console.log('Weather data unavailable, using time-based mood'); // Debug disabled
            this.useDefaultMoodSystem();
        }
    }
    
    useDefaultMoodSystem() {
        // Fallback to time-based mood system
        this.updateMoodBasedOnTime();
    }
    
    updateMoodBasedOnWeather() {
        if (!this.weatherData || !this.weatherData.current_weather) {
            this.updateMoodBasedOnTime();
            return;
        }
        
        const currentWeather = this.weatherData.current_weather;
        const weatherCode = currentWeather.weathercode;
        const temp = Math.round(currentWeather.temperature);
        
        // Map Open-Meteo weather codes to moods
        let newMood = 'default';
        
        if (weatherCode === 0) { // Clear sky
            newMood = temp > 25 ? 'sunny-warm' : 'sunny-cool';
        } else if ([1, 2, 3].includes(weatherCode)) { // Partly cloudy to overcast
            newMood = 'cloudy';
        } else if ([45, 48].includes(weatherCode)) { // Fog and depositing rime fog
            newMood = 'misty';
        } else if ([51, 53, 55, 56, 57].includes(weatherCode)) { // Drizzle
            newMood = 'rainy-light';
        } else if ([61, 63, 65, 66, 67].includes(weatherCode)) { // Rain
            newMood = 'rainy-heavy';
        } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) { // Snow
            newMood = 'snowy';
        } else if ([80, 81, 82].includes(weatherCode)) { // Rain showers
            newMood = 'rainy-heavy';
        } else if ([95, 96, 99].includes(weatherCode)) { // Thunderstorm
            newMood = 'stormy';
        }
        
        // Apply temperature influence
        if (temp < 0) newMood += '-freezing';
        else if (temp > 35) newMood += '-hot';
        
        this.setMood(newMood);
        // console.log(`Weather: ${weatherCode}, Temp: ${temp}°C, Mood: ${newMood}`); // Debug disabled
    }
    
    updateMoodBasedOnTime() {
        const hour = new Date().getHours();
        let timeMood = 'default';
        
        if (hour >= 5 && hour < 8) {
            timeMood = 'dawn';
        } else if (hour >= 8 && hour < 17) {
            timeMood = 'day';
        } else if (hour >= 17 && hour < 20) {
            timeMood = 'dusk';
        } else if (hour >= 20 && hour < 23) {
            timeMood = 'evening';
        } else {
            timeMood = 'night';
        }
        
        // Combine with weather if available
        if (this.weatherData) {
            this.updateMoodBasedOnWeather();
        } else {
            this.setMood(timeMood);
        }
    }
    
    setMood(mood) {
        if (this.currentMood === mood) return;
        
        this.currentMood = mood;
        document.body.setAttribute('data-mood', mood);
        
        // Update background effects based on mood
        this.updateEffectsForMood(mood);
        
        // console.log(`Mood changed to: ${mood}`); // Debug disabled
    }
    
    updateEffectsForMood(mood) {
        // Adjust particle colors and behavior based on mood
        const moodSettings = this.getMoodSettings(mood);
        
        // Apply mood-specific CSS variables
        document.documentElement.style.setProperty('--mood-primary', moodSettings.primary);
        document.documentElement.style.setProperty('--mood-secondary', moodSettings.secondary);
        document.documentElement.style.setProperty('--mood-particle-opacity', moodSettings.particleOpacity);
        document.documentElement.style.setProperty('--mood-animation-speed', moodSettings.animationSpeed);
        
        // Create mood-specific particles
        if (moodSettings.specialEffect) {
            this.createMoodEffect(moodSettings.specialEffect);
        }
    }
    
    getMoodSettings(mood) {
        const settings = {
            'sunny-warm': {
                primary: 'rgba(255, 193, 7, 0.6)',
                secondary: 'rgba(255, 152, 0, 0.4)',
                particleOpacity: '0.8',
                animationSpeed: '0.8',
                specialEffect: 'sunshine'
            },
            'sunny-cool': {
                primary: 'rgba(135, 206, 235, 0.5)',
                secondary: 'rgba(255, 193, 7, 0.3)',
                particleOpacity: '0.6',
                animationSpeed: '1.0',
                specialEffect: null
            },
            'cloudy': {
                primary: 'rgba(169, 169, 169, 0.4)',
                secondary: 'rgba(192, 192, 192, 0.3)',
                particleOpacity: '0.5',
                animationSpeed: '1.2',
                specialEffect: null
            },
            'rainy-light': {
                primary: 'rgba(70, 130, 180, 0.5)',
                secondary: 'rgba(135, 206, 235, 0.3)',
                particleOpacity: '0.7',
                animationSpeed: '0.9',
                specialEffect: 'lightrain'
            },
            'rainy-heavy': {
                primary: 'rgba(25, 25, 112, 0.6)',
                secondary: 'rgba(70, 130, 180, 0.4)',
                particleOpacity: '0.8',
                animationSpeed: '0.7',
                specialEffect: 'heavyrain'
            },
            'stormy': {
                primary: 'rgba(75, 0, 130, 0.7)',
                secondary: 'rgba(138, 43, 226, 0.5)',
                particleOpacity: '0.9',
                animationSpeed: '0.5',
                specialEffect: 'lightning'
            },
            'snowy': {
                primary: 'rgba(240, 248, 255, 0.6)',
                secondary: 'rgba(176, 196, 222, 0.4)',
                particleOpacity: '0.8',
                animationSpeed: '1.5',
                specialEffect: 'snow'
            },
            'misty': {
                primary: 'rgba(220, 220, 220, 0.4)',
                secondary: 'rgba(192, 192, 192, 0.2)',
                particleOpacity: '0.3',
                animationSpeed: '1.8',
                specialEffect: 'mist'
            },
            'dawn': {
                primary: 'rgba(255, 182, 193, 0.5)',
                secondary: 'rgba(255, 160, 122, 0.3)',
                particleOpacity: '0.6',
                animationSpeed: '1.2',
                specialEffect: null
            },
            'day': {
                primary: 'rgba(255, 107, 53, 0.4)',
                secondary: 'rgba(255, 255, 255, 0.3)',
                particleOpacity: '0.5',
                animationSpeed: '1.0',
                specialEffect: null
            },
            'dusk': {
                primary: 'rgba(255, 99, 71, 0.5)',
                secondary: 'rgba(255, 140, 0, 0.3)',
                particleOpacity: '0.7',
                animationSpeed: '1.1',
                specialEffect: null
            },
            'evening': {
                primary: 'rgba(72, 61, 139, 0.5)',
                secondary: 'rgba(147, 112, 219, 0.3)',
                particleOpacity: '0.6',
                animationSpeed: '1.3',
                specialEffect: null
            },
            'night': {
                primary: 'rgba(25, 25, 112, 0.6)',
                secondary: 'rgba(72, 61, 139, 0.4)',
                particleOpacity: '0.8',
                animationSpeed: '1.5',
                specialEffect: 'stars'
            }
        };
        
        return settings[mood] || settings['day'];
    }
    
    createMoodEffect(effect) {
        switch (effect) {
            case 'sunshine':
                this.createSunbeams();
                break;
            case 'lightrain':
                this.createRaindrops(5);
                break;
            case 'heavyrain':
                this.createRaindrops(15);
                break;
            case 'lightning':
                this.createLightningFlash();
                break;
            case 'snow':
                this.createSnowflakes();
                break;
            case 'mist':
                this.createMistEffect();
                break;
            case 'stars':
                this.createStars();
                break;
        }
    }
    
    createSunbeams() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const sunbeam = document.createElement('div');
                sunbeam.className = 'sunbeam-effect';
                sunbeam.style.position = 'fixed';
                sunbeam.style.top = '0';
                sunbeam.style.left = Math.random() * window.innerWidth + 'px';
                sunbeam.style.width = '2px';
                sunbeam.style.height = '100vh';
                sunbeam.style.background = 'linear-gradient(180deg, rgba(255, 193, 7, 0.3) 0%, transparent 70%)';
                sunbeam.style.animation = 'sunbeam-fade 4s ease-out forwards';
                sunbeam.style.pointerEvents = 'none';
                sunbeam.style.zIndex = '1';
                
                document.body.appendChild(sunbeam);
                
                setTimeout(() => {
                    sunbeam.remove();
                }, 4000);
            }, i * 1000);
        }
    }
    
    createRaindrops(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const raindrop = document.createElement('div');
                raindrop.className = 'raindrop-effect';
                raindrop.style.position = 'fixed';
                raindrop.style.left = Math.random() * window.innerWidth + 'px';
                raindrop.style.top = '-10px';
                raindrop.style.width = '2px';
                raindrop.style.height = '20px';
                raindrop.style.background = 'rgba(70, 130, 180, 0.6)';
                raindrop.style.animation = 'raindrop-fall 1s linear forwards';
                raindrop.style.pointerEvents = 'none';
                raindrop.style.zIndex = '2';
                
                document.body.appendChild(raindrop);
                
                setTimeout(() => {
                    raindrop.remove();
                }, 1000);
            }, i * 100);
        }
    }
    
    createLightningFlash() {
        const lightning = document.createElement('div');
        lightning.style.position = 'fixed';
        lightning.style.top = '0';
        lightning.style.left = '0';
        lightning.style.width = '100vw';
        lightning.style.height = '100vh';
        lightning.style.background = 'rgba(255, 255, 255, 0.9)';
        lightning.style.pointerEvents = 'none';
        lightning.style.zIndex = '1000';
        lightning.style.animation = 'lightning-flash 0.3s ease-out forwards';
        
        document.body.appendChild(lightning);
        
        setTimeout(() => {
            lightning.remove();
        }, 300);
    }
    
    createSnowflakes() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const snowflake = document.createElement('div');
                snowflake.textContent = '❄';
                snowflake.style.position = 'fixed';
                snowflake.style.left = Math.random() * window.innerWidth + 'px';
                snowflake.style.top = '-20px';
                snowflake.style.fontSize = (8 + Math.random() * 12) + 'px';
                snowflake.style.color = 'rgba(240, 248, 255, 0.8)';
                snowflake.style.animation = 'snowflake-fall 8s linear forwards';
                snowflake.style.pointerEvents = 'none';
                snowflake.style.zIndex = '2';
                
                document.body.appendChild(snowflake);
                
                setTimeout(() => {
                    snowflake.remove();
                }, 8000);
            }, i * 200);
        }
    }
    
    createMistEffect() {
        const mist = document.createElement('div');
        mist.className = 'mist-effect';
        mist.style.position = 'fixed';
        mist.style.bottom = '0';
        mist.style.left = '0';
        mist.style.width = '100vw';
        mist.style.height = '30vh';
        mist.style.background = 'linear-gradient(0deg, rgba(220, 220, 220, 0.3) 0%, transparent 100%)';
        mist.style.animation = 'mist-drift 10s ease-in-out infinite';
        mist.style.pointerEvents = 'none';
        mist.style.zIndex = '1';
        
        document.body.appendChild(mist);
        
        setTimeout(() => {
            mist.remove();
        }, 10000);
    }
    
    createStars() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.textContent = '✨';
                star.style.position = 'fixed';
                star.style.left = Math.random() * window.innerWidth + 'px';
                star.style.top = Math.random() * (window.innerHeight / 2) + 'px';
                star.style.fontSize = (6 + Math.random() * 8) + 'px';
                star.style.color = 'rgba(255, 255, 255, 0.8)';
                star.style.animation = 'star-twinkle 3s ease-in-out infinite';
                star.style.pointerEvents = 'none';
                star.style.zIndex = '2';
                
                document.body.appendChild(star);
                
                setTimeout(() => {
                    star.remove();
                }, 6000);
            }, i * 300);
        }
    }
    
    // Trigger Easter egg event for coupon system
    triggerEasterEgg(type) {
        const event = new CustomEvent('easterEggTriggered', {
            detail: { type: type }
        });
        document.dispatchEvent(event);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveBackground();
});