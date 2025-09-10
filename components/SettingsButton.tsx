// SettingsButton.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  Text,
  TouchableWithoutFeedback,
	Alert,
} from 'react-native';
import Icon from '@/assets/icons/icons';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import { hp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';

const SettingsButton = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

	const Routes = {
		SETTINGS: '/settings',
		HELP: '/help'
	} as const;

	type RouteKeys = keyof typeof Routes;

	const navigate = (route: RouteKeys) => router.push(Routes[route]);

  const { logout } = useAuth();

  const handleClose = () => setMenuVisible(false);

		const handleLogout = async () => {
		// show confirm modal
		Alert.alert('Confirm', "Are you sure you want to log out?", [
			{
				text: 'Cancel',
				onPress: () => console.log('modal cancelled'),
				style: 'cancel'
			},
			{
				text: 'Logout',
				onPress: () => onLogout(),
				style: 'destructive'
			}
		])
	}

	const onLogout = async () => {
		//setAuth(null)
		const {error} = await supabase.auth.signOut();
		if(error) {
			Alert.alert('Sign out', "Error signing out!")
		}
	}

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
                  onPress={() => {
                    handleClose();
                    handleLogout(); // Logout
                  }}
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
    paddingTop: 60, // espacio desde el top para que aparezca debajo del botón
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
