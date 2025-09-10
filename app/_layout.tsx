// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/authContext';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/userService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const MainLayout = () => {
  const { setAuth, user } = useAuth(); // 👈 Agregamos user para debugging
  const router = useRouter();

  useEffect(() => {
    console.log("🔄 Layout: Estado actual del usuario:", user?.email || "No user");
    
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
    };
  }, []); // 👈 Removemos dependencias para evitar loops

  return (
    <Stack screenOptions={{ headerShown: false }} />
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