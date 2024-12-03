export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: ValidationRule[];
}

export interface ValidationConfig {
  [key: string]: FieldValidation;
}

export function validateField(value: any, validation: FieldValidation): ValidationResult {
  // Check if field is required
  if (validation.required && (value === null || value === undefined || value === '')) {
    return {
      isValid: false,
      message: 'This field is required'
    };
  }

  // If field is empty and not required, it's valid
  if (!value && !validation.required) {
    return { isValid: true };
  }

  const numValue = Number(value);

  // Check minimum value
  if (validation.min !== undefined && numValue < validation.min) {
    return {
      isValid: false,
      message: `Value must be at least ${validation.min}`
    };
  }

  // Check maximum value
  if (validation.max !== undefined && numValue > validation.max) {
    return {
      isValid: false,
      message: `Value must not exceed ${validation.max}`
    };
  }

  // Check pattern
  if (validation.pattern && !validation.pattern.test(String(value))) {
    return {
      isValid: false,
      message: 'Invalid format'
    };
  }

  // Check custom rules
  if (validation.custom) {
    for (const rule of validation.custom) {
      if (!rule.test(value)) {
        return {
          isValid: false,
          message: rule.message
        };
      }
    }
  }

  return { isValid: true };
}

export function validateForm<T extends object>(
  data: T,
  config: ValidationConfig
): { [K in keyof T]?: string } {
  const errors = {} as { [K in keyof T]?: string };

  for (const [field, validation] of Object.entries(config)) {
    if (field in data) {
      const result = validateField(data[field as keyof T], validation);
      if (!result.isValid && result.message) {
        errors[field as keyof T] = result.message;
      }
    }
  }

  return errors;
}

// Common validation configurations
export const commonValidations = {
  positiveNumber: {
    required: true,
    min: 0,
    pattern: /^\d*\.?\d*$/,
    custom: [{
      test: (value: any) => !isNaN(value) && Number.isFinite(Number(value)),
      message: 'Must be a valid number'
    }]
  },
  
  percentage: {
    required: true,
    min: 0,
    max: 100,
    pattern: /^\d*\.?\d*$/,
    custom: [{
      test: (value: any) => !isNaN(value) && Number.isFinite(Number(value)),
      message: 'Must be a valid percentage'
    }]
  },
  
  currency: {
    required: true,
    min: 0,
    pattern: /^\d*\.?\d{0,2}$/,
    custom: [{
      test: (value: any) => !isNaN(value) && Number.isFinite(Number(value)),
      message: 'Must be a valid currency amount'
    }]
  },
  
  integer: {
    required: true,
    pattern: /^\d+$/,
    custom: [{
      test: (value: any) => Number.isInteger(Number(value)),
      message: 'Must be a whole number'
    }]
  }
};
