/**
 * File: form-init.js
 * Created: 2025-12-17 15:28:50
 * Last Modified: 2026-02-06
 * 
 * Form Initialization Module
 * 
 * Handles initialization and event binding for request forms.
 * Integrates Flatpickr datetime pickers and manages form submission.
 * 
 * @module form-kit/core/form-init
 */

import * as formHelpers from '../helpers/form-helpers.js';
import { initializeDynamicForm } from './form-dynamic.js';

// Make form helpers available globally for inline handlers if needed
Object.entries(formHelpers).forEach(([name, func]) => {
  window[name] = func;
});

// Export dynamic form initializer for external use
export { initializeDynamicForm };

/**
 * Initialize a single form by ID
 * @param {string} formId - The form element ID
 * @returns {Object} Form instance with methods
 */
export function initializeForm(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error(`Form with ID "${formId}" not found`);
    return null;
  }
  
  // Get configuration from data attribute
  const config = JSON.parse(form.dataset.formConfig || '{}');
  
  // Get submit button reference
  const submitButton = form.querySelector('button[type="submit"]');
  
  /**
   * Check if all required fields are valid and update submit button state
   */
  function validateFormFields() {
    const requiredInputs = form.querySelectorAll('[required]');
    let allValid = true;
    
    requiredInputs.forEach(input => {
      if (input.type === 'select-one') {
        // For select elements, check if a valid option is selected
        if (!input.value || input.value === '') {
          allValid = false;
          input.classList.remove('is-valid');
          if (input.classList.contains('was-validated-field')) {
            input.classList.add('is-invalid');
          }
        } else {
          input.classList.remove('is-invalid');
          input.classList.add('is-valid');
        }
      } else {
        // For text inputs, check validity
        if (!input.value || input.value.trim() === '') {
          allValid = false;
          input.classList.remove('is-valid');
          if (input.classList.contains('was-validated-field')) {
            input.classList.add('is-invalid');
          }
        } else {
          input.classList.remove('is-invalid');
          input.classList.add('is-valid');
        }
      }
    });
    
    // Enable/disable submit button based on validation
    if (submitButton) {
      submitButton.disabled = !allValid;
    }
    
    return allValid;
  }
  
  // Initialize Flatpickr on datetime inputs
  const dateTimeInputs = form.querySelectorAll('.flatpickr-input');
  const flatpickrInstances = [];
  
  dateTimeInputs.forEach(input => {
    const flatpickrConfig = {
      ...config.flatpickrOptions,
      onChange: (selectedDates, dateStr, instance) => {
        // Clear validation on change
        input.setCustomValidity('');
        input.classList.add('was-validated-field');
        
        // Validate all fields and update button state
        validateFormFields();
        
        // Call custom onChange if provided
        if (config.onDateTimeChange && typeof window[config.onDateTimeChange] === 'function') {
          window[config.onDateTimeChange](selectedDates, dateStr, instance, input);
        }
      }
    };
    
    const fp = flatpickr(input, flatpickrConfig);
    flatpickrInstances.push(fp);
  });
  
  // Add real-time validation for all required inputs
  const allInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  allInputs.forEach(input => {
    // Validate on input/change
    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventType, () => {
      input.classList.add('was-validated-field');
      validateFormFields();
    });
    
    // Validate on blur
    input.addEventListener('blur', () => {
      input.classList.add('was-validated-field');
      validateFormFields();
    });
  });
  
  // Initial validation check (disable button if fields are empty)
  validateFormFields();
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formHelpers.validateForm(form)) {
      return;
    }
    
    // Get form data
    const formData = formHelpers.getFormData(form);
    
    // Validate datetime range
    const dateValidation = formHelpers.validateDateTimeRange(
      formData.startDateTime,
      formData.endDateTime
    );
    
    if (!dateValidation.valid) {
      const endInput = form.querySelector('[name="endDateTime"]');
      endInput.setCustomValidity(dateValidation.message);
      form.classList.add('was-validated');
      
      if (config.showToast) {
        formHelpers.showToast(dateValidation.message, 'error');
      }
      return;
    }
    
    // Format datetimes for API
    const submissionData = {
      ...formData,
      startDateTime: formHelpers.formatDateTimeForAPI(formData.startDateTime),
      endDateTime: formHelpers.formatDateTimeForAPI(formData.endDateTime)
    };
    
    try {
      // Show loading state
      formHelpers.setButtonLoading(submitButton, true);
      
      // Submit data
      const response = await formHelpers.submitFormData(
        config.action,
        config.method,
        submissionData
      );
      
      // Handle success
      if (config.showToast) {
        formHelpers.showToast(
          response.message || 'Request submitted successfully!',
          'success'
        );
      }
      
      // Call success callback if provided
      if (config.onSuccess && typeof window[config.onSuccess] === 'function') {
        window[config.onSuccess](response, submissionData);
      }
      
      // Reset form if configured
      if (config.resetOnSuccess !== false) {
        form.reset();
        formHelpers.resetValidation(form);
        
        // Reset Flatpickr instances
        flatpickrInstances.forEach(fp => fp.clear());
      }
      
    } catch (error) {
      // Handle error
      console.error('Form submission error:', error);
      
      if (config.showToast) {
        formHelpers.showToast(
          error.message || 'An error occurred while submitting the request.',
          'error'
        );
      }
      
      // Call error callback if provided
      if (config.onError && typeof window[config.onError] === 'function') {
        window[config.onError](error, submissionData);
      }
      
    } finally {
      // Hide loading state
      formHelpers.setButtonLoading(submitButton, false);
    }
  });
  
  // Handle form reset
  form.addEventListener('reset', () => {
    formHelpers.resetValidation(form);
    flatpickrInstances.forEach(fp => fp.clear());
    
    // Remove validation classes
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
      input.classList.remove('is-valid', 'is-invalid', 'was-validated-field');
    });
    
    // Re-validate to disable submit button
    validateFormFields();
  });
  
  // Return form instance with utility methods
  return {
    form: form,
    config: config,
    flatpickrInstances: flatpickrInstances,
    
    /**
     * Programmatically submit the form
     */
    submit: () => {
      form.requestSubmit();
    },
    
    /**
     * Reset the form
     */
    reset: () => {
      form.reset();
    },
    
    /**
     * Populate form with data
     * @param {Object} data - Data to populate
     */
    populate: (data) => {
      formHelpers.populateForm(form, data);
    },
    
    /**
     * Destroy the form instance and cleanup
     */
    destroy: () => {
      flatpickrInstances.forEach(fp => fp.destroy());
    }
  };
}

/**
 * Initialize all forms with data-form-config attribute
 */
export function initializeAllForms() {
  const forms = document.querySelectorAll('[data-form-config]');
  const instances = [];
  
  forms.forEach(form => {
    const instance = initializeForm(form.id);
    if (instance) {
      instances.push(instance);
    }
  });
  
  return instances;
}

/**
 * Load app data dynamically and populate select
 * Useful for forms rendered without server-side app data
 * @param {string} formId - Form ID
 * @param {string|Array} dataSource - API endpoint or array of apps
 */
export async function loadAndPopulateApps(formId, dataSource) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error(`Form with ID "${formId}" not found`);
    return;
  }
  
  const appSelect = form.querySelector('[name="appId"]');
  if (!appSelect) {
    console.error('App selector not found in form');
    return;
  }
  
  try {
    // Show loading state
    appSelect.disabled = true;
    appSelect.innerHTML = '<option value="">Loading applications...</option>';
    
    // Load data
    const apps = await formHelpers.loadAppData(dataSource);
    
    // Clear and repopulate
    appSelect.innerHTML = '<option value="" selected disabled>Select an application...</option>';
    
    apps.forEach(app => {
      const option = document.createElement('option');
      option.value = app.id;
      option.textContent = `${app.iGateApp} - ${app.cetApp} (ID: ${app.id})`;
      appSelect.appendChild(option);
    });
    
    appSelect.disabled = false;
    
  } catch (error) {
    console.error('Error loading app data:', error);
    appSelect.innerHTML = '<option value="">Error loading applications</option>';
    formHelpers.showToast('Failed to load applications', 'error');
  }
}

// Auto-initialize forms on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const autoInitForms = initializeAllForms();
  console.log(`Initialized ${autoInitForms.length} request form(s)`);
});

// Export for manual usage
export { formHelpers };
