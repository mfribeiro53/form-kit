# Form Kit

A configuration-driven form enhancement library for Bootstrap 5.

## Features

- 📝 **Dynamic Forms** - Generate forms from JSON/YAML configs
- ✅ **Validation** - HTML5 + custom cross-field validators
- 📊 **Character Counters** - Real-time character counting for textareas
- 🔔 **Toast Notifications** - Built-in user feedback system
- 🚀 **API Submission** - Simplified fetch-based form submission
- 📅 **Flatpickr Integration** - Datetime picker support

## Installation

```bash
npm install github:mfribeiro53/form-kit
```

## Quick Start

```javascript
import { initializeForm, showToast } from '@mfribeiro/form-kit';

// Initialize a form with Flatpickr and validation
const formInstance = initializeForm('myFormId');

// Show toast notification
showToast('Form submitted successfully!', 'success');
```

## Form Initialization

Forms can be initialized automatically or manually:

### Auto-Initialization
Add `data-form-config` attribute to your form:

```html
<form id="requestForm" data-form-config='{"action": "/api/submit", "method": "POST"}'>
  <input name="email" type="email" required>
  <button type="submit">Submit</button>
</form>
```

### Manual Initialization

```javascript
import { initializeForm } from '@mfribeiro/form-kit';

const form = initializeForm('requestForm');

// Access instance methods
form.submit();
form.reset();
form.populate({ email: 'user@example.com' });
form.destroy(); // Cleanup
```

## Custom Validators

Form Kit provides custom validators for cross-field validation that HTML5 can't handle:

```javascript
import { registerValidator, validateFormWithCustom } from '@mfribeiro/form-kit';

// Register a custom validator
registerValidator('customRule', (value, options, form) => {
  return {
    valid: value.length >= 5,
    message: 'Must be at least 5 characters'
  };
});

// Validate form with custom validators
const isValid = validateFormWithCustom(form, {
  username: ['customRule'],
  phone: ['phone'],
  endDate: [{ 
    name: 'dateRange', 
    startField: 'startDate', 
    endField: 'endDate',
    message: 'End date must be after start date'
  }]
});
```

## Built-in Custom Validators

| Validator | Description | Options |
|-----------|-------------|---------|
| `dateRange` | End date must be after start date | `startField`, `endField`, `message` |
| `phone` | Phone number format (10-15 digits) | `message` |
| `matchField` | Field must match another field | `field`, `message` |
| `conditionalRequired` | Required when condition is met | `field`, `equals`, `message` |

### Examples

```javascript
// Password confirmation
validateFormWithCustom(form, {
  confirmPassword: [{ name: 'matchField', field: 'password', message: 'Passwords must match' }]
});

// Conditional requirement
validateFormWithCustom(form, {
  companyName: [{ 
    name: 'conditionalRequired', 
    field: 'accountType', 
    equals: 'business',
    message: 'Company name is required for business accounts'
  }]
});
```

## Toast Notifications

```javascript
import { showToast } from '@mfribeiro/form-kit';

// Types: 'success', 'error', 'warning', 'info'
showToast('Operation successful!', 'success');
showToast('Something went wrong', 'error', 8000); // Custom duration
```

## Form Helpers

```javascript
import { 
  validateForm,
  getFormData,
  resetValidation,
  populateForm,
  submitFormData,
  setButtonLoading
} from '@mfribeiro/form-kit';

// Get form data as object
const data = getFormData(formElement);

// Submit via fetch
const response = await submitFormData('/api/endpoint', 'POST', data);

// Show loading state on button
setButtonLoading(submitButton, true);
```

## Dynamic Form Generation

```javascript
import { initializeDynamicForm } from '@mfribeiro/form-kit';

// Initialize form with character counters and tooltips
initializeDynamicForm('appForm', {
  debug: true,
  fieldCount: 5,
  fields: ['name', 'email', 'notes']
});
```

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `initializeForm(formId)` | Initialize form with Flatpickr and validation |
| `initializeAllForms()` | Auto-initialize all forms with `data-form-config` |
| `initializeDynamicForm(formId, config)` | Setup character counters and tooltips |

### Validation

| Function | Description |
|----------|-------------|
| `validateForm(form)` | HTML5 validation check |
| `validateFormWithCustom(form, fieldValidators)` | Custom + HTML5 validation |
| `registerValidator(name, fn)` | Register custom validator |
| `resetValidation(form)` | Clear validation styling |

### Helpers

| Function | Description |
|----------|-------------|
| `getFormData(form)` | Extract form data as object |
| `populateForm(form, data)` | Fill form from data object |
| `submitFormData(url, method, data)` | Submit via fetch |
| `showToast(message, type, duration)` | Show toast notification |
| `setButtonLoading(button, isLoading)` | Toggle button loading state |
| `validateDateTimeRange(start, end)` | Validate date range |
| `formatDateTimeForAPI(dateString)` | Format to ISO 8601 |

## Peer Dependencies

- Bootstrap >= 5.3.0
- Flatpickr >= 4.6.0 (optional, for datetime pickers)

## License

MIT
