// hooks/useDeepLinkHandler.ts
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export const useDeepLinkHandler = () => {
  const router = useRouter();
  // ✅ OBTENEMOS LA NUEVA FUNCIÓN
  const { setRecoveryTokens, setIsRecoveringPassword } = useAuthStore();

  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      const fragment = new URL(url).hash.substring(1);
      const fragmentParams = new URLSearchParams(fragment);

      const accessToken = fragmentParams.get('access_token');
      const refreshToken = fragmentParams.get('refresh_token');
      const type = fragmentParams.get('type');
      
      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('✅ Tokens de recuperación encontrados.');
        
        // ✅ PASO 1: Encender el semáforo ANTES de cambiar la sesión
        setIsRecoveringPassword(true);
        console.log("🚦 Semáforo de recuperación ENCENDIDO");

        setRecoveryTokens(accessToken, refreshToken);
        
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error al establecer la sesión de recuperación:', error.message);
          setIsRecoveringPassword(false); // Apagar en caso de error
          return;
        }
        
        console.log('➡️ Redirigiendo a /resetPassword');
        router.replace('/resetPassword');
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    return () => {
      subscription.remove();
    };
  }, [router, setRecoveryTokens, setIsRecoveringPassword]);
};