/**
 * File: form-helpers.js
 * Created: 2025-12-17 15:28:16
 * Last Modified: 2025-12-24 12:50:00
 * 
 * Form Helpers Module
 * 
 * Comprehensive utility functions for form operations throughout the application.
 * Provides a consistent API for common form tasks with security and UX best practices.
 * 
 * KEY FUNCTION CATEGORIES:
 * 
 * 1. VALIDATION:
 *    - validateForm(): HTML5 validation API wrapper
 *    - validateDateTimeRange(): Custom date range validation
 *    - resetValidation(): Clear validation states
 * 
 * 2. DATA HANDLING:
 *    - getFormData(): Extract form values as JavaScript object
 *    - populateForm(): Fill form fields from data object
 *    - formatDateTimeForAPI(): Convert dates to ISO 8601
 * 
 * 3. USER FEEDBACK:
 *    - showToast(): Display Bootstrap toast notifications
 *    - setButtonLoading(): Show/hide loading spinner on buttons
 * 
 * 4. AJAX OPERATIONS:
 *    - submitFormData(): Send form data to API endpoints
 *    - loadAppData(): Fetch data from API or use provided array
 * 
 * 5. SECURITY:
 *    - escapeHTML(): Prevent XSS attacks in user-generated content
 * 
 * All functions handle edge cases and errors gracefully with console warnings.
 */

/**
 * Escape HTML entities to prevent XSS attacks
 * 
 * Converts potentially dangerous characters to their HTML entity equivalents,
 * preventing malicious scripts from being executed when user input is displayed.
 * 
 * SECURITY USE CASE:
 * Always escape user-generated content before inserting into the DOM,
 * especially in toast messages, error displays, or any dynamic HTML.
 * 
 * CHARACTERS ESCAPED:
 * & → &amp;
 * < → &lt;
 * > → &gt;
 * " → &quot;
 * ' → &#039;
 * 
 * @param {String} text - Text to escape (can be any type, non-strings returned as-is)
 * @returns {String} Escaped text safe for HTML insertion
 * 
 * @example
 * const userInput = '<script>alert("XSS")</script>';
 * const safe = escapeHTML(userInput);
 * // safe = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 * @private
 */
function escapeHTML(text) {
  if (typeof text !== 'string') return text;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Validate a form using HTML5 validation API
 * @param {HTMLFormElement} form - The form element to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateForm(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  return true;
}

/**
 * Extract form data as a plain object
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} Form data as key-value pairs
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle multiple values for same key (e.g., checkboxes)
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

/**
 * Reset form validation state
 * @param {HTMLFormElement} form - The form element
 */
export function resetValidation(form) {
  form.classList.remove('was-validated');
  
  // Clear custom validation messages
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.setCustomValidity('');
  });
}

/**
 * Display a Bootstrap toast notification
 * 
 * Creates and shows a dismissible toast message for user feedback.
 * Automatically creates a toast container if one doesn't exist.
 * Toasts auto-hide after the specified duration and self-clean from DOM.
 * 
 * TOAST TYPES & STYLING:
 * - success: Green with checkmark icon
 * - error: Red with X icon
 * - warning: Yellow with exclamation icon
 * - info: Blue with info icon (default)
 * 
 * SECURITY NOTE:
 * Messages are automatically HTML-escaped to prevent XSS attacks,
 * so user-generated content can be safely displayed.
 * 
 * POSITIONING:
 * Toasts appear in the top-right corner and stack vertically if multiple
 * are shown simultaneously.
 * 
 * @param {string} message - The message to display (will be HTML-escaped)
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {number} duration - Duration in milliseconds before auto-hide (default: 5000)
 * 
 * @example
 * // Success message
 * showToast('Application saved successfully!', 'success');
 * 
 * // Error with longer duration
 * showToast('Failed to connect to server', 'error', 8000);
 */
export function showToast(message, type = 'info', duration = 5000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Map type to Bootstrap classes and icons
  const typeConfig = {
    success: { bg: 'bg-success', icon: 'bi-check-circle-fill', title: 'Success' },
    error: { bg: 'bg-danger', icon: 'bi-x-circle-fill', title: 'Error' },
    warning: { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill', title: 'Warning' },
    info: { bg: 'bg-info', icon: 'bi-info-circle-fill', title: 'Info' }
  };
  
  const config = typeConfig[type] || typeConfig.info;
  
  // Create toast element
  const toastId = 'toast_' + Date.now();
  // Escape message to prevent XSS attacks
  const safeMessage = escapeHTML(message);
  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${config.bg} text-white">
        <i class="bi ${config.icon} me-2"></i>
        <strong class="me-auto">${config.title}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${safeMessage}
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  // Initialize and show toast
  const toastElement = document.getElementById(toastId);
  const bsToast = new window.bootstrap.Toast(toastElement, {
    autohide: true,
    delay: duration
  });
  
  bsToast.show();
  
  // Remove toast element after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

/**
 * Display loading state on submit button
 * @param {HTMLButtonElement} button - The submit button
 * @param {boolean} loading - True to show loading, false to hide
 */
export function setButtonLoading(button, loading) {
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Submitting...
    `;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

/**
 * Validate datetime range (end must be after start)
 * @param {string} startDateTime - Start datetime string
 * @param {string} endDateTime - End datetime string
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateDateTimeRange(startDateTime, endDateTime) {
  if (!startDateTime || !endDateTime) {
    return { valid: false, message: 'Both start and end date/time are required.' };
  }
  
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid date/time format.' };
  }
  
  if (end <= start) {
    return { valid: false, message: 'End date/time must be after start date/time.' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Format datetime for API submission (ISO 8601)
 * @param {string} dateTimeString - Datetime string from form
 * @returns {string} ISO 8601 formatted datetime
 */
export function formatDateTimeForAPI(dateTimeString) {
  if (!dateTimeString) return null;
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString();
}

/**
 * Submit form data via AJAX
 * 
 * Sends form data to an API endpoint using the Fetch API.
 * Automatically handles JSON serialization, error responses, and provides
 * meaningful error messages for debugging.
 * 
 * FEATURES:
 * - Sends data as JSON (Content-Type: application/json)
 * - Expects JSON response from server
 * - Throws descriptive errors for non-2xx responses
 * - Logs errors to console for debugging
 * - Parses error messages from server if available
 * 
 * ERROR HANDLING:
 * The function throws an Error that should be caught by the caller.
 * The error message comes from the server response if available,
 * otherwise falls back to HTTP status text.
 * 
 * @param {string} url - API endpoint URL (e.g., '/api/apps/123')
 * @param {string} method - HTTP method ('POST', 'PUT', 'DELETE', etc.)
 * @param {Object} data - Data object to send (will be JSON.stringified)
 * @returns {Promise<Object>} Parsed JSON response from server
 * @throws {Error} If request fails or server returns non-2xx status
 * 
 * @example
 * try {
 *   const result = await submitFormData('/api/apps', 'POST', formData);
 *   showToast(result.message, 'success');
 * } catch (error) {
 *   showToast(error.message, 'error');
 * }
 */
export async function submitFormData(url, method, data) {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

/**
 * Populate form with data (for edit scenarios)
 * @param {HTMLFormElement} form - The form element
 * @param {Object} data - Data object with field values
 */
export function populateForm(form, data) {
  if (!data) return;
  
  Object.keys(data).forEach(key => {
    const input = form.elements[key];
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = Boolean(data[key]);
      } else if (input.type === 'radio') {
        const radio = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
        if (radio) radio.checked = true;
      } else {
        input.value = data[key];
      }
    }
  });
}

/**
 * Load app data from endpoint or use provided array
 * @param {Array|string} dataSource - Array of apps or API endpoint URL
 * @returns {Promise<Array>} Array of app objects
 */
export async function loadAppData(dataSource) {
  // If dataSource is already an array, return it
  if (Array.isArray(dataSource)) {
    return dataSource;
  }
  
  // If dataSource is a string, fetch from API
  if (typeof dataSource === 'string') {
    try {
      const response = await fetch(dataSource);
      if (!response.ok) {
        throw new Error(`Failed to fetch app data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading app data:', error);
      return [];
    }
  }
  
  return [];
}
