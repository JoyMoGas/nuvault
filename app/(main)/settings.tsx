import Icon from "@/assets/icons/icons";
import BackButton from "@/components/BackButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { hp, wp } from "@/helpers/common";
import { deleteUserAccount, updateUser } from "@/services/userService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomModal from "@/components/CustomModal";
import { supabase } from "@/lib/supabase";

const Settings = () => {
  const { user, setUserData } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ GESTIÓN DE MODALES: Un único estado para controlar todos los modales.
  // Cuando es 'null', no hay modal. Cuando tiene un objeto, se muestra el modal con esa configuración.
  const [modalConfig, setModalConfig] = useState<any>(null);

  const router = useRouter();

  // --- LOGOUT ---
  const handleLogout = () => {
    setModalConfig({
      iconName: "logOut",
      iconColor: theme.colors.red,
      title: "Confirm Logout",
      description: "Are you sure you want to log out?",
      primaryButtonTitle: "Logout",
      onPrimaryButtonPress: confirmLogout,
      primaryButtonColor: theme.colors.red,
      secondaryButtonTitle: "Cancel",
    });
  };

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: "An error occurred while signing out. Please try again.",
        primaryButtonTitle: "OK",
      });
    }
  };

  const confirmLogout = () => {
    setModalConfig(null); // Cierra el modal de confirmación
    onLogout();
  };

  // --- USERNAME ---
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    if (username.trim() === "") {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: "Username cannot be empty.",
        primaryButtonTitle: "OK",
      });
      return;
    }

    const res = await updateUser(user.id, { username: username.trim() });
    if (res.success) {
      setUserData({ username: username.trim() });
      setIsEditing(false);
    } else {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: "Could not update username. Please try again.",
        primaryButtonTitle: "OK",
      });
    }
  };

  // --- DELETE ACCOUNT ---
  const handleDeleteAccount = () => {
    setModalConfig({
      iconName: "delete",
      iconColor: theme.colors.red,
      title: "Confirm Deletion",
      description: "This action is irreversible and will permanently delete all your data. Are you sure?",
      primaryButtonTitle: "Delete",
      onPrimaryButtonPress: executeDelete,
      primaryButtonColor: theme.colors.red,
      secondaryButtonTitle: "Cancel",
    });
  };

  const executeDelete = async () => {
    setModalConfig(null); // Cierra el modal de confirmación
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(user?.id);
      if (result.success) {
        setModalConfig({
          iconName: "check",
          iconColor: theme.colors.green,
          title: "Success",
          description: "Your account has been completely deleted.",
          primaryButtonTitle: "OK",
          // La acción del botón OK es opcional ya que el usuario será deslogueado por el trigger de Supabase.
          // Si quisieras redirigir manualmente, lo harías aquí.
        });
      } else {
        setModalConfig({
          iconName: "error",
          iconColor: theme.colors.red,
          title: "Error",
          description: result.msg || "Could not delete account. Please try again.",
          primaryButtonTitle: "OK",
        });
      }
    } catch (error) {
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        primaryButtonTitle: "OK",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: hp(5) }}>
        {/* Tu JSX para la UI se queda igual */}
        <View style={styles.header}>
          <BackButton size={30} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.inputContainer}>
          <View style={styles.usernameRow}>
            <Icon name="user" size={20} color={theme.colors.darkGray} style={styles.icon}/>
            {isEditing ? (
              <TextInput style={styles.input} value={username} onChangeText={setUsername} onEndEditing={handleUpdateUsername} autoFocus />
            ) : (
              <Text style={styles.infoText}>{username}</Text>
            )}
            <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editIcon}>
              <Icon name={isEditing ? "correct" : "fullEdit"} size={20} color={theme.colors.darkGray}/>
            </Pressable>
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={() => router.push("/changePassword")}>
            <Icon name="lock" size={20} color={theme.colors.darkGray} style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>Change Password</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleLogout}>
            <Icon name="logOut" size={20} color={theme.colors.red} style={styles.buttonIcon}/>
            <Text style={[styles.buttonText, { color: theme.colors.red }]}>Logout</Text>
          </Pressable>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationsContainer}>
            <View style={styles.notificationsRow}>
                <View style={styles.notificationsTextContainer}>
                    <Icon name="bell" size={20} color={theme.colors.darkGray} style={styles.icon}/>
                    <Text style={styles.infoText}>App Notifications</Text>
                </View>
                <Switch
                    trackColor={{ false: theme.colors.darkGray, true: theme.colors.primary }}
                    thumbColor={theme.colors.light}
                    onValueChange={() => setNotificationsEnabled((prev) => !prev)}
                    value={notificationsEnabled}
                    style={styles.switch}
                />
            </View>
        </View>
        <Text style={styles.unavailableText}>
            (This option is not available yet)
        </Text>
        
        {/* Delete Account Section */}
        <View style={styles.deleteSectionContainer}>
          <Pressable style={styles.deleteButton} onPress={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator color={theme.colors.light} />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* ✅ MODAL ÚNICO Y DINÁMICO */}
      {modalConfig && (
        <CustomModal
          isVisible={!!modalConfig}
          onClose={() => setModalConfig(null)}
          iconName={modalConfig.iconName}
          iconColor={modalConfig.iconColor}
          title={modalConfig.title}
          description={modalConfig.description}
          primaryButtonTitle={modalConfig.primaryButtonTitle}
          onPrimaryButtonPress={
            modalConfig.onPrimaryButtonPress || (() => setModalConfig(null))
          }
          primaryButtonColor={modalConfig.primaryButtonColor}
          secondaryButtonTitle={modalConfig.secondaryButtonTitle}
          onSecondaryButtonPress={
            modalConfig.onSecondaryButtonPress || (() => setModalConfig(null))
          }
        />
      )}
    </ScreenWrapper>
  );
};


// ... Tus estilos se quedan exactamente igual
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: theme.colors.light,
  },
  sectionTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginTop: hp(3),
    marginBottom: hp(1.5),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  headerTitle: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.colors.dark,
    textAlign: "center",
    flex: 1,
    marginLeft: -wp(7),
  },
  inputContainer: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: theme.size.medium,
    color: theme.colors.dark,
    paddingVertical: hp(1),
  },
  infoText: {
    flex: 1,
    fontSize: theme.size.medium,
    color: theme.colors.dark,
    paddingVertical: hp(1),
  },
  editIcon: {
    padding: 5,
  },
  buttonContainer: {
    gap: hp(1.5),
  },
  button: {
    flexDirection: 'row',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    alignItems: "center",
    borderColor: theme.colors.gray,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  buttonIcon: {
    marginRight: wp(3),
  },
  buttonText: {
    fontSize: theme.size.medium,
    fontWeight: theme.fonts.medium,
    color: theme.colors.dark,
  },
  notificationsContainer: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  notificationsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  notificationsTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switch: {
    marginLeft: wp(2),
  },
  unavailableText: {
    fontSize: theme.size.sm,
    color: theme.colors.darkGray,
    marginTop: hp(1),
    textAlign: "center",
  },
  deleteSectionContainer: {
    marginTop: hp(5),
  },
  deleteButton: {
    backgroundColor: theme.colors.red,
    padding: hp(1.5),
    borderRadius: theme.radius.xl,
    alignItems: "center",
    opacity: 0.9,
  },
  deleteButtonText: {
    fontSize: theme.size.medium,
    fontWeight: theme.fonts.medium,
    color: theme.colors.light,
  },
});


export default Settings;