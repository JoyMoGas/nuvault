// app/changePassword.tsx

import React, { useState, useRef } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/lib/supabase";
import ScreenWrapper from "@/components/ScreenWrapper";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Icon from "@/assets/icons/icons";
import BackButton from "@/components/BackButton";
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const currentPasswordRef = useRef("");
  const newPasswordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    const currentPassword = currentPasswordRef.current.trim();
    const newPassword = newPasswordRef.current.trim();
    const confirmPassword = confirmPasswordRef.current.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match");
      return;
    }

    setLoading(true);

    try {
      // Verificar contraseña actual
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (loginError) {
        setLoading(false);
        Alert.alert("Error", "Current password is incorrect");
        return;
      }

      // Cambiar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setLoading(false);
        Alert.alert("Error", updateError.message);
        return;
      }

      setLoading(false);

      // ✅ SOLUCIÓN DEFINITIVA - INTERCEPTAR USER_UPDATED
      console.log("🚨 MOSTRANDO ALERT DE ÉXITO");
      Alert.alert(
        "Success",
        "Password updated successfully. You will be logged out.",
        [
          {
            text: 'OK',
            onPress: async () => {
              console.log("👆 Usuario presionó OK en el Alert");
              try {
                console.log("🔄 Iniciando proceso de logout...");
                
                // 1. Hacer logout para limpiar sesión en Supabase
                await logout();
                
                // 2. Forzar navegación inmediatamente  
                router.replace('/welcome');
                
                // 3. Como respaldo adicional, forzar después de un delay
                setTimeout(() => {
                  console.log("🔄 Respaldo: Forzando navegación a welcome");
                  router.replace('/welcome');
                }, 1000);
                
              } catch (error) {
                console.error("Error during logout:", error);
                // Si todo falla, forzar navegación de todas formas
                router.replace('/welcome');
              }
            },
          },
        ],
        { cancelable: false }
      );

    } catch (error: any) {
      console.error("Unexpected error:", error);
      setLoading(false);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={{ marginTop: 10 }}>
          <BackButton />
        </View>

        <Text style={styles.headerText}>Change Password</Text>

        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="Current Password"
          secureTextEntry
          onChangeText={(value: string) => (currentPasswordRef.current = value)}
        />
        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="New Password"
          secureTextEntry
          onChangeText={(value: string) => (newPasswordRef.current = value)}
        />
        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="Confirm New Password"
          secureTextEntry
          onChangeText={(value: string) => (confirmPasswordRef.current = value)}
        />

        <Button
          title="Update Password"
          loading={loading}
          onPress={handleChangePassword}
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
    paddingTop: hp(3),
  },
  headerText: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginBottom: hp(2),
  },
});

export default ChangePassword;