// app/_layout.tsx
import { AuthProvider } from '@/contexts/authContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useDeepLinkHandler } from '@/hooks/useDeepLinkHandler';

// Este componente "guardia" se asegura de que nuestros hooks siempre estén activos
function AuthStateGuard() {
  useDeepLinkHandler(); // Maneja los enlaces de recuperación de contraseña
  useProtectedRoute();  // Maneja el estado de sesión y las redirecciones
  
  console.log('[Layout] AuthStateGuard está activo.');
  
  return null; // No renderiza nada
}

// La estructura de navegación de tu app
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="forgotPassword" />
      <Stack.Screen name="resetPassword" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

// El layout raíz que envuelve toda la aplicación
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <AuthStateGuard />
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});