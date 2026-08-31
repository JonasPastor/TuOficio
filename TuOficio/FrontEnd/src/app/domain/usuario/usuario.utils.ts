import { UsuarioRequest, UsuarioFormData } from './usuario.model';

/**
 * Converts form data to UsuarioRequest format
 * @param formData - The form data from the registration form
 * @returns UsuarioRequest object ready for API call
 */
export function convertToUsuarioRequest(formData: UsuarioFormData): UsuarioRequest {
  const request: UsuarioRequest = {
    password: formData.password,
    name: formData.name,
    lastName: formData.lastName,
    email: formData.email,
    documento: formData.documento,
    telefono: formData.telefono,
    nacimiento: typeof formData.nacimiento === 'string'
      ? formData.nacimiento
      : formData.nacimiento.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
    idCiudad: formData.idCiudad,
    idBarrio: formData.idBarrio,
    idTipoDoc: formData.idTipoDoc,
    calle: formData.calle,
    numero: formData.numero
  };

  // Add optional fields only if they have values
  if (formData.depto && formData.depto.trim()) {
    request.depto = formData.depto.trim();
  }
  if (formData.piso && formData.piso.trim()) {
    request.piso = formData.piso.trim();
  }
  if (formData.observaciones && formData.observaciones.trim()) {
    request.observaciones = formData.observaciones.trim();
  }

  return request;
}

/**
 * Validates if passwords match
 * @param password - The password
 * @param confirmPassword - The password confirmation
 * @returns boolean indicating if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Formats the complete address string from individual components
 * @param calle - Street name
 * @param numero - Street number
 * @param piso - Floor (optional)
 * @param depto - Department/Unit (optional)
 * @returns Formatted address string
 */
export function formatAddress(calle: string, numero: string, piso?: string, depto?: string): string {
  let address = `${calle} ${numero}`;

  if (piso && piso.trim()) {
    address += `, Piso ${piso.trim()}`;
  }

  if (depto && depto.trim()) {
    address += `, Depto ${depto.trim()}`;
  }

  return address;
}

/**
 * Validates address fields
 * @param addressData - Object containing address fields
 * @returns Object with validation results
 */
export function validateAddress(addressData: {
  calle: string;
  numero: string;
  depto?: string;
  piso?: string;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!addressData.calle || !addressData.calle.trim()) {
    errors.push('La calle es requerida');
  }

  if (!addressData.numero || !addressData.numero.trim()) {
    errors.push('El número es requerido');
  }

  // Validate numero is numeric
  if (addressData.numero && !/^\d+[a-zA-Z]?$/.test(addressData.numero.trim())) {
    errors.push('El número debe ser numérico (puede contener una letra al final)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
