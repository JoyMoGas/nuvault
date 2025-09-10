import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';

export const useDeepLink = () => {
  const router = useRouter();

  useEffect(() => {
    // Manejar deep links cuando la app está cerrada
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Manejar deep links cuando la app está abierta
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    getInitialUrl();

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('Deep link recibido:', url);

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Manejar reset password
      if (path === '/reset-password') {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (token) {
          console.log('Navegando a reset password con token');
          // Navegar a la pantalla de reset password con el token
          router.push(`/resetPassword?token=${token}${refreshToken ? `&refresh_token=${refreshToken}` : ''}`);
        }
        return;
      }

      // Manejar otras rutas
      switch (path) {
        case '/login':
          router.push('/login');
          break;
        case '/signup':
          router.push('/signUp');
          break;
        case '/forgot-password':
          router.push('/forgotPassword');
          break;
        case '/home':
        case '/':
          router.push('/home');
          break;
        default:
          console.log('Ruta no reconocida:', path);
          router.push('/home'); // Fallback
      }
    } catch (error) {
      console.error('Error procesando deep link:', error);
      router.push('/home'); // Fallback en caso de error
    }
  };

  return { handleDeepLink };
};