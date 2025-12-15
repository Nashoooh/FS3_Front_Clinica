import { FormControl } from '@angular/forms';
import { passwordStrengthValidator, getPasswordErrorMessage } from './password.validator';

describe('passwordStrengthValidator', () => {
  let validator: any;

  beforeEach(() => {
    validator = passwordStrengthValidator();
  });

  it('should return null for valid password', () => {
    const control = new FormControl('Test123');
    const result = validator(control);
    expect(result).toBeNull();
  });

  it('should return null for valid password with symbols', () => {
    const control = new FormControl('Test123!@#');
    const result = validator(control);
    expect(result).toBeNull();
  });

  it('should return null for empty value (handled by required validator)', () => {
    const control = new FormControl('');
    const result = validator(control);
    expect(result).toBeNull();
  });

  it('should return error for password without uppercase', () => {
    const control = new FormControl('test123');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['noUppercase']).toBe(true);
  });

  it('should return error for password without lowercase', () => {
    const control = new FormControl('TEST123');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['noLowercase']).toBe(true);
  });

  it('should return error for password without number', () => {
    const control = new FormControl('TestTest');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['noNumber']).toBe(true);
  });

  it('should return error for password too short', () => {
    const control = new FormControl('Te1');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['minLength']).toEqual({ requiredLength: 6, actualLength: 3 });
  });

  it('should return multiple errors for weak password', () => {
    const control = new FormControl('test');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['minLength']).toBeDefined();
    expect(result?.['noUppercase']).toBe(true);
    expect(result?.['noNumber']).toBe(true);
  });

  it('should accept password with exactly 6 characters', () => {
    const control = new FormControl('Test12');
    const result = validator(control);
    expect(result).toBeNull();
  });

  it('should accept long password with all requirements', () => {
    const control = new FormControl('TestPassword123!@#$%^&*()');
    const result = validator(control);
    expect(result).toBeNull();
  });
});

describe('getPasswordErrorMessage', () => {
  it('should return empty string for null errors', () => {
    const message = getPasswordErrorMessage(null);
    expect(message).toBe('');
  });

  it('should return required message', () => {
    const message = getPasswordErrorMessage({ required: true });
    expect(message).toBe('La contraseña es requerida');
  });

  it('should return minLength message', () => {
    const message = getPasswordErrorMessage({ minLength: { requiredLength: 6, actualLength: 3 } });
    expect(message).toContain('mínimo 6 caracteres');
  });

  it('should return uppercase message', () => {
    const message = getPasswordErrorMessage({ noUppercase: true });
    expect(message).toContain('una letra mayúscula');
  });

  it('should return lowercase message', () => {
    const message = getPasswordErrorMessage({ noLowercase: true });
    expect(message).toContain('una letra minúscula');
  });

  it('should return number message', () => {
    const message = getPasswordErrorMessage({ noNumber: true });
    expect(message).toContain('un número');
  });

  it('should return combined message for multiple errors', () => {
    const message = getPasswordErrorMessage({
      minLength: { requiredLength: 6, actualLength: 3 },
      noUppercase: true,
      noNumber: true
    });
    expect(message).toContain('mínimo 6 caracteres');
    expect(message).toContain('una letra mayúscula');
    expect(message).toContain('un número');
  });

  it('should prioritize required message over others', () => {
    const message = getPasswordErrorMessage({
      required: true,
      minLength: { requiredLength: 6, actualLength: 3 }
    });
    expect(message).toBe('La contraseña es requerida');
  });
});
