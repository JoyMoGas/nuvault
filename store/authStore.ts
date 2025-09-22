// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  recoveryToken: string | null;
  recoveryRefreshToken: string | null;
  setRecoveryTokens: (token: string, refreshToken: string) => void;
  clearRecoveryTokens: () => void;
  
  // Semáforo para el cambio de contraseña (logueado)
  isChangingPassword: boolean;
  setIsChangingPassword: (status: boolean) => void;

  // ✅ NUEVO: Semáforo para la recuperación de contraseña (logout)
  isRecoveringPassword: boolean;
  setIsRecoveringPassword: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  recoveryToken: null,
  recoveryRefreshToken: null,
  isChangingPassword: false,
  isRecoveringPassword: false, // ✅ NUEVO
  
  setRecoveryTokens: (token, refreshToken) => set({ recoveryToken: token, recoveryRefreshToken: refreshToken }),
  clearRecoveryTokens: () => set({ recoveryToken: null, recoveryRefreshToken: null }),
  setIsChangingPassword: (status) => set({ isChangingPassword: status }),
  setIsRecoveringPassword: (status) => set({ isRecoveringPassword: status }), // ✅ NUEVO
}));