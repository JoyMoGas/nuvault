// hooks/useProtectedRoute.ts

import { useAuth } from '@/contexts/authContext';
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/services/userService';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
  const { user, setAuth } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Solo actualiza el contexto de usuario basado en la sesión.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const res = await getUserData(session.user.id);
        const userData = res.success ? { ...session.user, ...res.data } : session.user;
        setAuth(userData);
      } else {
        setAuth(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Solo maneja la redirección.
    const inAuthGroup = segments[0] === '(main)';
    if (segments.length === 0) return;

    if (!user && inAuthGroup) {
      router.replace('/welcome');
    } else if (user && !inAuthGroup) {
      router.replace('/(main)/home');
    }
  }, [user, segments, router]);
}