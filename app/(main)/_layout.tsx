// app/(main)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function MainStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="addPassword" />
      <Stack.Screen name="changePassword" />
      <Stack.Screen name="editPassword" />
      <Stack.Screen name="passwordGenerator" />
      <Stack.Screen name="settings" /> 
      {/* Correcto: La línea para 'help' no está aquí */}
    </Stack>
  );
}