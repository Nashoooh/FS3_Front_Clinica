import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de contraseña robusta (Regla de 4):
 * - Al menos 6 caracteres de longitud
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Permite símbolos especiales
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si está vacío, el validador required se encargará
    }

    const errors: ValidationErrors = {};

    // Verificar longitud mínima
    if (value.length < 6) {
      errors['minLength'] = { requiredLength: 6, actualLength: value.length };
    }

    // Verificar que contenga al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['noUppercase'] = true;
    }

    // Verificar que contenga al menos una minúscula
    if (!/[a-z]/.test(value)) {
      errors['noLowercase'] = true;
    }

    // Verificar que contenga al menos un número
    if (!/[0-9]/.test(value)) {
      errors['noNumber'] = true;
    }

    // Si hay errores, retornarlos; si no, retornar null
    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Obtiene un mensaje de error legible para los errores de validación de contraseña
 */
export function getPasswordErrorMessage(errors: ValidationErrors | null): string {
  if (!errors) {
    return '';
  }

  const messages: string[] = [];

  if (errors['required']) {
    return 'La contraseña es requerida';
  }

  if (errors['minLength']) {
    messages.push('mínimo 6 caracteres');
  }

  if (errors['noUppercase']) {
    messages.push('al menos una letra mayúscula');
  }

  if (errors['noLowercase']) {
    messages.push('al menos una letra minúscula');
  }

  if (errors['noNumber']) {
    messages.push('al menos un número');
  }

  if (messages.length > 0) {
    return 'La contraseña debe contener: ' + messages.join(', ');
  }

  return '';
}
