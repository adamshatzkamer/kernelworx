/**
 * Validation rules and types for public order forms.
 */

// Maximum quantity allowed for any product in a public order
export const MAX_PUBLIC_QUANTITY = 99;

// Maximum length for buyer notes
export const MAX_BUYER_NOTES_LENGTH = 500;

/**
 * Check if an address has been started (at least one field filled).
 */
export function addressStarted(address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): boolean {
  return !!(
    address?.street?.trim() ||
    address?.city?.trim() ||
    address?.state?.trim() ||
    address?.zipCode?.trim()
  );
}

/**
 * Form address shape for public orders.
 */
export interface PublicOrderAddressForm {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Field-level errors for public order forms.
 */
export interface PublicOrderFieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  lineItems?: string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Complete form state for public orders.
 */
export interface PublicOrderFormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  lineItems: Record<string, number>; // productId -> quantity
  paymentMethod: string;
  notes: string;
}

/**
 * Validate the entire public order form.
 * @param form - The form state to validate
 * @returns An object with isValid boolean and field-specific errors
 */
export function validatePublicOrderForm(form: PublicOrderFormState): {
  isValid: boolean;
  errors: PublicOrderFieldErrors;
} {
  const errors: PublicOrderFieldErrors = {};

  // Validate required fields
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  }

  // Validate address if phone is not provided (phone or address required)
  const hasPhone = !!form.phone.trim();
  const hasAddress = addressStarted(form.address);
  if (!hasPhone && !hasAddress) {
    errors.address = 'Phone or a complete address is required';
  }

  // Validate at least one line item with quantity > 0
  const hasLineItems = Object.values(form.lineItems).some(qty => qty > 0);
  if (!hasLineItems) {
    errors.lineItems = 'At least one product with quantity greater than zero is required';
  }

  // Validate payment method is selected
  if (!form.paymentMethod.trim()) {
    errors.paymentMethod = 'Payment method is required';
  }

  return {
    isValid: Object.values(errors).every(error => error === undefined),
    errors,
  };
}

/**
 * Check if the public order form is valid.
 * @param form - The form state to check
 * @returns True if valid, false otherwise
 */
export function publicOrderFormIsValid(form: PublicOrderFormState): boolean {
  return validatePublicOrderForm(form).isValid;
}