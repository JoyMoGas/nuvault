import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Icon from '@/assets/icons/icons';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import CustomModal from '@/components/CustomModal'; // ✅ 1. Importar nuestro modal

const ResetPassword = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ password: '', confirmPassword: '', general: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // ✅ 2. Añadir estado para la configuración del modal
  const [modalConfig, setModalConfig] = useState<any>(null);

  const { clearRecoveryTokens, setIsRecoveringPassword } = useAuthStore();

  // ✅ 3. Crear una función para manejar la acción del modal de éxito
  const handleSuccess = async () => {
    setModalConfig(null); // Ocultar el modal
    setIsRecoveringPassword(false);
    await supabase.auth.signOut();
    clearRecoveryTokens();
    router.replace('/login');
  };

  const handleResetPassword = async () => {
    setErrors({ password: '', confirmPassword: '', general: '' });

    // Bloque de validación (sin cambios)
    if (!password || !confirmPassword) {
      setErrors(prev => ({ ...prev, general: 'Please fill both fields.' }));
      return;
    }
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters.' }));
      return;
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;
      
      setModalConfig({
        iconName: "check",
        iconColor: theme.colors.green,
        title: "Success",
        description: "Your password has been reset successfully. Please log in.",
        primaryButtonTitle: "OK",
        onPrimaryButtonPress: handleSuccess,
      });

    } catch (e: any) {
      setErrors(prev => ({ ...prev, general: e.message || 'An unexpected error occurred.' }));
      // ✅ 5. Asegurarse de apagar el semáforo también en caso de error
      setIsRecoveringPassword(false);
    } finally {
      setLoading(false);
      // Se quita setIsRecoveringPassword(false) de aquí, ya que se maneja en el success y el error.
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.headerText}>Create New Password</Text>
        <Text style={styles.subHeaderText}>Enter your new password below.</Text>
        
        {errors.general ? <Text style={styles.errorTextGeneral}>{errors.general}</Text> : null}

        <View style={styles.form}>
            <Input
              icon={<Icon name="lock" size={26} />}
              placeholder="New Password"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              rightIcon={
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'show' : 'hide'} size={26} />
                </Pressable>
              }
            />
            {errors.password ? <Text style={styles.errorTag}>{errors.password}</Text> : null}

            <Input
              icon={<Icon name="lock" size={26} />}
              placeholder="Confirm New Password"
              secureTextEntry={!isPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              rightIcon={
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'show' : 'hide'} size={26} />
                </Pressable>
              }
            />
            {errors.confirmPassword ? <Text style={styles.errorTag}>{errors.confirmPassword}</Text> : null}
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Reset Password"
            loading={loading}
            onPress={handleResetPassword}
            buttonStyle={{ backgroundColor: theme.colors.primary }}
            textStyle={{ color: theme.colors.dark }}
          />
        </View>
      </View>

      {/* ✅ 6. Renderizar nuestro modal dinámico */}
      {modalConfig && (
        <CustomModal
          isVisible={!!modalConfig}
          onClose={() => setModalConfig(null)}
          {...modalConfig}
          onPrimaryButtonPress={
            modalConfig.onPrimaryButtonPress || (() => setModalConfig(null))
          }
        />
      )}
    </ScreenWrapper>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(8),
  },
  headerText: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
    textAlign: 'center',
    marginTop: hp(1),
    marginBottom: hp(4),
  },
  form: {
    gap: 20,
  },
  buttonWrapper: {
    marginTop: hp(4),
  },
  errorTextGeneral: {
    color: theme.colors.red,
    fontSize: hp(1.8),
    textAlign: 'center',
    marginBottom: hp(2),
  },
  errorTag: {
    color: theme.colors.red,
    fontSize: hp(1.6),
    marginTop: -hp(1.5),
    marginBottom: hp(0.5),
    paddingLeft: wp(2),
  },
});

export default ResetPassword;