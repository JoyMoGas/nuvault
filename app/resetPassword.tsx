// app/resetPassword.tsx

import Icon from '@/assets/icons/icons';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenWrapper from '@/components/ScreenWrapper';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore'; // ✅ Importamos nuestro almacén

const ResetPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setSessionReady] = useState(false);
  const passwordRef = useRef('');
  const confirmPasswordRef = useRef('');

  // ✅ Leemos los tokens y la función para limpiarlos desde el almacén
  const { recoveryToken, recoveryRefreshToken, clearRecoveryTokens } = useAuthStore();

  useEffect(() => {
    // Este efecto se ejecuta cuando la pantalla se monta
    const establishSession = async () => {
      if (recoveryToken && recoveryRefreshToken) {
        console.log('🔧 Estableciendo sesión desde el almacén global...');
        const { error } = await supabase.auth.setSession({
          access_token: recoveryToken,
          refresh_token: recoveryRefreshToken,
        });

        if (error) {
          Alert.alert('Error', 'El enlace ha expirado o no es válido.');
          router.replace('/forgotPassword');
        } else {
          console.log('✅ Sesión de recuperación establecida.');
          setSessionReady(true);
        }
        // Limpiamos los tokens para que no se puedan reusar
        clearRecoveryTokens();
      } else {
        // Si llegamos aquí sin tokens, el enlace era inválido o ya fue usado
        Alert.alert('Error', 'No se encontraron tokens de recuperación. Solicita un nuevo enlace.');
        router.replace('/forgotPassword');
      }
    };
    
    establishSession();
  }, []); // Se ejecuta solo una vez

  const handleResetPassword = async () => {
    if (!passwordRef.current || !confirmPasswordRef.current) {
      Alert.alert('Error', 'Por favor, llena ambos campos de contraseña.');
      return;
    }
    if (passwordRef.current !== confirmPasswordRef.current) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (passwordRef.current.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordRef.current,
    });
    
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Éxito',
        'Tu contraseña ha sido actualizada exitosamente.',
        [{ text: 'OK', onPress: () => {
            supabase.auth.signOut();
            router.replace('/login');
          } }]
      );
    }
  };

  // Muestra un indicador de carga mientras se procesa la URL
  if (!isSessionReady) {
    return (
      <ScreenWrapper bg={theme.colors.light}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Verificando enlace...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Crear Nueva Contraseña</Text>
        <Text style={styles.subtitleText}>Ingresa tu nueva contraseña segura.</Text>

        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="Nueva contraseña"
          secureTextEntry
          onChangeText={(value) => (passwordRef.current = value)}
        />
        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry
          onChangeText={(value) => (confirmPasswordRef.current = value)}
        />
        <Button
          title="Actualizar Contraseña"
          loading={loading}
          onPress={handleResetPassword}
          textStyle={{ color: theme.colors.dark }}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 25,
    paddingHorizontal: wp(5),
    paddingTop: hp(8),
  },
  headerText: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
    lineHeight: hp(3),
    textAlign: 'center',
    marginBottom: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: hp(2),
    color: theme.colors.darkGray,
  },
});

export default ResetPassword;