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
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Icon from "@/assets/icons/icons";
import Button from "@/components/Button";
import {
  calculatePasswordStrength,
  StrengthLevel,
} from "@/helpers/calculatePasswordStrength";
import { getCategories } from "@/services/categoriesService";
import { fetchVaultById, updateVaultEntry } from "@/services/vaultsService";
import { EncryptionService } from "@/services/encryptionService";
import SuccessModal from "@/components/SuccessModal";

interface Category {
  id: string;
  name: string;
}

// 🔹 CORRECCIÓN: Interfaz Vault consistente con PasswordCard
interface Vault {
  id: string;
  category_id: string; // Cambié a string para consistencia
  service_name: string;
  service_username: string;
  encrypted_password?: string; // Opcional para el caso encriptado
  password?: string; // Opcional para el caso desencriptado
  is_favorite?: boolean;
  strength?: StrengthLevel;
  strength_score?: number;
}

enum FocusedField {
  Service = "service",
  Email = "email",
  Password = "password",
}

const EditPassword = () => {
  const router = useRouter();
  const { vaultId } = useLocalSearchParams();

  const [vaultEntry, setVaultEntry] = useState<Vault | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<{
    level: StrengthLevel;
    score: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusedField | null>(null);
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordModified, setIsPasswordModified] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // 🔹 CORRECCIÓN: Validación de vaultId
      if (!vaultId || typeof vaultId !== 'string') {
        Alert.alert("Error", "ID de vault inválido");
        router.push("/home");
        return;
      }

      if (!EncryptionService.isMasterKeySet()) {
        EncryptionService.setTempMasterKey();
      }

      try {
        const [vaultRes, categoriesRes] = await Promise.all([
          fetchVaultById(vaultId),
          getCategories(),
        ]);

        // 🔹 CORRECCIÓN: Manejo mejorado de la respuesta del vault
        if (vaultRes.success && vaultRes.data) {
          const entry = vaultRes.data;
          setVaultEntry(entry);
          setServiceName(entry.service_name || "");
          setUsername(entry.service_username || "");
          
          // 🔹 CORRECCIÓN: Manejo de contraseña encriptada
          let decryptedPassword = "";
          try {
            if (entry.encrypted_password) {
              decryptedPassword = EncryptionService.decryptPassword(entry.encrypted_password);
            } else if (entry.password) {
              decryptedPassword = entry.password; // Ya desencriptada
            }
          } catch (decryptError) {
            console.error("Error al desencriptar contraseña:", decryptError);
            Alert.alert("Error", "No se pudo desencriptar la contraseña");
          }
          setPassword(decryptedPassword);
          setSelectedCategory(entry.category_id?.toString() || "");
          setFavorite(entry.is_favorite || false);
          
          if (decryptedPassword) {
            setPasswordStrength(calculatePasswordStrength(decryptedPassword));
          }
        } else {
          console.error("Failed to fetch vault entry:", vaultRes.msg);
          Alert.alert("Error", vaultRes.msg || "Failed to load entry data.");
          router.push("/home");
        }

        // Cargar categorías
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        } else {
          console.error("Failed to fetch categories:", categoriesRes.msg);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Error inesperado al cargar los datos");
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [vaultId, router]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setIsPasswordModified(true);
    if (value) {
      setPasswordStrength(calculatePasswordStrength(value));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryPickerVisible(false);
  };

  const handleUpdatePassword = async () => {
    if (!serviceName || !username || !password || !selectedCategory) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    
    if (!vaultEntry) {
      Alert.alert("Error", "No vault entry data available");
      return;
    }

    setSaving(true);
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
        setSaving(false);
        return;
      }

      const strengthResult = calculatePasswordStrength(password);
      
      // 🔹 CORRECCIÓN: Preparar datos para actualización
      const updates: any = {
        category_id: selectedCategory,
        service_name: serviceName,
        service_username: username,
        strength: strengthResult.level,
        strength_score: strengthResult.score,
        is_favorite: favorite,
      };

      // Solo actualizar la contraseña si fue modificada
      if (isPasswordModified) {
        updates.password = password;
      }

      const result = await updateVaultEntry(vaultEntry.id, updates);
      
      setSaving(false);
      
      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", result.msg || "Failed to update password");
      }
    } catch (error) {
      setSaving(false);
      console.error("Error updating password:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedCategory)?.name ||
    "Select a Category";

  if (loading) {
    return (
      <ScreenWrapper bg="#f8f8f8">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando registro...</Text>
        </View>
      </ScreenWrapper>
    );
  }

	const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push("/home");
  };

  return (
    <ScreenWrapper bg="#f8f8f8">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BackButton size={30} />
          <Text style={styles.title}>Edit Password</Text>
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
          value={serviceName}
          onChangeText={setServiceName}
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
          value={username}
          onChangeText={setUsername}
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
          value={password}
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
          title="Save Changes"
          loading={saving}
          onPress={handleUpdatePassword}
          buttonStyle={styles.mainButton}
          textStyle={styles.mainButtonText}
        />
      </ScrollView>

			<SuccessModal
        visible={showSuccessModal}
        message="Password edited successfully!"
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
export default EditPassword;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(2),
    color: theme.colors.darkGray,
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
    fontWeight: "600",
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
  // Modal styles
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
  categoryItem: {
    paddingVertical: hp(1.8),
  },
  categoryItemText: {
    fontSize: hp(2),
    color: theme.colors.darkGray,
  },
	
});