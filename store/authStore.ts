// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  recoveryToken: string | null;
  recoveryRefreshToken: string | null;
  setRecoveryTokens: (token: string, refreshToken: string) => void;
  clearRecoveryTokens: () => void;
}

// Este es nuestro almacén global para los tokens de recuperación
export const useAuthStore = create<AuthState>((set) => ({
  recoveryToken: null,
  recoveryRefreshToken: null,
  setRecoveryTokens: (token, refreshToken) => set({ recoveryToken: token, recoveryRefreshToken: refreshToken }),
  clearRecoveryTokens: () => set({ recoveryToken: null, recoveryRefreshToken: null }),
}));