// assets/js/theme.js

import { DOM, Storage, Device, Events } from './utils.js';

/**
 * Theme Management System
 * Handles light/dark theme switching with system preference detection
 */
class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.toggleButton = null;
    this.mediaQuery = null;
    this.emitter = Events.createEmitter();
    
    // Theme constants
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    };
    
    this.STORAGE_KEY = 'portfolio-theme';
    
    // Initialize theme system
    this.init();
  }
  
  /**
   * Initialize the theme system
   */
  init() {
    this.setupMediaQuery();
    this.setupToggleButton();
    this.loadSavedTheme();
    this.applyTheme();
    this.setupEventListeners();
    
    console.log('Theme system initialized');
  }
  
  /**
   * Setup media query for system theme detection
   */
  setupMediaQuery() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }
  
  /**
   * Setup theme toggle button
   */
  setupToggleButton() {
    this.toggleButton = DOM.select('#theme-toggle');
    
    if (!this.toggleButton) {
      console.warn('Theme toggle button not found');
      return;
    }
    
    // Add accessibility attributes
    this.toggleButton.setAttribute('aria-label', 'Toggle theme');
    this.toggleButton.setAttribute('role', 'button');
    this.toggleButton.setAttribute('tabindex', '0');
  }
  
  /**
   * Load saved theme from storage or use system preference
   */
  loadSavedTheme() {
    const savedTheme = Storage.get(this.STORAGE_KEY);
    
    if (savedTheme && Object.values(this.THEMES).includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Use system preference as default
      this.currentTheme = this.THEMES.SYSTEM;
    }
  }
  
  /**
   * Get the effective theme (resolve system preference)
   */
  getEffectiveTheme() {
    if (this.currentTheme === this.THEMES.SYSTEM) {
      return Device.prefersDarkTheme() ? this.THEMES.DARK : this.THEMES.LIGHT;
    }
    return this.currentTheme;
  }
  
  /**
   * Apply the current theme to the document
   */
  applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Add current theme class
    html.classList.add(effectiveTheme);
    
    // Update data attribute for CSS targeting
    html.setAttribute('data-theme', effectiveTheme);
    
    // Update toggle button icon and aria-label
    this.updateToggleButton(effectiveTheme);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);
    
    // Emit theme change event
    this.emitter.emit('themeChanged', {
      theme: this.currentTheme,
      effective: effectiveTheme
    });
    
    console.log(`Theme applied: ${effectiveTheme} (set to: ${this.currentTheme})`);
  }
  
  /**
   * Update toggle button appearance
   */
  updateToggleButton(effectiveTheme) {
    if (!this.toggleButton) return;
    
    const icon = this.toggleButton.querySelector('i');
    if (!icon) return;
    
    // Update icon
    icon.className = effectiveTheme === this.THEMES.DARK ? 'fas fa-sun' : 'fas fa-moon';
    
    // Update aria-label
    const nextTheme = effectiveTheme === this.THEMES.DARK ? 'light' : 'dark';
    this.toggleButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    
    // Add visual feedback class
    this.toggleButton.classList.add('theme-switching');
    setTimeout(() => {
      this.toggleButton.classList.remove('theme-switching');
    }, 200);
  }
  
  /**
   * Update meta theme-color for mobile browsers
   */
  updateMetaThemeColor(effectiveTheme) {
    let metaThemeColor = DOM.select('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = DOM.create('meta', { name: 'theme-color' });
      document.head.appendChild(metaThemeColor);
    }
    
    // Set theme color based on current theme
    const colors = {
      [this.THEMES.LIGHT]: '#ffffff',
      [this.THEMES.DARK]: '#1a1a1a'
    };
    
    metaThemeColor.setAttribute('content', colors[effectiveTheme]);
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const effectiveTheme = this.getEffectiveTheme();
    const nextTheme = effectiveTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
    
    this.setTheme(nextTheme);
  }
  
  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (!Object.values(this.THEMES).includes(theme)) {
      console.error(`Invalid theme: ${theme}`);
      return;
    }
    
    const previousTheme = this.currentTheme;
    this.currentTheme = theme;
    
    // Save to storage
    Storage.set(this.STORAGE_KEY, theme);
    
    // Apply theme
    this.applyTheme();
    
    // Animate transition if supported
    if (!Device.prefersReducedMotion()) {
      this.animateThemeChange(previousTheme, theme);
    }
    
    console.log(`Theme changed from ${previousTheme} to ${theme}`);
  }
  
  /**
   * Animate theme change
   */
  animateThemeChange(from, to) {
    const body = document.body;
    
    // Add transition class
    body.classList.add('theme-transitioning');
    
    // Remove transition class after animation
    setTimeout(() => {
      body.classList.remove('theme-transitioning');
    }, 300);
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle button click
    if (this.toggleButton) {
      DOM.on(this.toggleButton, 'click', () => {
        this.toggle();
      });
      
      // Keyboard support
      DOM.on(this.toggleButton, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });
    }
    
    // System theme change detection
    if (this.mediaQuery) {
      DOM.on(this.mediaQuery, 'change', () => {
        // Only respond to system changes if current theme is set to system
        if (this.currentTheme === this.THEMES.SYSTEM) {
          this.applyTheme();
        }
      });
    }
    
    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    DOM.on(document, 'keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Handle visibility change (when tab becomes active)
    DOM.on(document, 'visibilitychange', () => {
      if (!document.hidden && this.currentTheme === this.THEMES.SYSTEM) {
        // Re-check system preference when tab becomes active
        this.applyTheme();
      }
    });
  }
  
  /**
   * Get current theme info
   */
  getThemeInfo() {
    return {
      current: this.currentTheme,
      effective: this.getEffectiveTheme(),
      available: Object.values(this.THEMES),
      systemPreference: Device.prefersDarkTheme() ? this.THEMES.DARK : this.THEMES.LIGHT
    };
  }
  
  /**
   * Subscribe to theme changes
   */
  onThemeChange(callback) {
    return this.emitter.on('themeChanged', callback);
  }
  
  /**
   * Check if dark theme is active
   */
  isDark() {
    return this.getEffectiveTheme() === this.THEMES.DARK;
  }
  
  /**
   * Check if light theme is active
   */
  isLight() {
    return this.getEffectiveTheme() === this.THEMES.LIGHT;
  }
  
  /**
   * Reset theme to system preference
   */
  reset() {
    this.setTheme(this.THEMES.SYSTEM);
  }
  
  /**
   * Destroy theme manager and clean up
   */
  destroy() {
    // Remove event listeners would be handled by cleanup functions
    // if we were storing them, but since we're not, this is mostly
    // for consistency in the API
    
    this.emitter = null;
    this.toggleButton = null;
    this.mediaQuery = null;
    
    console.log('Theme manager destroyed');
  }
}

/**
 * Theme utilities for external use
 */
export const ThemeUtils = {
  /**
   * Get CSS custom property value
   */
  getCSSProperty: (property, element = document.documentElement) => {
    return getComputedStyle(element).getPropertyValue(property).trim();
  },
  
  /**
   * Set CSS custom property value
   */
  setCSSProperty: (property, value, element = document.documentElement) => {
    element.style.setProperty(property, value);
  },
  
  /**
   * Get theme-aware color
   */
  getThemeColor: (lightColor, darkColor, manager) => {
    return manager && manager.isDark() ? darkColor : lightColor;
  },
  
  /**
   * Apply theme-aware styles
   */
  applyThemeStyles: (element, lightStyles, darkStyles, manager) => {
    const styles = manager && manager.isDark() ? darkStyles : lightStyles;
    
    Object.entries(styles).forEach(([property, value]) => {
      element.style[property] = value;
    });
  },
  
  /**
   * Create theme-aware CSS class
   */
  createThemeClass: (baseClass, manager) => {
    const themeClass = manager && manager.isDark() ? 'dark' : 'light';
    return `${baseClass} ${baseClass}--${themeClass}`;
  }
};

// Create and export singleton instance
const themeManager = new ThemeManager();

// Export both the class and instance
export { ThemeManager, themeManager as default };