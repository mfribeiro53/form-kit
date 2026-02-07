/**
 * Form Kit - Custom Validators Feature
 * 
 * Provides custom validation beyond HTML5/Bootstrap capabilities.
 * Uses Bootstrap's validation styling (.is-valid, .is-invalid, .invalid-feedback).
 * 
 * HTML5 handles: required, email, url, number, min, max, minlength, maxlength, pattern
 * This module handles: cross-field validation, async validation, complex formats
 * 
 * @module form-kit/features/form-feature-validators
 */

'use strict';

// ============================================================================
// VALIDATOR REGISTRY
// ============================================================================

/**
 * Registry of custom validators
 * Each validator receives: (value, options, form) => { valid: boolean, message: string }
 */
const validators = new Map();

/**
 * Register a custom validator
 * @param {string} name - Validator name
 * @param {Function} fn - Validator function (value, options, form) => { valid, message }
 */
export function registerValidator(name, fn) {
  validators.set(name, fn);
}

/**
 * Get a registered validator
 * @param {string} name - Validator name
 * @returns {Function|undefined} Validator function
 */
export function getValidator(name) {
  return validators.get(name);
}

// ============================================================================
// BUILT-IN CUSTOM VALIDATORS (HTML5 can't handle these)
// ============================================================================

/**
 * Validate date range: end must be after start
 * Used for datetime pairs like startDateTime/endDateTime
 */
registerValidator('dateRange', (value, options, form) => {
  const { startField, endField } = options;
  
  const startInput = form.querySelector(`[name="${startField}"]`);
  const endInput = form.querySelector(`[name="${endField}"]`);
  
  if (!startInput || !endInput) {
    return { valid: true, message: '' }; // Skip if fields don't exist
  }
  
  const startValue = startInput.value;
  const endValue = endInput.value;
  
  if (!startValue || !endValue) {
    return { valid: true, message: '' }; // Let required handle empty
  }
  
  const startDate = new Date(startValue);
  const endDate = new Date(endValue);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }
  
  if (endDate <= startDate) {
    return { valid: false, message: options.message || 'End date must be after start date' };
  }
  
  return { valid: true, message: '' };
});

/**
 * Validate phone number format
 * Accepts: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
 */
registerValidator('phone', (value, options) => {
  if (!value) return { valid: true, message: '' }; // Let required handle empty
  
  // Remove all non-digit characters for length check
  const digitsOnly = value.replace(/\D/g, '');
  
  // Must have 10-15 digits (supports international)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { 
      valid: false, 
      message: options.message || 'Phone number must be 10-15 digits' 
    };
  }
  
  return { valid: true, message: '' };
});

/**
 * Validate that field matches another field (e.g., password confirmation)
 */
registerValidator('matchField', (value, options, form) => {
  const { field, message } = options;
  const targetInput = form.querySelector(`[name="${field}"]`);
  
  if (!targetInput) {
    return { valid: true, message: '' };
  }
  
  if (value !== targetInput.value) {
    return { valid: false, message: message || `Must match ${field}` };
  }
  
  return { valid: true, message: '' };
});

/**
 * Conditionally required: required only when another field has a specific value
 */
registerValidator('conditionalRequired', (value, options, form) => {
  const { field, equals, message } = options;
  const targetInput = form.querySelector(`[name="${field}"]`);
  
  if (!targetInput) {
    return { valid: true, message: '' };
  }
  
  // Check if condition is met
  let conditionMet = false;
  if (targetInput.type === 'checkbox') {
    conditionMet = equals === true ? targetInput.checked : !targetInput.checked;
  } else {
    conditionMet = targetInput.value === equals;
  }
  
  // If condition met and value is empty, invalid
  if (conditionMet && !value?.trim()) {
    return { valid: false, message: message || 'This field is required' };
  }
  
  return { valid: true, message: '' };
});

// ============================================================================
// VALIDATION RUNNER
// ============================================================================

/**
 * Run custom validators on a field
 * Integrates with Bootstrap validation styling
 * 
 * @param {HTMLInputElement} input - The input element to validate
 * @param {Array} validatorConfigs - Array of validator configs
 * @param {HTMLFormElement} form - The parent form
 * @returns {boolean} True if all validators pass
 * 
 * @example
 * // In form config:
 * validators: [
 *   'phone',
 *   { name: 'dateRange', startField: 'startDateTime', endField: 'endDateTime' }
 * ]
 */
export function runValidators(input, validatorConfigs, form) {
  // First check HTML5 validity
  if (!input.checkValidity()) {
    applyInvalidState(input);
    return false;
  }
  
  // Run custom validators
  for (const config of validatorConfigs) {
    const validatorName = typeof config === 'string' ? config : config.name;
    const options = typeof config === 'string' ? {} : config;
    
    const validator = validators.get(validatorName);
    if (!validator) {
      console.warn(`Validator "${validatorName}" not found`);
      continue;
    }
    
    const result = validator(input.value, options, form);
    
    if (!result.valid) {
      applyInvalidState(input, result.message);
      return false;
    }
  }
  
  // All validators passed
  applyValidState(input);
  return true;
}

/**
 * Apply Bootstrap invalid state to input
 * @param {HTMLInputElement} input - The input element
 * @param {string} message - Optional custom error message
 */
function applyInvalidState(input, message) {
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  
  if (message) {
    // Set custom validity for HTML5 API
    input.setCustomValidity(message);
    
    // Update .invalid-feedback sibling if exists
    const feedback = input.parentElement?.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = message;
    }
  }
}

/**
 * Apply Bootstrap valid state to input
 * @param {HTMLInputElement} input - The input element
 */
function applyValidState(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  input.setCustomValidity('');
}

/**
 * Clear validation state from input
 * @param {HTMLInputElement} input - The input element
 */
export function clearValidationState(input) {
  input.classList.remove('is-valid', 'is-invalid');
  input.setCustomValidity('');
}

/**
 * Validate entire form with custom validators
 * @param {HTMLFormElement} form - The form to validate
 * @param {Object} fieldValidators - Map of field names to validator configs
 * @returns {boolean} True if all fields pass validation
 * 
 * @example
 * const isValid = validateFormWithCustom(form, {
 *   endDateTime: [{ name: 'dateRange', startField: 'startDateTime', endField: 'endDateTime' }],
 *   phone: ['phone']
 * });
 */
export function validateFormWithCustom(form, fieldValidators = {}) {
  let allValid = true;
  
  // Run HTML5 validation first
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    allValid = false;
  }
  
  // Run custom validators on specified fields
  for (const [fieldName, validatorConfigs] of Object.entries(fieldValidators)) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!input) continue;
    
    const fieldValid = runValidators(input, validatorConfigs, form);
    if (!fieldValid) {
      allValid = false;
    }
  }
  
  if (!allValid) {
    form.classList.add('was-validated');
  }
  
  return allValid;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  validators // Export registry for inspection/testing
};
