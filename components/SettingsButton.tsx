import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from '@/assets/icons/icons';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import { hp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import CustomModal from './CustomModal'; // ✅ 1. Importar nuestro modal

const SettingsButton = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  // ✅ 2. Añadir estado para la configuración del modal
  const [modalConfig, setModalConfig] = useState<any>(null);
  const router = useRouter();

  const Routes = {
    SETTINGS: '/settings',
    HELP: '/help'
  } as const;

  type RouteKeys = keyof typeof Routes;

  const navigate = (route: RouteKeys) => router.push(Routes[route]);

  const { logout } = useAuth();

  const handleClose = () => setMenuVisible(false);

  // ✅ 3. Refactorizar la lógica de Logout
  const handleLogout = () => {
    handleClose(); // Primero, cierra el menú de opciones
    setModalConfig({
        iconName: "logOut",
        iconColor: theme.colors.red,
        title: "Confirm Logout",
        description: "Are you sure you want to log out?",
        primaryButtonTitle: "Logout",
        onPrimaryButtonPress: executeLogout,
        primaryButtonColor: theme.colors.red,
        secondaryButtonTitle: "Cancel",
    });
  };

  const executeLogout = async () => {
    setModalConfig(null); // Cierra el modal de confirmación
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Si hay un error al cerrar sesión, muestra un modal de error
      setModalConfig({
        iconName: "error",
        iconColor: theme.colors.red,
        title: "Error",
        description: "An error occurred while signing out. Please try again.",
        primaryButtonTitle: "OK",
      });
    }
    // Si el logout es exitoso, el listener de `onAuthStateChange` en tu AuthProvider se encargará de redirigir al usuario.
  };

  return (
    <View>
      <Pressable onPress={() => setMenuVisible(true)}>
        <Icon name="settings" size={28} color={theme.colors.light} />
      </Pressable>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    handleClose();
                    navigate('SETTINGS')
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Icon name='settings' color={theme.colors.dark} />
                    <Text style={styles.menuText}>Settings</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.menuItem}
                  onPress={handleLogout} // Llama a la nueva función
                >
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Icon name='logOut' color={theme.colors.dark} />
                    <Text style={styles.menuText}>Logout</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    handleClose();
                    navigate('HELP')
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Icon name='help' color={theme.colors.dark} />
                    <Text style={styles.menuText}>Help</Text>
                  </View>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ✅ 4. Renderizar nuestro modal dinámico */}
      {modalConfig && (
        <CustomModal
            isVisible={!!modalConfig}
            onClose={() => setModalConfig(null)}
            {...modalConfig}
            onPrimaryButtonPress={
                modalConfig.onPrimaryButtonPress || (() => setModalConfig(null))
            }
            onSecondaryButtonPress={
                modalConfig.onSecondaryButtonPress || (() => setModalConfig(null))
            }
        />
      )}
    </View>
  );
};

export default SettingsButton;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menu: {
    alignContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: hp(0.6),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: theme.colors.dark,
    fontWeight: theme.fonts.bold,
  },
});