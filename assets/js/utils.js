// assets/js/utils.js

/**
 * Utility functions for the portfolio website
 */

// DOM utilities
export const DOM = {
  /**
   * Select a single element
   */
  select: (selector, context = document) => context.querySelector(selector),
  
  /**
   * Select multiple elements
   */
  selectAll: (selector, context = document) => context.querySelectorAll(selector),
  
  /**
   * Create an element with attributes and content
   */
  create: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else {
        element.appendChild(content);
      }
    }
    
    return element;
  },
  
  /**
   * Check if element is in viewport
   */
  isInViewport: (element, threshold = 0.1) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
    const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
    
    return vertInView && horInView;
  },
  
  /**
   * Add event listener with cleanup
   */
  on: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },
  
  /**
   * Toggle class on element
   */
  toggleClass: (element, className, force) => {
    return element.classList.toggle(className, force);
  },
  
  /**
   * Add multiple classes
   */
  addClass: (element, ...classNames) => {
    element.classList.add(...classNames);
  },
  
  /**
   * Remove multiple classes
   */
  removeClass: (element, ...classNames) => {
    element.classList.remove(...classNames);
  },
  
  /**
   * Check if element has class
   */
  hasClass: (element, className) => {
    return element.classList.contains(className);
  }
};

// Animation utilities
export const Animation = {
  /**
   * Animate number from start to end
   */
  animateNumber: (element, start, end, duration = 1000, callback = null) => {
    const startTime = performance.now();
    const difference = end - start;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (difference * easeOut));
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };
    
    requestAnimationFrame(animate);
  },
  
  /**
   * Debounced animation frame
   */
  debounceRAF: (callback) => {
    let rafId = null;
    
    return (...args) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        callback.apply(this, args);
        rafId = null;
      });
    };
  },
  
  /**
   * Simple fade in animation
   */
  fadeIn: (element, duration = 300) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    
    const fade = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };
    
    requestAnimationFrame(fade);
  },
  
  /**
   * Simple fade out animation
   */
  fadeOut: (element, duration = 300) => {
    const start = performance.now();
    const startOpacity = parseFloat(getComputedStyle(element).opacity);
    
    const fade = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = startOpacity * (1 - progress);
      
      if (progress >= 1) {
        element.style.display = 'none';
      } else {
        requestAnimationFrame(fade);
      }
    };
    
    requestAnimationFrame(fade);
  }
};

// Event utilities
export const Events = {
  /**
   * Debounce function
   */
  debounce: (func, wait, immediate = false) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(this, args);
    };
  },
  
  /**
   * Throttle function
   */
  throttle: (func, limit) => {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * Once function - execute only once
   */
  once: (func) => {
    let executed = false;
    
    return function(...args) {
      if (!executed) {
        executed = true;
        return func.apply(this, args);
      }
    };
  },
  
  /**
   * Custom event emitter
   */
  createEmitter: () => {
    const events = {};
    
    return {
      on: (event, callback) => {
        if (!events[event]) {
          events[event] = [];
        }
        events[event].push(callback);
        
        // Return unsubscribe function
        return () => {
          const index = events[event].indexOf(callback);
          if (index > -1) {
            events[event].splice(index, 1);
          }
        };
      },
      
      emit: (event, data) => {
        if (events[event]) {
          events[event].forEach(callback => callback(data));
        }
      },
      
      off: (event, callback) => {
        if (events[event]) {
          const index = events[event].indexOf(callback);
          if (index > -1) {
            events[event].splice(index, 1);
          }
        }
      }
    };
  }
};

// Storage utilities
export const Storage = {
  /**
   * Get item from localStorage with fallback
   */
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Error getting ${key} from localStorage:`, error);
      return fallback;
    }
  },
  
  /**
   * Set item in localStorage
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Remove item from localStorage
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Clear all localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      return false;
    }
  }
};

// URL utilities
export const URL = {
  /**
   * Get URL parameters as object
   */
  getParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  },
  
  /**
   * Get specific URL parameter
   */
  getParam: (key, fallback = null) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || fallback;
  },
  
  /**
   * Update URL parameter without reload
   */
  setParam: (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  },
  
  /**
   * Remove URL parameter
   */
  removeParam: (key) => {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
  }
};

// Device detection utilities
export const Device = {
  /**
   * Check if device is mobile
   */
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  /**
   * Check if device is tablet
   */
  isTablet: () => {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },
  
  /**
   * Check if device is desktop
   */
  isDesktop: () => {
    return !Device.isMobile() && !Device.isTablet();
  },
  
  /**
   * Check if device supports touch
   */
  isTouch: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  /**
   * Get viewport dimensions
   */
  getViewport: () => {
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
  },
  
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  /**
   * Check if user prefers dark theme
   */
  prefersDarkTheme: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
};

// Performance utilities
export const Performance = {
  /**
   * Measure execution time
   */
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },
  
  /**
   * Lazy load function
   */
  lazy: (fn) => {
    let result;
    let executed = false;
    
    return (...args) => {
      if (!executed) {
        result = fn.apply(this, args);
        executed = true;
      }
      return result;
    };
  },
  
  /**
   * Memoize function results
   */
  memoize: (fn) => {
    const cache = new Map();
    
    return (...args) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }
};

// Math utilities
export const Math = {
  /**
   * Linear interpolation
   */
  lerp: (start, end, factor) => {
    return start + (end - start) * factor;
  },
  
  /**
   * Clamp value between min and max
   */
  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },
  
  /**
   * Map value from one range to another
   */
  map: (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  },
  
  /**
   * Random number between min and max
   */
  random: (min, max) => {
    return Math.random() * (max - min) + min;
  },
  
  /**
   * Random integer between min and max
   */
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  /**
   * Easing functions
   */
  easing: {
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
  }
};

// Validation utilities
export const Validation = {
  /**
   * Validate email
   */
  isEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  /**
   * Validate phone number
   */
  isPhone: (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  },
  
  /**
   * Validate URL
   */
  isURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Check if string is not empty
   */
  isNotEmpty: (str) => {
    return typeof str === 'string' && str.trim().length > 0;
  },
  
  /**
   * Check minimum length
   */
  minLength: (str, length) => {
    return typeof str === 'string' && str.length >= length;
  },
  
  /**
   * Check maximum length
   */
  maxLength: (str, length) => {
    return typeof str === 'string' && str.length <= length;
  }
};

// Format utilities
export const Format = {
  /**
   * Format number with commas
   */
  number: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  /**
   * Format date
   */
  date: (date, locale = 'en-US', options = {}) => {
    return new Date(date).toLocaleDateString(locale, options);
  },
  
  /**
   * Format time
   */
  time: (date, locale = 'en-US', options = {}) => {
    return new Date(date).toLocaleTimeString(locale, options);
  },
  
  /**
   * Capitalize first letter
   */
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  /**
   * Convert to title case
   */
  titleCase: (str) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  
  /**
   * Truncate string with ellipsis
   */
  truncate: (str, length, suffix = '...') => {
    return str.length > length ? str.substring(0, length) + suffix : str;
  }
};

// Export all utilities as default object
export default {
  DOM,
  Animation,
  Events,
  Storage,
  URL,
  Device,
  Performance,
  Math,
  Validation,
  Format
};