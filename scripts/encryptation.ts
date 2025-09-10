import { SECRET_KEY } from '@/constants';
import CryptoJS from 'crypto-js';

// La clave de encriptación debe ser segura, no la pongas aquí en texto plano.
// La ideal sería obtenerla de una API o servicio seguro.
const ENCRYPTION_KEY = SECRET_KEY; // ¡ADVERTENCIA: No hagas esto en producción!

export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export const decryptPassword = (encryptedPassword: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};