/**
 * Password validation utilities
 */

/**
 * Standard password validation for regular users
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * 
 * @param password Password to validate
 * @returns Object with valid flag and error message if invalid
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  return { valid: true };
}

/**
 * Advanced password validation for super admin users
 * Requirements:
 * - At least 20 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character from the set: !, @, #, $
 * 
 * @param password Password to validate
 * @returns Object with valid flag and error message if invalid
 */
export function validateSuperAdminPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 20) {
    return {
      valid: false,
      message: 'Super admin password must be at least 20 characters long'
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  if (!/[!@#$]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character from: !, @, #, $'
    };
  }
  
  return { valid: true };
}