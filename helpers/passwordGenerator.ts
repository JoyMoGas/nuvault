// Opciones para la generación de la contraseña
export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSpecial: boolean;
}

// Conjuntos de caracteres
const CHAR_SETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Genera una contraseña segura basada en las opciones proporcionadas.
 * @param options - Las reglas para generar la contraseña.
 * @returns La contraseña generada.
 */
export const generatePassword = (options: PasswordOptions): string => {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSpecial,
  } = options;

  let allowedChars = '';
  const requiredChars: string[] = [];

  // Construir el conjunto de caracteres permitidos y asegurar que cada tipo esté incluido
  if (includeUppercase) {
    allowedChars += CHAR_SETS.UPPERCASE;
    requiredChars.push(CHAR_SETS.UPPERCASE[Math.floor(Math.random() * CHAR_SETS.UPPERCASE.length)]);
  }
  if (includeLowercase) {
    allowedChars += CHAR_SETS.LOWERCASE;
    requiredChars.push(CHAR_SETS.LOWERCASE[Math.floor(Math.random() * CHAR_SETS.LOWERCASE.length)]);
  }
  if (includeNumbers) {
    allowedChars += CHAR_SETS.NUMBERS;
    requiredChars.push(CHAR_SETS.NUMBERS[Math.floor(Math.random() * CHAR_SETS.NUMBERS.length)]);
  }
  if (includeSpecial) {
    allowedChars += CHAR_SETS.SPECIAL;
    requiredChars.push(CHAR_SETS.SPECIAL[Math.floor(Math.random() * CHAR_SETS.SPECIAL.length)]);
  }

  // Si no se selecciona ninguna opción, no se puede generar una contraseña
  if (allowedChars.length === 0) {
    return 'Select an option';
  }

  // Generar el resto de la contraseña
  const remainingLength = length - requiredChars.length;
  let password = '';
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length);
    password += allowedChars[randomIndex];
  }

  // Mezclar todos los caracteres (requeridos + generados) para que sea aleatorio
  const finalPasswordArray = (password + requiredChars.join('')).split('');
  for (let i = finalPasswordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalPasswordArray[i], finalPasswordArray[j]] = [finalPasswordArray[j], finalPasswordArray[i]];
  }

  return finalPasswordArray.join('');
};