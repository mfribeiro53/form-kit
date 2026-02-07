# Form Kit

A configuration-driven form enhancement library for Bootstrap 5.

## Features

- Dynamic form generation from JSON/YAML configs
- Form validation (HTML5 + custom validators)
- Character counters and input enhancements
- Toast notifications for user feedback
- API submission helpers
- Flatpickr datetime integration

## Installation

```bash
npm install github:mfribeiro53/form-kit
```

## Usage

```javascript
import { initializeForm, showToast } from '@mfribeiro/form-kit';

// Initialize a form
const formInstance = initializeForm('myFormId');

// Show toast notification
showToast('Form submitted successfully!', 'success');
```

## Custom Validators

```javascript
import { registerValidator, validateFormWithCustom } from '@mfribeiro/form-kit';

// Register a custom validator
registerValidator('customRule', (value, options) => {
  return {
    valid: value.length >= 5,
    message: 'Must be at least 5 characters'
  };
});

// Validate form with custom validators
const isValid = validateFormWithCustom(form, {
  username: ['customRule'],
  phone: ['phone']
});
```

## Built-in Custom Validators

- `dateRange` - Validates end date is after start date
- `phone` - Validates phone number format (10-15 digits)
- `matchField` - Validates field matches another field
- `conditionalRequired` - Required when condition is met

## License

MIT
