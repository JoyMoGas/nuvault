// app/(main)/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

// Este layout ya NO necesita llamar al hook.
// Solo define las pantallas de esta sección.
export default function MainStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="addPassword" />
      <Stack.Screen name="changePassword" />
      <Stack.Screen name="editPassword" />
      <Stack.Screen name="help" />
      <Stack.Screen name="passwordGenerator" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}