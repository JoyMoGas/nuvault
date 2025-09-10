import Icon from "@/assets/icons/icons";
import BackButton from "@/components/BackButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { hp, wp } from "@/helpers/common";
import { supabase } from "@/lib/supabase";
import { updateUser, deleteUserAccount } from "@/services/userService";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const Settings = () => {
  const { user, logout, setUserData } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("modal cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign out", "Error signing out!");
    }
  };

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    if (username.trim() === "") {
      Alert.alert("Error", "Username cannot be empty.");
      return;
    }

    const res = await updateUser(user.id, { username: username.trim() });
    if (res.success) {
      console.log("Username updated in the database.");
      setUserData({ username: username.trim() });
      setIsEditing(false);
    } else {
      console.error("Error updating username:", res.msg);
      Alert.alert("Error", "Could not update username. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action is irreversible and will permanently delete all your data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const result = await deleteUserAccount(user?.id);

              if (result.success) {
                Alert.alert(
                  "Success",
                  "Your account has been completely deleted.",
                );
                // User will be automatically signed out by the deleteUserAccount function
              } else {
                Alert.alert(
                  "Error",
                  result.msg || "Could not delete account. Please try again.",
                );
              }
            } catch (error) {
              console.error("Unexpected error:", error);
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.light}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <BackButton size={30} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Sección de Username */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.inputContainer}>
          <View style={styles.usernameRow}>
            <Icon
              name="user"
              size={20}
              color={theme.colors.darkGray}
              style={styles.icon}
            />
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                onEndEditing={handleUpdateUsername}
                autoFocus
              />
            ) : (
              <Text style={styles.infoText}>{username}</Text>
            )}
            <Pressable
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editIcon}
            >
              <Icon
                name={isEditing ? "correct" : "fullEdit"}
                size={20}
                color={theme.colors.darkGray}
              />
            </Pressable>
          </View>
        </View>

        {/* Sección de Seguridad */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.button}
            onPress={() => router.push("/changePassword")}
          >
            <Icon name="lock" size={20} color={theme.colors.darkGray} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Change Password</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleLogout}>
            <Icon
              name="logOut"
              size={20}
              color={theme.colors.red}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: theme.colors.red }]}>
              Logout
            </Text>
          </Pressable>
        </View>

        {/* Sección de Notificaciones */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsRow}>
            <View style={styles.notificationsTextContainer}>
              <Icon
                name="bell"
                size={20}
                color={theme.colors.darkGray}
                style={styles.icon}
              />
              <Text style={styles.infoText}>App Notifications</Text>
            </View>
            <Switch
              trackColor={{
                false: theme.colors.darkGray,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.light}
              onValueChange={() => setNotificationsEnabled((prev) => !prev)}
              value={notificationsEnabled}
              style={styles.switch}
            />
          </View>
        </View>
        <Text style={styles.unavailableText}>
          (This option is not available yet, so it does not affect anything if
          enabled or disabled)
        </Text>

        {/* Sección de Eliminar Cuenta */}
        <View style={styles.deleteSectionContainer}>
          <Pressable
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color={theme.colors.light} />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Settings;

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
    backgroundColor: theme.colors.semiWhite,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.semiWhite,
    padding: hp(1.5),
    borderRadius: theme.radius.xl,
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
    backgroundColor: theme.colors.semiWhite,
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
