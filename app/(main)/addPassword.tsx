import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  Switch,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Icon from "@/assets/icons/icons";
import {
  calculatePasswordStrength,
  StrengthLevel,
} from "@/helpers/calculatePasswordStrength";
import { getCategories } from "@/services/categoriesService";
import { addVaultEntry } from "@/services/vaultsService";
import { EncryptionService } from "@/services/encryptionService";
import SuccessModal from "@/components/SuccessModal";

interface Category {
  id: string;
  name: string;
}

// Enum para identificar los inputs
enum FocusedField {
  Service = "service",
  Email = "email",
  Password = "password",
}

const AddPassword = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<{
    level: StrengthLevel;
    score: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusedField | null>(null);
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const serviceNameRef = useRef("");
  const usernameRef = useRef("");
  const passwordRef = useRef("");

  useEffect(() => {
    (async () => {
      if (!EncryptionService.isMasterKeySet()) {
        EncryptionService.setTempMasterKey();
      }
      const res = await getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setCategories([]);
        console.error("No categories found or failed to fetch:", res.error);
      }
    })();
  }, []);

  const handlePasswordChange = (value: string) => {
    passwordRef.current = value;
    if (value) setPasswordStrength(calculatePasswordStrength(value));
    else setPasswordStrength(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryPickerVisible(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push("/home");
  };

  const handleAddPassword = async () => {
    if (
      !serviceNameRef.current ||
      !usernameRef.current ||
      !passwordRef.current ||
      !selectedCategory
    ) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      if (!EncryptionService.isMasterKeySet()) {
        Alert.alert(
          "Security Setup Required",
          "Please set up your master password first.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Setup", onPress: () => router.push("/security-setup") },
          ],
        );
        setLoading(false);
        return;
      }
      const strengthResult = calculatePasswordStrength(passwordRef.current);
      const encryptedPassword = EncryptionService.encryptPassword(
        passwordRef.current,
      );
      const result = await addVaultEntry({
        category_id: selectedCategory,
        service_name: serviceNameRef.current,
        service_username: usernameRef.current,
        password: encryptedPassword,
        strength: strengthResult.level,
        strength_score: strengthResult.score,
        is_favorite: favorite,
      });
      setLoading(false);
      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", result.msg || "Failed to save password");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error adding password:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedCategory)?.name ||
    "Select a Category";

  return (
    <ScreenWrapper bg="#f8f8f8">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BackButton size={30} />
          <Text style={styles.title}>Create New</Text>
        </View>

        <Text style={styles.sectionTitle}>Credentials</Text>

        <Text style={styles.label}>Select Category</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setCategoryPickerVisible(true)}
        >
          <Text
            style={[styles.pickerText, !selectedCategory && { color: "grey" }]}
          >
            {selectedCategoryName}
          </Text>
          <Icon name="arrowDown" size={20} color="grey" />
        </TouchableOpacity>

        {/* Modal para seleccionar categoría */}
        <Modal
          visible={isCategoryPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCategoryPickerVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setCategoryPickerVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select a Category</Text>
                    <TouchableOpacity
                      onPress={() => setCategoryPickerVisible(false)}
                    >
                      <Icon name="close" color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => handleCategorySelect(item.id)}
                      >
                        <Text style={styles.categoryItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Text style={styles.label}>Service Name</Text>
        <Input
          icon={<Icon name="service" size={26} />}
          placeholder="e.g., Google, Facebook, etc."
          onChangeText={(value) => (serviceNameRef.current = value)}
          containerStyle={
            focusedInput === FocusedField.Service ? styles.focusedInput : null
          }
          onFocus={() => setFocusedInput(FocusedField.Service)}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Email or Username</Text>
        <Input
          icon={<Icon name="user" size={26} />}
          placeholder="e.g., your_username"
          onChangeText={(value) => (usernameRef.current = value)}
          containerStyle={
            focusedInput === FocusedField.Email ? styles.focusedInput : null
          }
          onFocus={() => setFocusedInput(FocusedField.Email)}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Password</Text>
        <Input
          icon={<Icon name="lock" size={26} />}
          placeholder="Enter password"
          secureTextEntry
          onChangeText={handlePasswordChange}
          containerStyle={
            focusedInput === FocusedField.Password ? styles.focusedInput : null
          }
          onFocus={() => setFocusedInput(FocusedField.Password)}
          onBlur={() => setFocusedInput(null)}
        />

        {passwordStrength && (
          <View style={styles.strengthContainer}>
            <Text
              style={[
                styles.strengthText,
                { color: getColorForStrength(passwordStrength.level) },
              ]}
            >
              Strength: {passwordStrength.level}
            </Text>
            <View style={styles.strengthBar}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: getColorForStrength(
                      passwordStrength.level,
                    ),
                  },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.favoriteContainer}>
          <Text style={styles.label}>Add to Favorites</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#FFD700" }}
            thumbColor={"#f4f3f4"}
            onValueChange={setFavorite}
            value={favorite}
          />
        </View>

        <Button
          title="Add New Password"
          loading={loading}
          onPress={handleAddPassword}
          buttonStyle={styles.mainButton}
          textStyle={styles.mainButtonText}
        />
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        message="Password saved successfully!"
        onClose={handleSuccessModalClose}
        iconName="correct"
        iconColor="#22C55E"
        autoCloseDelay={2500}
      />
    </ScreenWrapper>
  );
};

const getColorForStrength = (level: StrengthLevel) => {
  switch (level) {
    case "Very Weak":
      return "#EF4444";
    case "Weak":
      return "#F59E0B";
    case "Medium":
      return "#EAB308";
    case "Strong":
      return "#22C55E";
    case "Very Strong":
      return "#16A34A";
    default:
      return "#E5E7EB";
  }
};

export default AddPassword;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.colors.dark,
    textAlign: "center",
    flex: 1,
    marginLeft: -wp(7),
  },
  sectionTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.dark,
    marginVertical: hp(2),
  },
  label: {
    color: theme.colors.darkGray,
    fontSize: hp(1.8),
    marginTop: hp(2),
    fontWeight: "500",
    marginBottom: hp(1),
  },
  pickerContainer: {
    height: hp(6.5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerText: {
    fontSize: hp(1.8),
    color: theme.colors.dark,
  },
  focusedInput: {
    borderColor: "#FFD700",
    borderWidth: 2,
  },
  strengthContainer: {
    marginVertical: hp(1),
  },
  strengthText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    marginBottom: hp(1),
  },
  strengthBar: {
    height: hp(0.7),
    backgroundColor: "#E5E7EB",
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: theme.radius.sm,
  },
  favoriteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: hp(3),
  },
  mainButton: {
    backgroundColor: "#FFD700",
    height: hp(7),
  },
  mainButtonText: {
    color: theme.colors.dark,
    fontWeight: "bold",
    fontSize: hp(2.2),
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    maxHeight: "60%",
    borderRadius: theme.radius.xl,
    padding: wp(5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: hp(1.5),
    marginBottom: hp(1.5),
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  closeButtonText: {
    fontSize: hp(1.8),
    color: theme.colors.primary,
    fontWeight: "600",
  },
  categoryItem: {
    paddingVertical: hp(1.8),
  },
  categoryItemText: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
  },
});