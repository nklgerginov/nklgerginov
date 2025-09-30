// assets/js/main.js

import themeManager from './theme.js';
import navigationManager from './navigation.js';
import animationManager from './animations.js';
import formManager from './forms.js';
import { DOM, Device, Performance } from './utils.js';

/**
 * Main Application Class
 * Orchestrates all modules and handles global functionality
 */
class PortfolioApp {
  constructor() {
    this.modules = {
      theme: themeManager,
      navigation: navigationManager,
      animation: animationManager,
      form: formManager
    };
    
    this.initialized = false;
    this.loadTime = null;
    
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    const startTime = performance.now();
    
    console.log('🚀 Initializing Portfolio Application...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      DOM.on(document, 'DOMContentLoaded', () => {
        this.onDOMReady();
      });
    } else {
      this.onDOMReady();
    }
    
    // Wait for everything to load
    DOM.on(window, 'load', () => {
      this.onLoad();
      this.loadTime = performance.now() - startTime;
      console.log(`✅ Application fully loaded in ${this.loadTime.toFixed(2)}ms`);
    });
  }
  
  /**
   * Handle DOM ready event
   */
  onDOMReady() {
    console.log('📄 DOM Ready');
    
    // Initialize features that don't depend on images/resources
    this.setupDeviceDetection();
    this.setupExternalLinks();
    this.setupAccessibility();
    this.setupAnalytics();
    this.setupServiceWorker();
    
    this.initialized = true;
    console.log('✓ Core features initialized');
  }
  
  /**
   * Handle window load event
   */
  onLoad() {
    console.log('🎨 All resources loaded');
    
    // Features that need all resources loaded
    this.setupLazyLoading();
    this.setupPerformanceMonitoring();
    this.removeLoadingState();
    
    // Log device and performance info
    this.logAppInfo();
  }
  
  /**
   * Setup device detection and add classes to body
   */
  setupDeviceDetection() {
    const body = document.body;
    
    // Add device type classes
    if (Device.isMobile()) {
      DOM.addClass(body, 'is-mobile');
    } else if (Device.isTablet()) {
      DOM.addClass(body, 'is-tablet');
    } else {
      DOM.addClass(body, 'is-desktop');
    }
    
    // Add touch support class
    if (Device.isTouch()) {
      DOM.addClass(body, 'is-touch');
    } else {
      DOM.addClass(body, 'is-pointer');
    }
    
    // Add reduced motion class
    if (Device.prefersReducedMotion()) {
      DOM.addClass(body, 'reduced-motion');
    }
    
    console.log('✓ Device detection setup');
  }
  
  /**
   * Setup external links to open in new tab
   */
  setupExternalLinks() {
    const externalLinks = Array.from(DOM.selectAll('a[href^="http"]')).filter(link => {
      return !link.href.includes(window.location.hostname);
    });
    
    externalLinks.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // Add external link icon
      if (!link.querySelector('.external-icon')) {
        const icon = DOM.create('span', {
          className: 'external-icon sr-only'
        }, ' (opens in new tab)');
        link.appendChild(icon);
      }
    });
    
    console.log(`✓ Configured ${externalLinks.length} external links`);
  }
  
  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Skip to content link
    this.setupSkipToContent();
    
    // Focus visible styles
    this.setupFocusVisible();
    
    // Keyboard shortcuts helper
    this.setupKeyboardShortcuts();
    
    // ARIA live regions
    this.setupLiveRegions();
    
    console.log('✓ Accessibility features setup');
  }
  
  /**
   * Setup skip to content link
   */
  setupSkipToContent() {
    if (DOM.select('.skip-to-content')) return;
    
    const skipLink = DOM.create('a', {
      href: '#main',
      className: 'skip-to-content'
    }, 'Skip to main content');
    
    // Insert at beginning of body
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add styles
    if (!DOM.select('#skip-to-content-styles')) {
      const style = DOM.create('style', {
        id: 'skip-to-content-styles'
      }, `
        .skip-to-content {
          position: absolute;
          top: -40px;
          left: 0;
          background: hsl(var(--color-primary));
          color: white;
          padding: 8px;
          text-decoration: none;
          z-index: 100;
        }
        .skip-to-content:focus {
          top: 0;
        }
      `);
      document.head.appendChild(style);
    }
  }
  
  /**
   * Setup focus-visible polyfill behavior
   */
  setupFocusVisible() {
    let hadKeyboardEvent = false;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        hadKeyboardEvent = true;
      }
    };
    
    const handleMouseDown = () => {
      hadKeyboardEvent = false;
    };
    
    const handleFocus = (e) => {
      if (hadKeyboardEvent) {
        DOM.addClass(e.target, 'focus-visible');
      }
    };
    
    const handleBlur = (e) => {
      DOM.removeClass(e.target, 'focus-visible');
    };
    
    DOM.on(document, 'keydown', handleKeyDown);
    DOM.on(document, 'mousedown', handleMouseDown);
    DOM.on(document, 'focus', handleFocus, { capture: true });
    DOM.on(document, 'blur', handleBlur, { capture: true });
  }
  
  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    const shortcuts = {
      '?': () => this.showKeyboardHelp(),
      '/': (e) => {
        e.preventDefault();
        const searchInput = DOM.select('[type="search"]');
        if (searchInput) searchInput.focus();
      }
    };
    
    DOM.on(document, 'keydown', (e) => {
      // Don't trigger shortcuts if typing in input
      if (e.target.matches('input, textarea')) return;
      
      const handler = shortcuts[e.key];
      if (handler) {
        handler(e);
      }
    });
  }
  
  /**
   * Show keyboard shortcuts help
   */
  showKeyboardHelp() {
    const helpText = `
      Keyboard Shortcuts:
      - Ctrl/Cmd + Shift + T: Toggle theme
      - ?: Show this help
      - Escape: Close mobile menu
      - Tab: Navigate between elements
    `;
    
    console.log(helpText);
    // You could also show this in a modal
  }
  
  /**
   * Setup ARIA live regions
   */
  setupLiveRegions() {
    if (DOM.select('#announcements')) return;
    
    const liveRegion = DOM.create('div', {
      id: 'announcements',
      className: 'sr-only',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });
    
    document.body.appendChild(liveRegion);
  }
  
  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    const liveRegion = DOM.select('#announcements');
    if (!liveRegion) return;
    
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
  
  /**
   * Setup analytics (replace with your analytics solution)
   */
  setupAnalytics() {
    // Example: Google Analytics, Plausible, etc.
    // This is where you'd initialize your analytics
    
    // Track page view
    this.trackPageView();
    
    // Track external link clicks
    this.trackExternalClicks();
    
    console.log('✓ Analytics setup');
  }
  
  /**
   * Track page view
   */
  trackPageView() {
    // Example implementation
    // window.gtag?.('event', 'page_view');
    console.log('📊 Page view tracked');
  }
  
  /**
   * Track external link clicks
   */
  trackExternalClicks() {
    DOM.selectAll('a[target="_blank"]').forEach(link => {
      DOM.on(link, 'click', () => {
        const href = link.href;
        console.log('🔗 External click:', href);
        // window.gtag?.('event', 'click', { link_url: href });
      });
    });
  }
  
  /**
   * Setup Service Worker for PWA functionality
   */
  setupServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ Service Worker not supported');
      return;
    }
    
    // Register service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✓ Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  }
  
  /**
   * Setup lazy loading for images
   */
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.log('⚠️ IntersectionObserver not supported, loading all images');
      return;
    }
    
    const images = DOM.selectAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    console.log(`✓ Lazy loading ${images.length} images`);
  }
  
  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    if (!window.PerformanceObserver) {
      console.log('⚠️ PerformanceObserver not supported');
      return;
    }
    
    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('📈 LCP:', lastEntry.renderTime || lastEntry.loadTime);
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('⚠️ LCP observer not supported');
    }
    
    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('📈 FID:', entry.processingStart - entry.startTime);
      });
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.log('⚠️ FID observer not supported');
    }
  }
  
  /**
   * Remove loading state
   */
  removeLoadingState() {
    const loader = DOM.select('.page-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }, 500);
    }
    
    DOM.removeClass(document.body, 'loading');
  }
  
  /**
   * Log application info
   */
  logAppInfo() {
    const viewport = Device.getViewport();
    
    console.log('📱 Application Info:', {
      device: {
        type: Device.isMobile() ? 'mobile' : Device.isTablet() ? 'tablet' : 'desktop',
        touch: Device.isTouch(),
        viewport: `${viewport.width}x${viewport.height}`
      },
      theme: this.modules.theme.getThemeInfo(),
      performance: {
        loadTime: `${this.loadTime.toFixed(2)}ms`
      },
      features: {
        serviceWorker: 'serviceWorker' in navigator,
        intersectionObserver: 'IntersectionObserver' in window,
        webGL: !!document.createElement('canvas').getContext('webgl')
      }
    });
  }
  
  /**
   * Get application state
   */
  getState() {
    return {
      initialized: this.initialized,
      loadTime: this.loadTime,
      modules: Object.keys(this.modules)
    };
  }
  
  /**
   * Destroy application and cleanup
   */
  destroy() {
    Object.values(this.modules).forEach(module => {
      if (module.destroy) {
        module.destroy();
      }
    });
    
    console.log('Application destroyed');
  }
}

// Initialize the application
const app = new PortfolioApp();

// Expose app to window for debugging (remove in production)
if (process.env.NODE_ENV !== 'production') {
  window.portfolioApp = app;
}

// Export for module usage
export default app;