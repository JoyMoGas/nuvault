import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    KeyboardAvoidingView, // ✅ 1. Importar KeyboardAvoidingView
    Platform              // ✅ 2. Importar Platform
} from "react-native";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/lib/supabase";
import ScreenWrapper from "@/components/ScreenWrapper";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Icon from "@/assets/icons/icons";
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import BackButton from "@/components/BackButton";
import CustomModal from "@/components/CustomModal";

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ current: '', new: '', confirm: '', general: '' });
  const [modalConfig, setModalConfig] = useState<any>(null);

  const { setIsChangingPassword } = useAuthStore();

  const handleSuccess = async () => {
    setModalConfig(null);
    try {
      await logout();
      router.replace('/welcome');
    } catch (e) {
      console.error("Error en el proceso de logout final:", e);
      router.replace('/welcome');
    } finally {
      setIsChangingPassword(false);
    }
  }

  const handleChangePassword = async () => {
    setErrors({ current: '', new: '', confirm: '', general: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrors(prev => ({ ...prev, general: "Please fill all fields" }));
      return;
    }
    if (newPassword.length < 6) {
      setErrors(prev => ({...prev, new: "Password must be at least 6 characters"}));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirm: "New passwords do not match" }));
      return;
    }

    setLoading(true);
    setIsChangingPassword(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (loginError) {
        throw new Error("Current password is incorrect");
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }
      setLoading(false);
      
      setModalConfig({
        iconName: "check",
        iconColor: theme.colors.green,
        title: "Success",
        description: "Password updated successfully. You will be logged out.",
        primaryButtonTitle: "OK",
        onPrimaryButtonPress: handleSuccess,
      });

    } catch (error: any) {
      const errorMessage = error.message === "Current password is incorrect" 
        ? { current: error.message }
        : { general: error.message || "An unexpected error occurred." };
        
      setErrors(prev => ({ ...prev, ...errorMessage }));
      setLoading(false);
      setIsChangingPassword(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <StatusBar style="dark" />

      {/* ✅ 3. Envolver el contenido con KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? hp(8) : 0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
              <BackButton />
              <Text style={styles.headerTitle}>Change Password</Text>
          </View>
          
          {errors.general ? <Text style={styles.errorTextGeneral}>{errors.general}</Text> : null}

          <View style={styles.form}>
              <Input
                  icon={<Icon name="lock" size={26} />}
                  placeholder="Current Password"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={(text) => { setCurrentPassword(text); setErrors(prev => ({...prev, current: '', general: ''}))}}
              />
              {errors.current ? <Text style={styles.errorText}>{errors.current}</Text> : null}

              <Input
                  icon={<Icon name="lock" size={26} />}
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={(text) => { setNewPassword(text); setErrors(prev => ({...prev, new: '', confirm: ''}))}}
              />
              {errors.new ? <Text style={styles.errorText}>{errors.new}</Text> : null}

              <Input
                  icon={<Icon name="lock" size={26} />}
                  placeholder="Confirm New Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setErrors(prev => ({...prev, confirm: ''}))}}
              />
              {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
          </View>
          
          <View style={styles.buttonWrapper}>
              <Button
                  title="Update Password"
                  loading={loading}
                  onPress={handleChangePassword}
                  buttonStyle={{backgroundColor: theme.colors.primary}}
                  textStyle={{ color: theme.colors.dark }}
              />
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* ✅ Fin del KeyboardAvoidingView */}
      
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(2),
  },
  headerTitle: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    textAlign: "center",
    flex: 1,
    marginLeft: -wp(7),
  },
  form: {
    gap: 15,
    marginTop: hp(2)
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: hp(4),
  },
  errorTextGeneral: {
    color: theme.colors.red,
    fontSize: hp(1.8),
    textAlign: 'center',
    marginBottom: hp(2),
  },
  errorText: {
    color: theme.colors.red,
    fontSize: hp(1.8),
    paddingLeft: wp(2),
    marginTop: -hp(1),
    marginBottom: hp(1),
  },
});

export default ChangePassword;