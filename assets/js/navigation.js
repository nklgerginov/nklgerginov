// assets/js/navigation.js

import { DOM, Events, Device, Performance } from './utils.js';

/**
 * Navigation Manager
 * Handles smooth scrolling, active section detection, and mobile menu
 */
class NavigationManager {
  constructor() {
    this.header = null;
    this.navLinks = [];
    this.sections = [];
    this.mobileMenuToggle = null;
    this.navLinksContainer = null;
    this.isScrolling = false;
    this.currentActiveSection = null;
    
    // Configuration
    this.config = {
      headerOffset: 80,
      scrollDuration: 800,
      threshold: 0.3,
      mobileBreakpoint: 768
    };
    
    this.init();
  }
  
  /**
   * Initialize navigation system
   */
  init() {
    this.cacheElements();
    this.setupSmoothScrolling();
    this.setupActiveSection();
    this.setupMobileMenu();
    this.setupScrollHeader();
    this.bindEvents();
    
    console.log('Navigation system initialized');
  }
  
  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.header = DOM.select('.header');
    this.navLinksContainer = DOM.select('.nav-links');
    this.navLinks = Array.from(DOM.selectAll('.nav-link[href^="#"]'));
    this.mobileMenuToggle = DOM.select('.mobile-menu-toggle');
    
    // Cache sections that correspond to navigation links
    this.sections = this.navLinks.map(link => {
      const href = link.getAttribute('href');
      const sectionId = href.substring(1);
      const section = DOM.select(`#${sectionId}`);
      
      return {
        id: sectionId,
        element: section,
        link: link,
        href: href
      };
    }).filter(section => section.element);
    
    console.log(`Cached ${this.sections.length} sections and ${this.navLinks.length} nav links`);
  }
  
  /**
   * Setup smooth scrolling for navigation links
   */
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      DOM.on(link, 'click', (e) => {
        e.preventDefault();
        
        const href = link.getAttribute('href');
        const targetSection = this.sections.find(section => section.href === href);
        
        if (targetSection && targetSection.element) {
          this.scrollToSection(targetSection.element);
          
          // Close mobile menu if open
          this.closeMobileMenu();
        }
      });
    });
  }
  
  /**
   * Smooth scroll to target element
   */
  scrollToSection(target) {
    if (!target) return;
    
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - this.config.headerOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    
    if (Device.prefersReducedMotion()) {
      // Instant scroll for users who prefer reduced motion
      window.scrollTo(0, targetPosition);
      return;
    }
    
    // Smooth animated scroll
    this.isScrolling = true;
    const startTime = performance.now();
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.scrollDuration, 1);
      
      // Easing function (ease-in-out)
      const easing = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      const currentPosition = startPosition + (distance * easing);
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        this.isScrolling = false;
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
  
  /**
   * Setup active section detection
   */
  setupActiveSection() {
    const updateActiveSection = Events.throttle(() => {
      if (this.isScrolling) return;
      
      const scrollPosition = window.pageYOffset + this.config.headerOffset;
      let activeSection = null;
      
      // Find the current section
      for (let i = this.sections.length - 1; i >= 0; i--) {
        const section = this.sections[i];
        if (!section.element) continue;
        
        const sectionTop = section.element.offsetTop;
        const sectionHeight = section.element.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        // Check if we're in this section
        if (scrollPosition >= sectionTop - 100 && scrollPosition <= sectionBottom) {
          activeSection = section;
          break;
        }
      }
      
      // Update active states
      this.updateActiveLinks(activeSection);
      
    }, 100);
    
    DOM.on(window, 'scroll', updateActiveSection);
    DOM.on(window, 'load', updateActiveSection);
    
    // Initial call
    updateActiveSection();
  }
  
  /**
   * Update active navigation links
   */
  updateActiveLinks(activeSection) {
    if (activeSection === this.currentActiveSection) return;
    
    // Remove active class from all links
    this.navLinks.forEach(link => {
      DOM.removeClass(link, 'active');
    });
    
    // Add active class to current section link
    if (activeSection && activeSection.link) {
      DOM.addClass(activeSection.link, 'active');
    }
    
    this.currentActiveSection = activeSection;
  }
  
  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    if (!this.mobileMenuToggle || !this.navLinksContainer) {
      console.warn('Mobile menu elements not found');
      return;
    }
    
    // Toggle mobile menu
    DOM.on(this.mobileMenuToggle, 'click', () => {
      this.toggleMobileMenu();
    });
    
    // Close menu when clicking nav links
    this.navLinks.forEach(link => {
      DOM.on(link, 'click', () => {
        this.closeMobileMenu();
      });
    });
    
    // Close menu when clicking outside
    DOM.on(document, 'click', (e) => {
      const isMenuClick = this.mobileMenuToggle.contains(e.target);
      const isNavClick = this.navLinksContainer.contains(e.target);
      
      if (!isMenuClick && !isNavClick && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });
    
    // Close menu on escape key
    DOM.on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });
    
    // Close menu on window resize if it becomes desktop
    DOM.on(window, 'resize', Events.debounce(() => {
      if (window.innerWidth >= this.config.mobileBreakpoint && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    }, 250));
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const isOpen = this.isMobileMenuOpen();
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  /**
   * Open mobile menu
   */
  openMobileMenu() {
    DOM.addClass(this.mobileMenuToggle, 'active');
    DOM.addClass(this.navLinksContainer, 'active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    // Focus first menu item for accessibility
    const firstNavLink = this.navLinks[0];
    if (firstNavLink) {
      setTimeout(() => firstNavLink.focus(), 100);
    }
    
    // Update aria attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    this.navLinksContainer.setAttribute('aria-hidden', 'false');
  }
  
  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    DOM.removeClass(this.mobileMenuToggle, 'active');
    DOM.removeClass(this.navLinksContainer, 'active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Update aria attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    this.navLinksContainer.setAttribute('aria-hidden', 'true');
  }
  
  /**
   * Check if mobile menu is open
   */
  isMobileMenuOpen() {
    return DOM.hasClass(this.mobileMenuToggle, 'active');
  }
  
  /**
   * Setup scrolling header effects
   */
  setupScrollHeader() {
    if (!this.header) return;
    
    let lastScrollY = window.pageYOffset;
    let isHeaderHidden = false;
    
    const updateHeader = Events.throttle(() => {
      const currentScrollY = window.pageYOffset;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrolledPastThreshold = currentScrollY > 100;
      
      // Add scrolled class for styling
      DOM.toggleClass(this.header, 'scrolled', scrolledPastThreshold);
      
      // Hide/show header based on scroll direction (desktop only)
      if (Device.isDesktop() && scrolledPastThreshold) {
        if (scrollingDown && !isHeaderHidden) {
          // Hide header
          this.header.style.transform = 'translateY(-100%)';
          isHeaderHidden = true;
        } else if (!scrollingDown && isHeaderHidden) {
          // Show header
          this.header.style.transform = 'translateY(0)';
          isHeaderHidden = false;
        }
      } else if (!scrolledPastThreshold && isHeaderHidden) {
        // Always show header when at top
        this.header.style.transform = 'translateY(0)';
        isHeaderHidden = false;
      }
      
      lastScrollY = currentScrollY;
    }, 16); // ~60fps
    
    DOM.on(window, 'scroll', updateHeader);
  }
  
  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Handle keyboard navigation for menu items
    this.navLinks.forEach((link, index) => {
      DOM.on(link, 'keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            const nextIndex = (index + 1) % this.navLinks.length;
            this.navLinks[nextIndex].focus();
            break;
            
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            const prevIndex = (index - 1 + this.navLinks.length) % this.navLinks.length;
            this.navLinks[prevIndex].focus();
            break;
            
          case 'Home':
            e.preventDefault();
            this.navLinks[0].focus();
            break;
            
          case 'End':
            e.preventDefault();
            this.navLinks[this.navLinks.length - 1].focus();
            break;
        }
      });
    });
  }
  
  /**
   * Bind additional events
   */
  bindEvents() {
    this.setupKeyboardNavigation();
    
    // Handle hash changes in URL
    DOM.on(window, 'hashchange', () => {
      const hash = window.location.hash;
      if (hash) {
        const target = DOM.select(hash);
        if (target) {
          setTimeout(() => this.scrollToSection(target), 100);
        }
      }
    });
    
    // Handle initial hash on page load
    DOM.on(window, 'load', () => {
      const hash = window.location.hash;
      if (hash) {
        const target = DOM.select(hash);
        if (target) {
          setTimeout(() => this.scrollToSection(target), 500);
        }
      }
    });
  }
  
  /**
   * Navigate to specific section by ID
   */
  navigateToSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (section && section.element) {
      this.scrollToSection(section.element);
      
      // Update URL hash
      history.pushState(null, null, `#${sectionId}`);
    }
  }
  
  /**
   * Get current active section
   */
  getCurrentSection() {
    return this.currentActiveSection;
  }
  
  /**
   * Get all sections
   */
  getSections() {
    return this.sections;
  }
  
  /**
   * Refresh navigation (useful after dynamic content changes)
   */
  refresh() {
    this.cacheElements();
    this.setupActiveSection();
    console.log('Navigation refreshed');
  }
  
  /**
   * Destroy navigation manager
   */
  destroy() {
    // Close mobile menu if open
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
    
    // Clean up would happen automatically with modern event listeners
    // but this provides a consistent API
    console.log('Navigation manager destroyed');
  }
}

/**
 * Navigation utilities
 */
export const NavigationUtils = {
  /**
   * Get section from element
   */
  getSectionFromElement: (element) => {
    // Walk up the DOM to find the nearest section
    let current = element;
    while (current && current !== document.body) {
      if (current.tagName === 'SECTION' && current.id) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  },
  
  /**
   * Get distance to element
   */
  getDistanceToElement: (element) => {
    const rect = element.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  },
  
  /**
   * Check if element is in viewport
   */
  isElementInViewport: (element, threshold = 0) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    return rect.top < windowHeight * (1 - threshold) && 
           rect.bottom > windowHeight * threshold;
  },
  
  /**
   * Smooth scroll to top
   */
  scrollToTop: (duration = 800) => {
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    
    if (Device.prefersReducedMotion()) {
      window.scrollTo(0, 0);
      return;
    }
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easing = 1 - Math.pow(1 - progress, 3); // ease-out
      const position = startPosition * (1 - easing);
      
      window.scrollTo(0, position);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
};

// Create singleton instance
const navigationManager = new NavigationManager();

export { NavigationManager, navigationManager as default };