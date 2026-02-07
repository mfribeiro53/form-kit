/**
 * Form Kit - Main Entry Point
 * 
 * A configuration-driven form enhancement library providing:
 * - Dynamic form generation from JSON/YAML configs
 * - Form validation (HTML5 + custom validators)
 * - Character counters and input enhancements
 * - Toast notifications for user feedback
 * - API submission helpers
 * - Flatpickr datetime integration
 * 
 * @module form-kit
 */

'use strict';

// ============================================================================
// CORE EXPORTS
// ============================================================================

export {
  initializeForm,
  initializeAllForms,
  loadAndPopulateApps,
  initializeDynamicForm,
  formHelpers
} from './core/form-init.js';

export {
  initializeDynamicForm as initDynamicForm,
  validateForm as validateDynamicForm,
  getFormData as getDynamicFormData,
  resetForm
} from './core/form-dynamic.js';

// ============================================================================
// HELPER EXPORTS
// ============================================================================

export {
  validateForm,
  getFormData,
  resetValidation,
  showToast,
  setButtonLoading,
  validateDateTimeRange,
  formatDateTimeForAPI,
  submitFormData,
  populateForm,
  loadAppData
} from './helpers/form-helpers.js';

// ============================================================================
// FEATURE EXPORTS
// ============================================================================

export {
  registerValidator,
  getValidator,
  runValidators,
  clearValidationState,
  validateFormWithCustom,
  validators
} from './features/form-feature-validators.js';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '1.0.0';

// ============================================================================
// CONVENIENCE INITIALIZATION
// ============================================================================

/**
 * Quick setup function for simple use cases
 * Initializes all forms on the page
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onReady - Callback when forms are initialized
 * @returns {Array} Array of form instances
 * 
 * @example
 * import { setup } from '@mfribeiro/form-kit';
 * 
 * setup({
 *   onReady: (forms) => console.log(`${forms.length} forms initialized!`)
 * });
 */
export function setup(options = {}) {
  const { initializeAllForms } = require('./core/form-init.js');
  const instances = initializeAllForms();
  
  if (options.onReady && typeof options.onReady === 'function') {
    options.onReady(instances);
  }
  
  return instances;
}
