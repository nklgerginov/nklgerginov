// assets/js/forms.js

import { DOM, Validation, Events } from './utils.js';

/**
 * Form Manager
 * Handles form validation and submission
 */
class FormManager {
  constructor() {
    this.forms = new Map();
    this.validators = new Map();
    
    // Default validation rules
    this.defaultRules = {
      email: {
        validate: Validation.isEmail,
        message: 'Please enter a valid email address'
      },
      phone: {
        validate: Validation.isPhone,
        message: 'Please enter a valid phone number'
      },
      required: {
        validate: Validation.isNotEmpty,
        message: 'This field is required'
      },
      minLength: {
        validate: (value, length) => Validation.minLength(value, length),
        message: 'Field is too short'
      },
      maxLength: {
        validate: (value, length) => Validation.maxLength(value, length),
        message: 'Field is too long'
      }
    };
    
    this.init();
  }
  
  /**
   * Initialize form manager
   */
  init() {
    this.setupContactForm();
    this.setupFormValidation();
    console.log('Form manager initialized');
  }
  
  /**
   * Setup contact form
   */
  setupContactForm() {
    const contactForm = DOM.select('#contact-form');
    if (!contactForm) {
      console.warn('Contact form not found');
      return;
    }
    
    // Register form
    this.registerForm(contactForm, {
      onSubmit: this.handleContactSubmit.bind(this),
      validationRules: {
        name: ['required', { rule: 'minLength', params: 2 }],
        email: ['required', 'email'],
        subject: ['required'],
        message: ['required', { rule: 'minLength', params: 10 }]
      }
    });
  }
  
  /**
   * Register a form for management
   */
  registerForm(form, config) {
    const formId = form.id || `form-${this.forms.size}`;
    
    this.forms.set(formId, {
      element: form,
      config,
      fields: new Map(),
      errors: new Map()
    });
    
    // Setup form submission
    DOM.on(form, 'submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(formId);
    });
    
    // Setup field validation on blur
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      this.registerField(formId, field);
      
      DOM.on(field, 'blur', () => {
        this.validateField(formId, field);
      });
      
      // Clear error on input
      DOM.on(field, 'input', () => {
        this.clearFieldError(formId, field);
      });
    });
    
    console.log(`Form registered: ${formId}`);
  }
  
  /**
   * Register a form field
   */
  registerField(formId, field) {
    const form = this.forms.get(formId);
    if (!form) return;
    
    const fieldName = field.name || field.id;
    form.fields.set(fieldName, field);
  }
  
  /**
   * Validate single field
   */
  validateField(formId, field) {
    const form = this.forms.get(formId);
    if (!form || !form.config.validationRules) return true;
    
    const fieldName = field.name || field.id;
    const rules = form.config.validationRules[fieldName];
    
    if (!rules) return true;
    
    const value = field.value.trim();
    
    // Check each rule
    for (const rule of rules) {
      let ruleName, ruleParams;
      
      if (typeof rule === 'string') {
        ruleName = rule;
        ruleParams = [];
      } else {
        ruleName = rule.rule;
        ruleParams = Array.isArray(rule.params) ? rule.params : [rule.params];
      }
      
      const validator = this.defaultRules[ruleName];
      if (!validator) continue;
      
      const isValid = validator.validate(value, ...ruleParams);
      
      if (!isValid) {
        let message = validator.message;
        
        // Customize message with params if needed
        if (ruleName === 'minLength') {
          message = `This field must be at least ${ruleParams[0]} characters`;
        } else if (ruleName === 'maxLength') {
          message = `This field must be at most ${ruleParams[0]} characters`;
        }
        
        this.setFieldError(formId, field, message);
        return false;
      }
    }
    
    this.clearFieldError(formId, field);
    return true;
  }
  
  /**
   * Set field error
   */
  setFieldError(formId, field, message) {
    const form = this.forms.get(formId);
    if (!form) return;
    
    const fieldName = field.name || field.id;
    form.errors.set(fieldName, message);
    
    // Add error class to field
    DOM.addClass(field, 'error');
    field.setAttribute('aria-invalid', 'true');
    
    // Find or create error message element
    let errorElement = field.parentElement.querySelector('.field-error');
    
    if (!errorElement) {
      errorElement = DOM.create('span', {
        className: 'field-error',
        role: 'alert'
      });
      field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Add error styles if not exists
    if (!DOM.select('#field-error-styles')) {
      const style = DOM.create('style', {
        id: 'field-error-styles'
      }, `
        .field-error {
          display: block;
          color: hsl(0, 84%, 60%);
          font-size: 0.75rem;
          margin-top: 0.25rem;
          animation: shake 0.3s;
        }
        .form-input.error,
        .form-textarea.error {
          border-color: hsl(0, 84%, 60%) !important;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `);
      document.head.appendChild(style);
    }
  }
  
  /**
   * Clear field error
   */
  clearFieldError(formId, field) {
    const form = this.forms.get(formId);
    if (!form) return;
    
    const fieldName = field.name || field.id;
    form.errors.delete(fieldName);
    
    // Remove error class
    DOM.removeClass(field, 'error');
    field.removeAttribute('aria-invalid');
    
    // Remove error message
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
  
  /**
   * Validate entire form
   */
  validateForm(formId) {
    const form = this.forms.get(formId);
    if (!form) return false;
    
    let isValid = true;
    
    form.fields.forEach((field) => {
      if (!this.validateField(formId, field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  /**
   * Handle form submission
   */
  async handleFormSubmit(formId) {
    const form = this.forms.get(formId);
    if (!form) return;
    
    // Validate form
    if (!this.validateForm(formId)) {
      console.log('Form validation failed');
      
      // Focus first error field
      const firstErrorField = form.element.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      
      return;
    }
    
    // Call custom submit handler
    if (form.config.onSubmit) {
      await form.config.onSubmit(this.getFormData(formId));
    }
  }
  
  /**
   * Get form data as object
   */
  getFormData(formId) {
    const form = this.forms.get(formId);
    if (!form) return {};
    
    const data = {};
    
    form.fields.forEach((field, fieldName) => {
      data[fieldName] = field.value.trim();
    });
    
    return data;
  }
  
  /**
   * Handle contact form submission
   */
  async handleContactSubmit(data) {
    console.log('Contact form submitted:', data);
    
    const form = DOM.select('#contact-form');
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (!submitButton) return;
    
    // Save original button content
    const originalContent = submitButton.innerHTML;
    
    // Show loading state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    try {
      // Simulate API call (replace with actual API endpoint)
      await this.simulateFormSubmission(data);
      
      // Success state
      submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      DOM.addClass(submitButton, 'success');
      
      // Reset form
      form.reset();
      
      // Show success message
      this.showFormMessage(form, 'success', 'Thank you! Your message has been sent successfully.');
      
      // Reset button after delay
      setTimeout(() => {
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
        DOM.removeClass(submitButton, 'success');
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Error state
      submitButton.innerHTML = '<i class="fas fa-times"></i> Failed to Send';
      DOM.addClass(submitButton, 'error');
      
      // Show error message
      this.showFormMessage(form, 'error', 'Oops! Something went wrong. Please try again.');
      
      // Reset button after delay
      setTimeout(() => {
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
        DOM.removeClass(submitButton, 'error');
      }, 3000);
    }
  }
  
  /**
   * Simulate form submission (replace with actual API call)
   */
  simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful submission
        resolve({ success: true, message: 'Form submitted successfully' });
        
        // Uncomment to simulate error:
        // reject(new Error('Submission failed'));
      }, 2000);
    });
  }
  
  /**
   * Show form message
   */
  showFormMessage(form, type, message) {
    // Remove existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create message element
    const messageElement = DOM.create('div', {
      className: `form-message form-message--${type}`,
      role: type === 'error' ? 'alert' : 'status'
    }, message);
    
    // Insert message at top of form
    form.insertBefore(messageElement, form.firstChild);
    
    // Add message styles if not exists
    if (!DOM.select('#form-message-styles')) {
      const style = DOM.create('style', {
        id: 'form-message-styles'
      }, `
        .form-message {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          animation: slideInDown 0.3s ease-out;
        }
        .form-message--success {
          background: hsl(142, 76%, 36%, 0.1);
          color: hsl(142, 76%, 36%);
          border: 1px solid hsl(142, 76%, 36%, 0.3);
        }
        .form-message--error {
          background: hsl(0, 84%, 60%, 0.1);
          color: hsl(0, 84%, 60%);
          border: 1px solid hsl(0, 84%, 60%, 0.3);
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `);
      document.head.appendChild(style);
    }
    
    // Auto-remove message after delay
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => messageElement.remove(), 300);
      }
    }, 5000);
  }
  
  /**
   * Setup real-time validation
   */
  setupFormValidation() {
    // Add custom validation styles
    if (!DOM.select('#form-validation-styles')) {
      const style = DOM.create('style', {
        id: 'form-validation-styles'
      }, `
        .form-input:focus:valid,
        .form-textarea:focus:valid {
          border-color: hsl(142, 76%, 36%);
        }
        .btn.success {
          background: linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 26%)) !important;
        }
        .btn.error {
          background: linear-gradient(135deg, hsl(0, 84%, 60%), hsl(0, 84%, 50%)) !important;
        }
      `);
      document.head.appendChild(style);
    }
  }
  
  /**
   * Reset form
   */
  resetForm(formId) {
    const form = this.forms.get(formId);
    if (!form) return;
    
    form.element.reset();
    form.errors.clear();
    
    // Clear all field errors
    form.fields.forEach((field) => {
      this.clearFieldError(formId, field);
    });
  }
  
  /**
   * Get form errors
   */
  getFormErrors(formId) {
    const form = this.forms.get(formId);
    return form ? Object.fromEntries(form.errors) : {};
  }
  
  /**
   * Check if form has errors
   */
  hasErrors(formId) {
    const form = this.forms.get(formId);
    return form ? form.errors.size > 0 : false;
  }
  
  /**
   * Destroy form manager
   */
  destroy() {
    this.forms.clear();
    this.validators.clear();
    console.log('Form manager destroyed');
  }
}

// Create singleton instance
const formManager = new FormManager();

export { FormManager, formManager as default };