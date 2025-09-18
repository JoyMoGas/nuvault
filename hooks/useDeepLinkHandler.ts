// hooks/useDeepLinkHandler.ts
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export function useDeepLinkHandler() {
  const router = useRouter();
  const { setRecoveryTokens } = useAuthStore();

  useEffect(() => {
    // Función para procesar la URL, ya sea de inicio o de un evento
    const processUrl = (url: string | null) => {
      if (!url) return;

      console.log('🔗 Deep Link recibido:', url);
      const hash = url.split('#')[1];
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        console.log(' -> Tokens de recuperación encontrados. Guardando en el almacén...');
        // Guardamos los tokens en nuestro almacén global (Zustand)
        setRecoveryTokens(accessToken, refreshToken);
        // Navegamos a la pantalla de reseteo
        router.replace('/resetPassword');
      }
    };

    // 1. Maneja el enlace si la app se abre desde un estado "muerto"
    Linking.getInitialURL().then(processUrl);

    // 2. Maneja el enlace si la app ya está abierta en segundo plano
    const subscription = Linking.addEventListener('url', (event) => processUrl(event.url));

    // Limpia el listener al desmontar
    return () => {
      subscription.remove();
    };
  }, []); // El array vacío asegura que esto se configure solo una vez
}