// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/services/userService';

export const useProtectedRoute = () => {
  const { user, setAuth } = useAuth();
  const { isChangingPassword, isRecoveringPassword } = useAuthStore.getState(); // Usamos getState para tener el valor más actual dentro del listener
  const segments = useSegments();
  const router = useRouter();

  // EFECTO 1: Escucha los cambios de autenticación de Supabase
  useEffect(() => {
    console.log('[ProtectedRoute] Hook montado. Iniciando listener de Supabase.');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Supabase] Evento de autenticación recibido: ${event}`);

        // ✅ ¡CAMBIO CRÍTICO Y DEFINITIVO!
        // Leemos el estado de los semáforos directamente desde el store.
        const { isRecoveringPassword: isRecovering, isChangingPassword: isChanging } = useAuthStore.getState();

        // Si la app está en medio de un cambio o recuperación de contraseña,
        // IGNORAMOS COMPLETAMENTE el evento para no causar estados inconsistentes.
        if (isRecovering || isChanging) {
          console.log(`🚦 Ignorando evento '${event}' debido a operación de contraseña en curso.`);
          return;
        }

        if (session?.user) {
          const res = await getUserData(session.user.id);
          const fullUser = { ...session.user, ...(res.success ? res.data : {}) };
          setAuth(fullUser);
        } else {
          setAuth(null);
        }
      }
    );

    return () => {
      console.log('[ProtectedRoute] Desmontando. Dando de baja listener de Supabase.');
      subscription.unsubscribe();
    };
  }, [setAuth]);

  // EFECTO 2: Redirige al usuario (esta parte no cambia)
  useEffect(() => {
    const inAuthGroup = segments[0] === '(main)';
    
    if (isChangingPassword || isRecoveringPassword) {
      console.log("🚦 [ProtectedRoute] Redirección pausada por operación de contraseña.");
      return;
    }

    if (user && !inAuthGroup) {
      router.replace('/home');
    } else if (!user && inAuthGroup) {
      router.replace('/welcome');
    }
  }, [user, segments, router, isChangingPassword, isRecoveringPassword]);
};