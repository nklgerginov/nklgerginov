// assets/js/animations.js

import { DOM, Events, Device, Performance, Animation } from './utils.js';

/**
 * Animation Manager
 * Handles scroll-triggered animations, counters, and interactive effects
 */
class AnimationManager {
  constructor() {
    this.observers = [];
    this.animatedElements = new Set();
    this.counters = [];
    this.parallaxElements = [];
    this.mouseEffects = new Map();
    
    // Configuration
    this.config = {
      observerThreshold: 0.1,
      observerRootMargin: '0px 0px -50px 0px',
      counterDuration: 2000,
      parallaxStrength: 0.5,
      debounceDelay: 16 // ~60fps
    };
    
    this.init();
  }
  
  /**
   * Initialize animation system
   */
  init() {
    if (Device.prefersReducedMotion()) {
      console.log('Reduced motion detected - skipping animations');
      return;
    }
    
    this.setupScrollObserver();
    this.setupCounters();
    this.setupParallax();
    this.setupMouseEffects();
    this.setupInteractiveElements();
    
    console.log('Animation system initialized');
  }
  
  /**
   * Setup intersection observer for scroll animations
   */
  setupScrollObserver() {
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver not supported');
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: this.config.observerThreshold,
        rootMargin: this.config.observerRootMargin
      }
    );
    
    // Observe elements with scroll reveal classes
    const scrollElements = DOM.selectAll(`
      .scroll-reveal,
      .scroll-reveal-left,
      .scroll-reveal-right,
      .scroll-reveal-scale,
      [data-aos],
      .timeline-item,
      .glass-card,
      .skill-category
    `);
    
    scrollElements.forEach(element => {
      observer.observe(element);
    });
    
    this.observers.push(observer);
    console.log(`Observing ${scrollElements.length} elements for scroll animations`);
  }
  
  /**
   * Animate element when it comes into view
   */
  animateElement(element) {
    if (this.animatedElements.has(element)) return;
    
    this.animatedElements.add(element);
    
    // Get animation delay from data attribute
    const delay = parseInt(element.dataset.delay) || 0;
    
    setTimeout(() => {
      // Add revealed class for CSS transitions
      if (DOM.hasClass(element, 'scroll-reveal')) {
        DOM.addClass(element, 'revealed');
      } else if (DOM.hasClass(element, 'scroll-reveal-left')) {
        DOM.addClass(element, 'revealed');
      } else if (DOM.hasClass(element, 'scroll-reveal-right')) {
        DOM.addClass(element, 'revealed');
      } else if (DOM.hasClass(element, 'scroll-reveal-scale')) {
        DOM.addClass(element, 'revealed');
      }
      
      // Handle data-aos animations
      const aosType = element.dataset.aos;
      if (aosType) {
        this.triggerAOSAnimation(element, aosType);
      }
      
      // Handle specific element types
      if (DOM.hasClass(element, 'timeline-item')) {
        DOM.addClass(element, 'animate-fade-in-up');
      }
      
      if (DOM.hasClass(element, 'glass-card')) {
        DOM.addClass(element, 'animate-fade-in-up');
      }
      
      if (DOM.hasClass(element, 'skill-category')) {
        DOM.addClass(element, 'animate-fade-in-up');
      }
    }, delay);
  }
  
  /**
   * Trigger AOS (Animate On Scroll) animation
   */
  triggerAOSAnimation(element, animationType) {
    const animationMap = {
      'fade-up': 'animate-fade-in-up',
      'fade-down': 'animate-fade-in-down',
      'fade-left': 'animate-fade-in-left',
      'fade-right': 'animate-fade-in-right',
      'fade-in': 'animate-fade-in',
      'zoom-in': 'animate-scale-in',
      'flip-left': 'animate-flip-in-x',
      'flip-right': 'animate-flip-in-y'
    };
    
    const animationClass = animationMap[animationType];
    if (animationClass) {
      DOM.addClass(element, animationClass);
    }
  }
  
  /**
   * Setup counter animations
   */
  setupCounters() {
    const counterElements = DOM.selectAll('[data-count]');
    
    counterElements.forEach(element => {
      const targetValue = parseInt(element.dataset.count) || 0;
      const duration = parseInt(element.dataset.duration) || this.config.counterDuration;
      
      this.counters.push({
        element,
        targetValue,
        duration,
        animated: false
      });
    });
    
    if (this.counters.length > 0) {
      this.setupCounterObserver();
    }
  }
  
  /**
   * Setup observer for counter animations
   */
  setupCounterObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const counter = this.counters.find(c => c.element === entry.target);
            if (counter && !counter.animated) {
              this.animateCounter(counter);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.5
      }
    );
    
    this.counters.forEach(counter => {
      observer.observe(counter.element);
    });
    
    this.observers.push(observer);
  }
  
  /**
   * Animate counter from 0 to target value
   */
  animateCounter(counter) {
    if (counter.animated) return;
    
    counter.animated = true;
    const { element, targetValue, duration } = counter;
    
    Animation.animateNumber(
      element,
      0,
      targetValue,
      duration,
      () => {
        // Add completion callback if needed
        DOM.addClass(element, 'counter-complete');
      }
    );
  }
  
  /**
   * Setup parallax effects
   */
  setupParallax() {
    this.parallaxElements = Array.from(DOM.selectAll('[data-parallax]'));
    
    if (this.parallaxElements.length === 0) return;
    
    const updateParallax = Events.throttle(() => {
      const scrollY = window.pageYOffset;
      
      this.parallaxElements.forEach(element => {
        if (!DOM.isInViewport(element, 0.2)) return;
        
        const speed = parseFloat(element.dataset.parallax) || this.config.parallaxStrength;
        const yPos = scrollY * speed;
        
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }, this.config.debounceDelay);
    
    DOM.on(window, 'scroll', updateParallax);
  }
  
  /**
   * Setup mouse follow effects for glassmorphism
   */
  setupMouseEffects() {
    const glassElements = DOM.selectAll(`
      .btn,
      .glass-card,
      .contact-item,
      .timeline-content,
      .social-link,
      .nav-link,
      .theme-toggle
    `);
    
    glassElements.forEach(element => {
      this.setupMouseEffect(element);
    });
  }
  
  /**
   * Setup mouse effect for individual element
   */
  setupMouseEffect(element) {
    let mouseX = 0;
    let mouseY = 0;
    
    const updateMousePosition = (e) => {
      const rect = element.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      mouseY = ((e.clientY - rect.top) / rect.height) * 100;
      
      element.style.setProperty('--mouse-x', `${mouseX}%`);
      element.style.setProperty('--mouse-y', `${mouseY}%`);
    };
    
    const showEffect = () => {
      DOM.addClass(element, 'glass-mouse-effect');
    };
    
    const hideEffect = () => {
      DOM.removeClass(element, 'glass-mouse-effect');
    };
    
    DOM.on(element, 'mousemove', updateMousePosition);
    DOM.on(element, 'mouseenter', showEffect);
    DOM.on(element, 'mouseleave', hideEffect);
    
    // Store cleanup functions
    this.mouseEffects.set(element, {
      cleanup: () => {
        element.removeEventListener('mousemove', updateMousePosition);
        element.removeEventListener('mouseenter', showEffect);
        element.removeEventListener('mouseleave', hideEffect);
      }
    });
  }
  
  /**
   * Setup interactive element effects
   */
  setupInteractiveElements() {
    // Add hover effects to cards
    const cards = DOM.selectAll('.glass-card, .skill-category, .timeline-content');
    cards.forEach(card => {
      this.setupCardEffects(card);
    });
    
    // Add click ripple effect to buttons
    const buttons = DOM.selectAll('.btn');
    buttons.forEach(button => {
      this.setupRippleEffect(button);
    });
    
    // Add floating animation to hero elements
    const floatingElements = DOM.selectAll('.hero-badge, .scroll-indicator');
    floatingElements.forEach(element => {
      DOM.addClass(element, 'animate-float');
    });
  }
  
  /**
   * Setup card hover effects
   */
  setupCardEffects(card) {
    DOM.on(card, 'mouseenter', () => {
      DOM.addClass(card, 'hover-lift');
    });
    
    DOM.on(card, 'mouseleave', () => {
      DOM.removeClass(card, 'hover-lift');
    });
  }
  
  /**
   * Setup ripple effect for buttons
   */
  setupRippleEffect(button) {
    DOM.on(button, 'click', (e) => {
      const ripple = DOM.create('span', {
        className: 'ripple'
      });
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      // Add ripple styles to head if not exists
      if (!DOM.select('#ripple-styles')) {
        const style = DOM.create('style', {
          id: 'ripple-styles'
        }, `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          .btn {
            position: relative;
            overflow: hidden;
          }
        `);
        document.head.appendChild(style);
      }
      
      button.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
  }
  
  /**
   * Add stagger animation to elements
   */
  addStaggerAnimation(elements, animationClass, delay = 100) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        DOM.addClass(element, animationClass);
      }, index * delay);
    });
  }
  
  /**
   * Animate skill tags on hover
   */
  setupSkillTagAnimations() {
    const skillTags = DOM.selectAll('.skill-tag, .tech-tag');
    
    skillTags.forEach(tag => {
      DOM.on(tag, 'mouseenter', () => {
        DOM.addClass(tag, 'animate-pulse');
      });
      
      DOM.on(tag, 'mouseleave', () => {
        DOM.removeClass(tag, 'animate-pulse');
      });
    });
  }
  
  /**
   * Create loading animation
   */
  createLoadingAnimation(container) {
    const loader = DOM.create('div', {
      className: 'loading-spinner'
    });
    
    container.appendChild(loader);
    
    return {
      remove: () => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }
    };
  }
  
  /**
   * Animate form submission
   */
  animateFormSubmission(form, button) {
    const originalText = button.innerHTML;
    
    // Add loading state
    button.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div> Sending...';
    button.disabled = true;
    DOM.addClass(button, 'loading');
    
    return {
      success: () => {
        button.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
        DOM.removeClass(button, 'loading');
        DOM.addClass(button, 'success');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
          DOM.removeClass(button, 'success');
        }, 3000);
      },
      
      error: () => {
        button.innerHTML = '<i class="fas fa-times"></i> Failed to Send';
        DOM.removeClass(button, 'loading');
        DOM.addClass(button, 'error');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
          DOM.removeClass(button, 'error');
        }, 3000);
      }
    };
  }
  
  /**
   * Cleanup all observers and effects
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    this.mouseEffects.forEach(effect => effect.cleanup());
    this.mouseEffects.clear();
    
    this.animatedElements.clear();
    this.counters = [];
    this.parallaxElements = [];
    
    console.log('Animation manager destroyed');
  }
}

// Create singleton instance
const animationManager = new AnimationManager();

export { AnimationManager, animationManager as default };