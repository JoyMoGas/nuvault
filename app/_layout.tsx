// app/_layout.tsx

import { AuthProvider } from '@/contexts/authContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useDeepLinkHandler } from '@/hooks/useDeepLinkHandler';


// Define la estructura de la navegación.
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

function AuthNavigator() {
  useDeepLinkHandler(); // ✅ Usamos el nuevo oyente de enlaces aquí
  useProtectedRoute();
  return null;
}


// El layout principal que une todo.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        {/* El guardia siempre está activo en segundo plano */}
        <AuthNavigator />
        {/* La navegación se renderiza de forma independiente */}
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