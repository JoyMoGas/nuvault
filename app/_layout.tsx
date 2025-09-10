// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/authContext';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/userService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Linking } from 'react-native'; // ✅ Solo agregué Linking aquí

const MainLayout = () => {
  const { setAuth, user } = useAuth(); // 👈 Agregamos user para debugging
  const router = useRouter();

  // ✅ NUEVO: Función para manejar deep links (sin hook separado)
  const handleDeepLink = (url: string) => {
    console.log('🔗 Deep link recibido:', url);

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Manejar reset password
      if (path === '/reset-password') {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (token) {
          console.log('🔐 Navegando a reset password con token');
          router.push(`/resetPassword?token=${token}${refreshToken ? `&refresh_token=${refreshToken}` : ''}`);
        }
        return;
      }

      // Manejar otras rutas si necesitas
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
        default:
          console.log('🔗 Ruta no reconocida:', path);
      }
    } catch (error) {
      console.error('❌ Error procesando deep link:', error);
    }
  };

  useEffect(() => {
    console.log("🔄 Layout: Estado actual del usuario:", user?.email || "No user");

    // ✅ NUEVO: Configurar deep linking
    const setupDeepLinking = async () => {
      // Manejar deep links cuando la app está cerrada
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }

      // Manejar deep links cuando la app está abierta
      const subscription = Linking.addEventListener('url', (event) => {
        handleDeepLink(event.url);
      });

      return subscription;
    };

    const deepLinkSubscription = setupDeepLinking();
   
    const handleAuthChange = async (event, session) => {
      console.log("🔄 AuthStateChange disparado:", event, session?.user?.email || "No session");
     
      // ✅ IGNORAR USER_UPDATED para evitar redirección automática
      if (event === 'USER_UPDATED') {
        console.log("⚠️ USER_UPDATED detectado - Solo actualizando datos, NO redirigiendo");
        if (session?.user && user) {
          // Solo actualizar datos sin navegar
          const res = await getUserData(session.user.id);
          if (res.success) {
            setAuth({ ...session.user, ...res.data });
          } else {
            setAuth(session.user);
          }
        }
        return; // ✅ NO navegues en USER_UPDATED
      }
     
      if (session?.user) {
        console.log("✅ Usuario autenticado, obteniendo datos...");
        const res = await getUserData(session.user.id);
        if (res.success) {
          setAuth({ ...session.user, ...res.data });
        } else {
          setAuth(session.user);
        }
        console.log("➡️ Navegando a /home");
        router.replace('/home');
      } else {
        console.log("❌ No hay sesión, limpiando estado...");
        setAuth(null);
        console.log("➡️ Navegando a /welcome");
        router.replace('/welcome');
      }
    };

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔍 Sesión inicial:", session?.user?.email || "No session");
      handleAuthChange('INITIAL_SESSION', session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
   
    return () => {
      console.log("🧹 Limpiando suscripción de auth");
      subscription.unsubscribe();
      
      // ✅ NUEVO: Limpiar suscripción de deep linking
      deepLinkSubscription.then(sub => sub?.remove());
    };
  }, []); // 👈 Removemos dependencias para evitar loops

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ NUEVO: Solo agregué esta línea para la nueva pantalla */}
      <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
    </Stack>
  );
}

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RootLayout;